import Papa from 'papaparse';
import { TableRow, ColumnType, ColumnAnalysis, CleaningAction, FeatureEngineeringInfo, AnalysisReport } from '../types';

/**
 * Parses a CSV file into an array of objects using PapaParse.
 * @param file The CSV file to parse.
 * @returns A promise that resolves with an array of TableRow objects.
 */
const parseCSV = (file: File): Promise<TableRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,        // Treat the first row as headers.
      skipEmptyLines: true, // Ignore empty lines.
      dynamicTyping: true,  // Automatically convert numbers and booleans.
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV Parsing Error: ${results.errors[0].message}`));
        } else {
          // Resolve with the parsed data, casting it to our TableRow type.
          resolve(results.data as TableRow[]);
        }
      },
      error: (error: Error) => reject(error),
    });
  });
};

/**
 * Infers the data type of a column based on its values.
 * Uses a set of heuristics to classify as Numeric, Date, Categorical, or Text.
 * @param values An array of values from a single column.
 * @returns The inferred ColumnType.
 */
const inferColumnType = (values: any[]): ColumnType => {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonNullValues.length === 0) return ColumnType.UNKNOWN;

  // Check for numeric type.
  const isNumeric = nonNullValues.every(v => typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v)) && v.trim() !== ''));
  if (isNumeric) return ColumnType.NUMERIC;
  
  // Check for date type (simple check).
  const isDate = nonNullValues.every(v => typeof v === 'string' && !isNaN(Date.parse(v)));
  if (isDate) return ColumnType.DATE;

  // Check for categorical type based on the ratio of unique values.
  const uniqueRatio = new Set(nonNullValues).size / nonNullValues.length;
  if (uniqueRatio < 0.5 && nonNullValues.length > 10) return ColumnType.CATEGORICAL;

  // Default to text type.
  return ColumnType.TEXT;
};

/**
 * The core data processing engine. It orchestrates parsing, analysis, cleaning,
 * and feature engineering.
 * @param file The user-uploaded CSV file.
 * @returns A promise that resolves with the analysis report and the cleaned data.
 */
export const processData = async (file: File): Promise<{ report: AnalysisReport; cleanedData: TableRow[] }> => {
  const startTime = performance.now();
  const rawData = await parseCSV(file);
  const initialRows = rawData.length;
  if (initialRows === 0) throw new Error("CSV file is empty or contains only headers.");
  
  const headers = Object.keys(rawData[0]);
  const initialCols = headers.length;

  // Create a deep copy of the data to modify.
  let cleanedData = JSON.parse(JSON.stringify(rawData)) as TableRow[];
  const columnAnalyses: ColumnAnalysis[] = [];
  const cleaningActions: CleaningAction[] = [];
  const featureEngineering: FeatureEngineeringInfo[] = [];

  // Process each column.
  for (const header of headers) {
    const values = cleanedData.map(row => row[header]);
    const type = inferColumnType(values);
    
    // Separate values by type for statistical calculations.
    let numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));
    let stringValues = values.filter(v => typeof v === 'string' && v.trim() !== '') as string[];
    
    const analysis: ColumnAnalysis = {
        name: header,
        type: type,
        missingCount: values.filter(v => v === null || v === undefined || v === '').length,
        stats: {},
    };

    // --- Analysis and Cleaning ---
    if (type === ColumnType.NUMERIC) {
      const sum = numericValues.reduce((a, b) => a + b, 0);
      const mean = sum / numericValues.length || 0;
      numericValues.sort((a, b) => a - b);
      const median = numericValues.length % 2 === 0 
        ? (numericValues[numericValues.length / 2 - 1] + numericValues[numericValues.length / 2]) / 2 
        : numericValues[Math.floor(numericValues.length / 2)];
      analysis.stats = { mean, median, min: numericValues[0], max: numericValues[numericValues.length - 1] };
      
      // Impute missing numeric values with the mean.
      if (analysis.missingCount > 0) {
        cleanedData.forEach(row => {
            if (row[header] === null || row[header] === undefined || row[header] === '') {
                row[header] = mean;
            }
        });
        cleaningActions.push({ column: header, action: 'Filled missing values', details: `Used mean (${mean.toFixed(2)})` });
      }

    } else if (type === ColumnType.CATEGORICAL || type === ColumnType.DATE) {
        // Calculate mode for categorical and date columns.
        const counts: Record<string, number> = {};
        stringValues.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
        const mode = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, '');
        analysis.stats = { mode: mode, uniqueValues: new Set(stringValues).size };

        // Impute missing categorical/date values with the mode.
        if (analysis.missingCount > 0) {
            cleanedData.forEach(row => {
                if (row[header] === null || row[header] === undefined || row[header] === '') {
                    row[header] = mode;
                }
            });
            cleaningActions.push({ column: header, action: 'Filled missing values', details: `Used mode ('${mode}')` });
        }
    } else if (type === ColumnType.TEXT) {
         analysis.stats = { uniqueValues: new Set(stringValues).size };
    }

    columnAnalyses.push(analysis);

    // --- Feature Engineering ---
    if (type === ColumnType.DATE) {
        const newCols = [`${header}_year`, `${header}_month`, `${header}_day`];
        cleanedData.forEach(row => {
            try {
                const date = new Date(row[header] as string);
                if (!isNaN(date.getTime())) {
                    row[newCols[0]] = date.getFullYear();
                    row[newCols[1]] = date.getMonth() + 1;
                    row[newCols[2]] = date.getDate();
                }
            } catch (e) { /* Ignore invalid date strings */ }
        });
        featureEngineering.push({ sourceColumn: header, newColumns: newCols, description: 'Extracted date parts' });
    } else if (type === ColumnType.TEXT) {
        const newCols = [`${header}_length`, `${header}_word_count`];
        cleanedData.forEach(row => {
            const text = String(row[header] || '');
            row[newCols[0]] = text.length;
            row[newCols[1]] = text.split(/\s+/).filter(Boolean).length;
        });
        featureEngineering.push({ sourceColumn: header, newColumns: newCols, description: 'Calculated text metrics' });
    }
  }

  const endTime = performance.now();
  // Compile the final report object.
  const report: AnalysisReport = {
    fileName: file.name,
    initialRows,
    cleanedRows: cleanedData.length,
    initialCols,
    cleanedCols: Object.keys(cleanedData[0]).length,
    processingTime: (endTime - startTime) / 1000,
    columnAnalyses,
    cleaningActions,
    featureEngineering,
  };

  return { report, cleanedData };
};
