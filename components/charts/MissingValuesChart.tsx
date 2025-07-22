import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ColumnAnalysis } from '../../types';

/**
 * Props for the MissingValuesChart component.
 */
interface MissingValuesChartProps {
  data: ColumnAnalysis[];
}

/**
 * A bar chart component using Recharts to visualize the number of missing values for each column.
 * It only displays columns that have at least one missing value.
 */
const MissingValuesChart: React.FC<MissingValuesChartProps> = ({ data }) => {
  // Filter and transform the analysis data for the chart.
  // Only include columns with missingCount > 0.
  const chartData = data
    .filter(col => col.missingCount > 0)
    .map(col => ({
      name: col.name,
      'Missing Values': col.missingCount,
    }))
    .sort((a, b) => b['Missing Values'] - a['Missing Values']);

  // If no columns have missing values, display a message instead of the chart.
  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">No missing values found.</div>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 10,
            left: -10, // Adjust left margin for better axis label visibility
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
          <XAxis dataKey="name" stroke="#a0aec0" tick={{ fontSize: 12 }} />
          <YAxis stroke="#a0aec0" allowDecimals={false} />
          <Tooltip
            cursor={{ fill: 'rgba(147, 197, 253, 0.1)' }}
            contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #2d3748', borderRadius: '0.5rem' }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Legend wrapperStyle={{ color: '#e2e8f0', fontSize: '14px' }} />
          <Bar dataKey="Missing Values" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MissingValuesChart;
