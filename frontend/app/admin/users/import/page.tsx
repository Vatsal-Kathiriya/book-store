"use client";

import React, { useState, useRef } from 'react';
import { FiUpload, FiAlertCircle, FiCheck, FiDownload, FiInfo } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

interface ImportStats {
  total: number;
  created: number;
  updated: number;
  failed: number;
  details: Array<{
    email: string;
    status: string;
    error?: string;
    name?: string;
  }>;
}

export default function ImportUsersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file type
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload a CSV or Excel file');
        setFile(null);
        return;
      }
      
      // Check file size (limit to 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError('');
    
    // Simulated upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 15);
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 500);
    
    try {
      // In a real app, you would handle the file upload to your server here
      // For now, we'll simulate a server response with mock data
      
      // Read file and parse
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate API call delay 
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful import response
      const mockImportStats: ImportStats = {
        total: 25,
        created: 18,
        updated: 4,
        failed: 3,
        details: [
          { email: 'john.doe@example.com', status: 'created', name: 'John Doe' },
          { email: 'jane.smith@example.com', status: 'created', name: 'Jane Smith' },
          { email: 'existing@example.com', status: 'updated', name: 'Existing User' },
          { email: 'invalid@', status: 'failed', error: 'Invalid email format' },
          { email: 'duplicate@example.com', status: 'failed', error: 'Duplicate email address' },
        ]
      };
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setImportStats(mockImportStats);
      
      // In a real app, you would handle the actual file upload here:
      // const response = await axios.post('/api/admin/users/import', formData);
      // setImportStats(response.data);
      
    } catch (err) {
      clearInterval(progressInterval);
      console.error('Error importing users:', err);
      setError('Failed to import users. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setImportStats(null);
    setError('');
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadTemplate = () => {
    // In a real app, you would generate and download an actual CSV template
    // For this example, we'll just show how you'd set it up
    
    const csvContent = "name,email,password,role\nJohn Doe,john@example.com,password123,user\nJane Smith,jane@example.com,password456,user";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import Users</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Bulk import users from a CSV or Excel file
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link href="/admin/users" className="btn btn-outline inline-flex items-center">
            Back to Users
          </Link>
          <button 
            onClick={downloadTemplate}
            className="btn btn-outline inline-flex items-center"
          >
            <FiDownload className="mr-2" /> Download Template
          </button>
        </div>
      </div>

      {/* File Upload Section */}
      {!importStats && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <div className="text-center space-y-4">
                {file ? (
                  <>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      <FiCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{file.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button 
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                      Remove file
                    </button>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <FiUpload className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upload a file</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Drag and drop or click to browse
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      style={{ zIndex: 1 }}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      CSV or Excel files only, max 5MB
                    </p>
                  </>
                )}
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg">
                <p className="flex items-center"><FiAlertCircle className="mr-2" /> {error}</p>
              </div>
            )}
            
            {/* File Format Requirements */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 p-4 rounded-lg">
              <h4 className="font-medium flex items-center mb-2">
                <FiInfo className="mr-2" /> File Format Requirements
              </h4>
              <ul className="list-disc list-inside text-sm space-y-1 ml-5">
                <li>The file must be in CSV or Excel format</li>
                <li>Required columns: name, email, password, role (user or admin)</li>
                <li>First row must be the header row with column names</li>
                <li>Maximum 500 users per file</li>
                <li>Email addresses must be unique</li>
              </ul>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!file || isUploading}
                className="btn btn-primary inline-flex items-center min-w-[120px]"
              >
                {isUploading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Uploading ({uploadProgress}%)
                  </>
                ) : (
                  <>
                    <FiUpload className="mr-2" /> Upload & Import
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Import Results */}
      {importStats && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Import Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">Total Processed</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{importStats.total}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300">Successfully Created</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{importStats.created}</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">Updated</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{importStats.updated}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300">Failed</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{importStats.failed}</p>
              </div>
            </div>
            
            {/* Details Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Error
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {importStats.details.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {item.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                          item.status === 'created' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          item.status === 'updated' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 dark:text-red-400">
                        {item.error || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-between">
            <button
              onClick={resetForm}
              className="btn btn-outline inline-flex items-center"
            >
              Import Another File
            </button>
            
            <Link
              href="/admin/users"
              className="btn btn-primary inline-flex items-center"
            >
              Go to Users List
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
