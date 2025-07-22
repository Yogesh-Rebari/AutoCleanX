import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon } from './IconComponents';

/**
 * Props for the FileUpload component.
 */
interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

/**
 * A component that provides a user-friendly interface for uploading CSV files.
 * It supports drag-and-drop and traditional file selection.
 */
const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [error, setError] = useState<string | null>(null);

  /**
   * Callback function for the dropzone. It handles file acceptance and rejection.
   */
  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setError(null);
    if (fileRejections.length > 0) {
      setError('Invalid file type. Please upload a .csv file.');
      return;
    }
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] }, // Only accept CSV files
    multiple: false, // Allow only a single file
  });

  return (
    <div className="w-full max-w-3xl text-center p-8">
      <h1 className="text-4xl font-extrabold text-white mb-2">Welcome to AutoCleanX</h1>
      <p className="text-lg text-gray-400 mb-8">Your intelligent assistant for automated data cleaning and analysis.</p>
      <div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ease-in-out ${
          isDragActive 
            ? 'border-blue-400 bg-gray-700/50 scale-105' 
            : 'border-gray-600 hover:border-blue-500 hover:bg-gray-800/30'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <UploadIcon className="w-16 h-16 text-gray-500 transition-transform duration-300 group-hover:scale-110" />
          {isDragActive ? (
            <p className="text-xl font-semibold text-blue-300">Drop the file here ...</p>
          ) : (
            <div>
              <p className="text-xl font-semibold text-gray-300">Drag & drop your CSV file here</p>
              <p className="text-gray-500 my-2">or</p>
              <p className="px-4 py-2 bg-gray-700 rounded-md font-semibold">Click to select a file</p>
              <p className="text-sm text-gray-500 mt-4">Maximum file size: 50MB</p>
            </div>
          )}
        </div>
      </div>
      {error && <p className="mt-4 text-red-500 animate-pulse">{error}</p>}
    </div>
  );
};

export default FileUpload;
