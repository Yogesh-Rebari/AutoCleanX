import React from 'react';
import Papa from 'papaparse';
import { AnalysisReport, TableRow } from '../types';
import { DownloadIcon } from './IconComponents';

/**
 * Props for the DownloadButtons component.
 */
interface DownloadButtonsProps {
  report: AnalysisReport;
  cleanedData: TableRow[];
  reportRef: React.RefObject<HTMLDivElement>;
}

/**
 * Provides buttons for downloading the cleaned data as a CSV file
 * and the analysis report as a self-contained HTML file.
 */
const DownloadButtons: React.FC<DownloadButtonsProps> = ({ report, cleanedData, reportRef }) => {
  
  /**
   * Generates and triggers the download of the cleaned data in CSV format.
   */
  const downloadCSV = () => {
    // Convert the JSON data back to a CSV string.
    const csv = Papa.unparse(cleanedData);
    // Create a Blob from the CSV string.
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cleaned_${report.fileName}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Generates and triggers the download of the analysis report as an HTML file.
   */
  const downloadReport = () => {
    if (!reportRef.current) return;

    const reportHtml = reportRef.current.innerHTML;
    // Create a full HTML document string, embedding Tailwind via CDN and adding custom styles
    // to ensure the downloaded report looks good as a standalone file.
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en" class="dark">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AutoCleanX Report: ${report.fileName}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { background-color: #111827; color: #f3f4f6; font-family: sans-serif; padding: 2rem; }
          .prose { color: #d1d5db; }
          .prose h1, .prose h2, .prose h3, .prose h4 { color: #ffffff; }
          .prose a { color: #60a5fa; }
          .prose strong { color: #ffffff; }
          .prose code { color: #f97316; }
          .prose blockquote { border-left-color: #4b5563; }
        </style>
      </head>
      <body>
        <div class="prose prose-invert max-w-none">${reportHtml}</div>
      </body>
      </html>
    `;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `report_${report.fileName.replace('.csv', '')}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={downloadCSV}
        className="flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
      >
        <DownloadIcon className="w-5 h-5 mr-2" />
        Cleaned CSV
      </button>
      <button
        onClick={downloadReport}
        className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        <DownloadIcon className="w-5 h-5 mr-2" />
        HTML Report
      </button>
    </div>
  );
};

export default DownloadButtons;
