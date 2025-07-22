import React from 'react';
import { CleanIcon } from './IconComponents';

/**
 * The main header component for the application.
 * It displays the application title and logo.
 */
const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-700/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <CleanIcon className="h-8 w-8 text-blue-400" />
            <span className="ml-3 text-2xl font-bold text-white tracking-wider">AutoCleanX</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
