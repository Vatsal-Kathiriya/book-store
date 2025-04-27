"use client";

import React, { useState } from 'react';
import { FiDownload, FiCalendar, FiFilter, FiRefreshCw, FiCheck } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

export default function ExportUsersPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const [selectedFields, setSelectedFields] = useState({
    name: true,
    email: true,
    role: true,
    createdAt: true,
    lastLogin: true,
    status: true,
    orderCount: false,
    totalSpent: false,
    address: false,
    phone: false
  });
  const router = useRouter();

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportComplete(false);
    
    // Simulate export progress
    const progressInterval = setInterval(() => {
      setExportProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 20);
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return newProgress;
      });
    }, 500);
    
    try {
      // In a real app, you would:
      // 1. Make API call to generate the export based on filters and selected fields
      // 2. Wait for the export to be generated
      // 3. Download the file or provide a download link
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate export completion
      clearInterval(progressInterval);
      setExportProgress(100);
      setExportComplete(true);
      
      // Simulate file download (in a real app, this would be handled by the backend)
      setTimeout(() => {
        const format = exportFormat.toLowerCase();
        const blob = new Blob([generateMockContent(format)], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user_export_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 500);
      
    } catch (error) {
      console.error('Error exporting users:', error);
      // Handle error
    }
  };
  
  // Generate mock content for download
  const generateMockContent = (format: string) => {
    const mockUsers = [
      { name: 'John Doe', email: 'john@example.com', role: 'user', createdAt: '2023-01-15', status: 'active' },
      { name: 'Jane Smith', email: 'jane@example.com', role: 'user', createdAt: '2023-02-20', status: 'active' },
      { name: 'Admin User', email: 'admin@example.com', role: 'admin', createdAt: '2022-11-05', status: 'active' },
    ];
    
    if (format === 'csv') {
      // Generate CSV
      const headers = Object.keys(selectedFields)
        .filter(field => selectedFields[field as keyof typeof selectedFields])
        .join(',');
      
      const rows = mockUsers.map(user => {
        return Object.keys(selectedFields)
          .filter(field => selectedFields[field as keyof typeof selectedFields])
          .map(field => user[field as keyof typeof user] || '')
          .join(',');
      }).join('\n');
      
      return `${headers}\n${rows}`;
    } else {
      // Generate JSON
      const filteredUsers = mockUsers.map(user => {
        const filteredUser: Record<string, any> = {};
        Object.keys(selectedFields).forEach(field => {
          if (selectedFields[field as keyof typeof selectedFields]) {
            filteredUser[field] = user[field as keyof typeof user] || null;
          }
        });
        return filteredUser;
      });
      
      return JSON.stringify(filteredUsers, null, 2);
    }
  };

  const resetForm = () => {
    setExportFormat('csv');
    setFilters({
      role: '',
      status: '',
      startDate: '',
      endDate: '',
    });
    setExportComplete(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Export Users</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Export user data to CSV or JSON format
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link href="/admin/users" className="btn btn-outline inline-flex items-center">
            Back to Users
          </Link>
        </div>
      </div>

      {/* Export Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Export Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Export Format & Filters</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Format
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input 
                      type="radio" 
                      name="exportFormat" 
                      value="csv" 
                      checked={exportFormat === 'csv'}
                      onChange={() => setExportFormat('csv')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">CSV</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input 
                      type="radio" 
                      name="exportFormat" 
                      value="json"
                      checked={exportFormat === 'json'} 
                      onChange={() => setExportFormat('json')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">JSON</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User Role
                </label>
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white p-2"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white p-2"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Registration Date Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Start Date"
                    />
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  
                  <div className="relative">
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="End Date"
                    />
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">Fields to Export</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(selectedFields).map((field) => (
                  <label key={field} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFields[field as keyof typeof selectedFields]}
                      onChange={() => handleFieldToggle(field)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {field === 'createdAt' ? 'Registration Date' : 
                       field === 'totalSpent' ? 'Total Spent' :
                       field === 'orderCount' ? 'Order Count' : field}
                    </span>
                  </label>
                ))}
              </div>
              
              {!Object.values(selectedFields).some(Boolean) && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                  Please select at least one field to export
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-between">
          <button
            onClick={resetForm}
            className="btn btn-outline inline-flex items-center"
          >
            <FiRefreshCw className="mr-2" /> Reset Options
          </button>
          
          <button
            onClick={handleExport}
            disabled={!Object.values(selectedFields).some(Boolean) || isExporting}
            className="btn btn-primary inline-flex items-center min-w-[150px]"
          >
            {isExporting ? (
              exportComplete ? (
                <>
                  <FiCheck className="mr-2" /> Export Complete
                </>
              ) : (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Exporting {exportProgress}%
                </>
              )
            ) : (
              <>
                <FiDownload className="mr-2" /> Export Users
              </>
            )}
          </button>
        </div>
      </div>

      {/* Export Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Export Preview</h2>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-750">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Format:</span>
              <span className="text-gray-900 dark:text-white uppercase">{exportFormat}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Fields:</span>
              <span className="text-gray-900 dark:text-white">
                {Object.keys(selectedFields)
                  .filter(field => selectedFields[field as keyof typeof selectedFields])
                  .map(field => field.charAt(0).toUpperCase() + field.slice(1))
                  .join(', ') || 'No fields selected'}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Filters:</span>
              <span className="text-gray-900 dark:text-white">
                {[
                  filters.role && `Role: ${filters.role}`,
                  filters.status && `Status: ${filters.status}`,
                  (filters.startDate || filters.endDate) && 
                    `Date: ${filters.startDate || 'Any'} to ${filters.endDate || 'Any'}`
                ].filter(Boolean).join(', ') || 'No filters applied'}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Estimated Records:</span>
              <span className="text-gray-900 dark:text-white">842</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p className="flex items-center">
            <FiFilter className="mr-1" /> 
            Apply filters in the configuration section above to refine your export
          </p>
        </div>
      </div>
    </div>
  );
}
