/**
 * Represents a single row in the dataset. It's a flexible record
 * where keys are column headers (string) and values can be various primitives.
 */
export type TableRow = Record<string, string | number | null | undefined>;

/**
 * Defines the possible states of the application, controlling which view is displayed.
 */
export enum AppState {
  READY_TO_UPLOAD = 'READY_TO_UPLOAD',
  PROCESSING = 'PROCESSING',
  REPORT_READY = 'REPORT_READY',
  ERROR = 'ERROR',
}

/**
 * Enumerates the inferred data types for each column in the dataset.
 */
export enum ColumnType {
  NUMERIC = 'Numeric',
  CATEGORICAL = 'Categorical',
  DATE = 'Date',
  TEXT = 'Text',
  UNKNOWN = 'Unknown',
}

/**
 * Holds calculated statistics for a single column.
 * Properties are optional as they depend on the column's data type.
 */
export interface ColumnStats {
  mean?: number;
  median?: number;
  stdDev?: number;
  min?: number;
  max?: number;
  mode?: string | number;
  uniqueValues?: number;
}

/**
 * Contains the complete analysis for a single column, including its name,
 * inferred type, missing value count, and relevant statistics.
 */
export interface ColumnAnalysis {
  name: string;
  type: ColumnType;
  missingCount: number;
  stats: ColumnStats;
}

/**
 * Records a specific data cleaning action that was performed on a column.
 */
export interface CleaningAction {
  column: string;
  action: string;
  details: string;
}

/**
 * Describes a feature engineering operation, including the source, the new
 * columns created, and a brief description of the transformation.
 */
export interface FeatureEngineeringInfo {
  sourceColumn: string;
  newColumns: string[];
  description: string;
}

/**
 * The main data structure for the entire analysis report, consolidating all
 * metadata, analyses, and transformation logs.
 */
export interface AnalysisReport {
  fileName: string;
  initialRows: number;
  cleanedRows: number;
  initialCols: number;
  cleanedCols: number;
  processingTime: number;
  columnAnalyses: ColumnAnalysis[];
  cleaningActions: CleaningAction[];
  featureEngineering: FeatureEngineeringInfo[];
}

/**
 * Defines the types of machine learning models that can be suggested.
 */
export enum ModelType {
    REGRESSION = 'Regression',
    CLASSIFICATION = 'Classification',
    CLUSTERING = 'Clustering'
}
