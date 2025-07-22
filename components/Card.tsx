import React from 'react';

/**
 * Props for the Card component.
 */
interface CardProps {
  title: string;
  icon?: React.ReactNode;
  value?: string;
  children?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * A generic, reusable card component used to display sections of the report.
 * It provides a consistent look and feel for different content blocks.
 */
const Card: React.FC<CardProps> = ({ title, icon, value, children, fullWidth = false }) => {
  return (
    <div className={`bg-gray-800 border border-gray-700/50 rounded-xl shadow-lg p-6 flex flex-col ${fullWidth ? 'col-span-1 lg:col-span-full' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
        {icon && <div className="text-blue-400 h-6 w-6">{icon}</div>}
      </div>
      <div className="flex-grow">
        {value && <p className="text-3xl font-bold text-white">{value}</p>}
        {children}
      </div>
    </div>
  );
};

export default Card;
