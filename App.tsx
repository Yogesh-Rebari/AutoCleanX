import React, { useState, useCallback } from 'react';
import { AppState, AnalysisReport, TableRow } from './types';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ProcessingView from './components/ProcessingView';
import ReportView from './components/ReportView';
import { processData } from './services/dataProcessor';

/**
 * The root component of the AutoCleanX application.
 * It manages the overall application state and orchestrates the data processing workflow.
 */
const App: React.FC = () => {
  // State to manage the current view (e.g., upload, processing, report).
  const [appState, setAppState] = useState<AppState>(AppState.READY_TO_UPLOAD);
  // State to hold the generated analysis report.
  const [report, setReport] = useState<AnalysisReport | null>(null);
  // State to store the cleaned dataset.
  const [cleanedData, setCleanedData] = useState<TableRow[]>([]);
  // State to capture and display any processing errors.
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles the file upload event. It triggers the data processing service
   * and updates the application state based on the outcome.
   */
  const handleFileUpload = useCallback(async (file: File) => {
    setAppState(AppState.PROCESSING);
    setError(null);
    try {
      const { report: analysisReport, cleanedData: newCleanedData } = await processData(file);
      setReport(analysisReport);
      setCleanedData(newCleanedData);
      setAppState(AppState.REPORT_READY);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during processing.';
      setError(errorMessage);
      setAppState(AppState.ERROR);
    }
  }, []);

  /**
   * Resets the application to its initial state, allowing the user to start over.
   */
  const handleReset = useCallback(() => {
    setAppState(AppState.READY_TO_UPLOAD);
    setReport(null);
    setCleanedData([]);
    setError(null);
  }, []);

  /**
   * Renders the main content based on the current application state.
   */
  const renderContent = () => {
    switch (appState) {
      case AppState.PROCESSING:
        return <ProcessingView />;
      case AppState.REPORT_READY:
        // Ensure report is not null before rendering the report view.
        return report && <ReportView report={report} cleanedData={cleanedData} onReset={handleReset} />;
      case AppState.ERROR:
        return (
          <div className="text-center bg-gray-800 p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Processing Failed</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        );
      case AppState.READY_TO_UPLOAD:
      default:
        return <FileUpload onFileUpload={handleFileUpload} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {/* The main content area dynamically renders different components based on app state. */}
        <div className={`flex-grow flex items-center ${appState === AppState.REPORT_READY ? 'items-start' : 'items-center justify-center'}`}>
            {renderContent()}
        </div>
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm border-t border-gray-800">
        <p>AutoCleanX &copy; {new Date().getFullYear()}. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
