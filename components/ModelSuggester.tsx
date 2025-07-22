import React, { useState, useMemo, useEffect } from 'react';
import { AnalysisReport, ColumnType, ModelType } from '../types';

/**
 * Props for the ModelSuggester component.
 */
interface ModelSuggesterProps {
  report: AnalysisReport;
  onTargetChange: (target: string) => void;
}

/**
 * A component that allows the user to select a target variable and then
 * suggests an appropriate machine learning model (Regression or Classification)
 * based on the target's data type.
 */
const ModelSuggester: React.FC<ModelSuggesterProps> = ({ report, onTargetChange }) => {
  const [selectedColumn, setSelectedColumn] = useState('');

  // Notify the parent component whenever the selected column changes.
  useEffect(() => {
    onTargetChange(selectedColumn);
  }, [selectedColumn, onTargetChange]);
  
  /**
   * Memoized calculation for the ML model suggestion.
   * This logic runs only when the selected column or the report data changes.
   */
  const suggestion = useMemo(() => {
    if (!selectedColumn) {
      return { model: null, reason: 'Please select a target variable to get a model suggestion.' };
    }
    const column = report.columnAnalyses.find(c => c.name === selectedColumn);
    if (!column) {
      return { model: null, reason: 'Column not found.' };
    }

    // Suggest a regression model for numeric targets.
    if (column.type === ColumnType.NUMERIC) {
      return { model: ModelType.REGRESSION, reason: `The target '${column.name}' is numeric, suggesting a regression task.`, modelName: "Linear Regression or Gradient Boosting" };
    }

    // Suggest a classification model for categorical targets.
    if (column.type === ColumnType.CATEGORICAL) {
       if (column.stats.uniqueValues === 2) {
         return { model: ModelType.CLASSIFICATION, reason: `The target '${column.name}' is binary (2 unique values), suggesting a binary classification task.`, modelName: "Logistic Regression or a simple Neural Network" };
       }
       return { model: ModelType.CLASSIFICATION, reason: `The target '${column.name}' is categorical (${column.stats.uniqueValues} unique values), suggesting a multi-class classification task.`, modelName: "Decision Tree or Random Forest" };
    }
    
    // Handle cases where the column type is not suitable for a simple baseline.
    return { model: null, reason: `The column type '${column.type}' is not suitable for a simple regression or classification baseline.` };

  }, [selectedColumn, report.columnAnalyses]);

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
      <h4 className="font-semibold text-gray-200 mb-2">ML Model Suggestion</h4>
      <p className="text-sm text-gray-400 mb-4">Select the column you want to predict (your target variable).</p>
      <div className="flex items-center space-x-4">
        <label htmlFor="target-variable" className="text-sm font-medium text-gray-300">Target:</label>
        <select
          id="target-variable"
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        >
          <option value="">-- Select a column --</option>
          {report.columnAnalyses.map(col => (
            <option key={col.name} value={col.name}>{col.name}</option>
          ))}
        </select>
      </div>
      
      <div className="mt-4 p-4 bg-gray-900/50 rounded-md min-h-[100px]">
          <p className="text-sm text-gray-400">{suggestion.reason}</p>
          {suggestion.model && (
            <>
                <p className="mt-2 text-lg font-bold">
                    Suggested Type: <span className="text-blue-400">{suggestion.model}</span>
                </p>
                <p className="mt-1 text-md font-semibold">
                    Baseline Algorithm: <span className="text-green-400">{suggestion.modelName}</span>
                </p>
            </>
          )}
      </div>
    </div>
  );
};

export default ModelSuggester;
