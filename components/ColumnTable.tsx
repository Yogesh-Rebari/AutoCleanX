import React from 'react';
import { ColumnAnalysis, ColumnType } from '../types';

/**
 * Props for the ColumnTable component.
 */
interface ColumnTableProps {
  columns: ColumnAnalysis[];
}

/**
 * Formats a value for display in the table.
 * If the value is a number, it's formatted to two decimal places.
 * Otherwise, it returns the value or 'N/A' if null/undefined.
 * @param value The value to format.
 * @returns The formatted string.
 */
const formatValue = (value: any): string => {
    if (typeof value === 'number') {
        return value.toFixed(2);
    }
    return value || 'N/A';
};

/**
 * Returns a Tailwind CSS color class based on the column type for styling.
 * @param type The column type.
 * @returns A string containing Tailwind CSS classes.
 */
const getColumnTypeColor = (type: ColumnType): string => {
    switch(type) {
        case ColumnType.NUMERIC: return 'text-blue-400 bg-blue-900/50';
        case ColumnType.CATEGORICAL: return 'text-purple-400 bg-purple-900/50';
        case ColumnType.DATE: return 'text-green-400 bg-green-900/50';
        case ColumnType.TEXT: return 'text-yellow-400 bg-yellow-900/50';
        default: return 'text-gray-500 bg-gray-700/50';
    }
}

/**
 * A component that renders a detailed table of column analysis data.
 * It displays statistics like data type, missing values, mean, and median for each column.
 */
const ColumnTable: React.FC<ColumnTableProps> = ({ columns }) => {
  return (
    <div className="overflow-x-auto max-h-96">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50 sticky top-0 z-10 backdrop-blur-sm">
          <tr>
            <th scope="col" className="px-4 py-3">Column Name</th>
            <th scope="col" className="px-4 py-3 text-center">Type</th>
            <th scope="col" className="px-4 py-3 text-center">Missing</th>
            <th scope="col" className="px-4 py-3 text-right">Mean / Mode</th>
            <th scope="col" className="px-4 py-3 text-right">Median / Uniques</th>
          </tr>
        </thead>
        <tbody>
          {columns.map((col) => (
            <tr key={col.name} className="border-b border-gray-700 hover:bg-gray-700/40">
              <th scope="row" className="px-4 py-3 font-medium text-white whitespace-nowrap">{col.name}</th>
              <td className="px-4 py-3 text-center">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getColumnTypeColor(col.type)}`}>
                  {col.type}
                </span>
              </td>
              <td className="px-4 py-3 text-center">{col.missingCount > 0 ? <span className="text-yellow-400">{col.missingCount}</span> : '0'}</td>
              <td className="px-4 py-3 text-right font-mono">{formatValue(col.stats.mean ?? col.stats.mode)}</td>
              <td className="px-4 py-3 text-right font-mono">{formatValue(col.stats.median ?? col.stats.uniqueValues)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ColumnTable;
