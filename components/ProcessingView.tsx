import React, { useState, useEffect } from 'react';
import { SpinnerIcon } from './IconComponents';

/**
 * A view displayed while the application is processing the uploaded data.
 * It shows a spinner and cycles through status messages to inform the user.
 */
const ProcessingView: React.FC = () => {
    const [message, setMessage] = useState('Analyzing columns...');
    
    // An array of messages to cycle through during processing.
    const messages = [
        'Analyzing columns...',
        'Detecting missing values...',
        'Identifying outliers...',
        'Cleaning data...',
        'Performing feature engineering...',
        'Generating final report...',
    ];

    useEffect(() => {
        // Set up an interval to change the displayed message every 2 seconds.
        let messageIndex = 0;
        const interval = setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            setMessage(messages[messageIndex]);
        }, 2000);

        // Clean up the interval when the component unmounts.
        return () => clearInterval(interval);
    }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8 bg-gray-800/50 rounded-xl">
      <SpinnerIcon className="w-16 h-16 text-blue-500" />
      <h2 className="text-2xl font-bold text-white">Processing Your Data</h2>
      <p className="text-gray-400 animate-pulse transition-all duration-300 w-64 text-center">{message}</p>
    </div>
  );
};

export default ProcessingView;
