import React, { useState, useCallback, useRef } from 'react';
import { AnalysisReport, TableRow } from '../types';
import Card from './Card';
import ColumnTable from './ColumnTable';
import ModelSuggester from './ModelSuggester';
import DownloadButtons from './DownloadButtons';
import MissingValuesChart from './charts/MissingValuesChart';
import { CleanIcon, FeatureIcon, SummaryIcon, AIIcon, SpinnerIcon } from './IconComponents';
import { getGeminiAnalysis } from '../services/geminiService';

/**
 * Props for the ReportView component.
 */
interface ReportViewProps {
  report: AnalysisReport;
  cleanedData: TableRow[];
  onReset: () => void;
}

/**
 * The main dashboard component for displaying the full analysis report.
 * It organizes various sub-components into a cohesive layout and handles
 * the logic for fetching AI-powered insights.
 */
const ReportView: React.FC<ReportViewProps> = ({ report, cleanedData, onReset }) => {
    // State to store the AI-generated analysis text.
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    // State to manage the loading status of the AI analysis request.
    const [isAiLoading, setIsAiLoading] = useState(false);
    // State to hold any errors from the AI analysis request.
    const [aiError, setAiError] = useState<string | null>(null);
    // State to track the user-selected target variable for ML suggestions.
    const [targetVariable, setTargetVariable] = useState<string>('');

    // A ref to the main report container, used for the HTML download functionality.
    const reportRef = useRef<HTMLDivElement>(null);

    /**
     * Fetches analysis from the Gemini API based on the report data and selected target variable.
     */
    const handleGetAIAnalysis = useCallback(async () => {
        setIsAiLoading(true);
        setAiError(null);
        try {
            const analysis = await getGeminiAnalysis(report, targetVariable);
            setAiAnalysis(analysis);
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to get AI analysis.';
            setAiError(errorMessage);
        } finally {
            setIsAiLoading(false);
        }
    }, [report, targetVariable]);

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-white">Analysis Report: <span className="text-blue-400">{report.fileName}</span></h1>
            <div className="flex items-center space-x-2">
              <DownloadButtons report={report} cleanedData={cleanedData} reportRef={reportRef} />
              <button
                onClick={onReset}
                className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                Analyze Another
              </button>
            </div>
        </div>

        <div ref={reportRef} className="space-y-6 bg-gray-900 p-4 rounded-lg">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card icon={<SummaryIcon />} title="Rows Processed" value={`${report.initialRows} → ${report.cleanedRows}`} />
                <Card icon={<SummaryIcon />} title="Columns Processed" value={`${report.initialCols} → ${report.cleanedCols}`} />
                <Card icon={<SummaryIcon />} title="Processing Time" value={`${report.processingTime.toFixed(2)}s`} />
                <Card icon={<SummaryIcon />} title="Missing Values Found" value={report.columnAnalyses.reduce((acc, col) => acc + col.missingCount, 0).toString()} />
            </div>

            {/* Column Analysis & Missing Values Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <Card title="Column Analysis" fullWidth>
                        <ColumnTable columns={report.columnAnalyses} />
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card title="Missing Values by Column" fullWidth>
                        <MissingValuesChart data={report.columnAnalyses} />
                    </Card>
                </div>
            </div>

            {/* Cleaning and Feature Engineering */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card icon={<CleanIcon />} title="Cleaning Actions" fullWidth>
                    <ul className="space-y-2 text-sm text-gray-300 max-h-60 overflow-y-auto pr-2">
                        {report.cleaningActions.length > 0 ? report.cleaningActions.map((action, index) => (
                            <li key={index} className="p-2 bg-gray-800 rounded-md">
                                <span className="font-semibold text-blue-400">{action.column}:</span> {action.action} - <span className="text-gray-400">{action.details}</span>
                            </li>
                        )) : <li className="text-gray-400 p-2">No cleaning actions were required.</li>}
                    </ul>
                </Card>
                <Card icon={<FeatureIcon />} title="Feature Engineering" fullWidth>
                     <ul className="space-y-2 text-sm text-gray-300 max-h-60 overflow-y-auto pr-2">
                        {report.featureEngineering.length > 0 ? report.featureEngineering.map((feat, index) => (
                            <li key={index} className="p-2 bg-gray-800 rounded-md">
                                <span className="font-semibold text-green-400">From '{feat.sourceColumn}':</span> Created [{feat.newColumns.join(', ')}]. <span className="text-gray-400">({feat.description})</span>
                            </li>
                        )) : <li className="text-gray-400 p-2">No new features were engineered.</li>}
                    </ul>
                </Card>
            </div>

            {/* ML Model Suggester and AI Analysis */}
            <Card icon={<AIIcon />} title="AI-Powered Insights & Suggestions" fullWidth>
                <div className="p-2">
                    <ModelSuggester report={report} onTargetChange={setTargetVariable} />

                    <div className="mt-6">
                        <button 
                          onClick={handleGetAIAnalysis}
                          disabled={isAiLoading || !targetVariable}
                          className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAiLoading ? <SpinnerIcon className="w-5 h-5 mr-2" /> : <AIIcon className="w-5 h-5 mr-2" />}
                            {isAiLoading ? 'Generating Insights...' : (targetVariable ? 'Get Gemini Analysis' : 'Select a Target Variable First')}
                        </button>
                    </div>

                    {aiError && <div className="mt-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-md">{aiError}</div>}

                    {aiAnalysis && (
                        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg prose prose-invert prose-sm max-w-none">
                            <h4 className="text-lg font-semibold text-white mb-2 border-b border-gray-700 pb-2">Gemini Analysis</h4>
                            <div className="markdown-content" dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br />') }} />
                        </div>
                    )}
                </div>
            </Card>
        </div>
    </div>
  );
};

export default ReportView;
