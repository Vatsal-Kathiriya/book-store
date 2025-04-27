"use client";

import React, { useState, useEffect } from 'react';
import { 
  FiSave, 
  FiRefreshCw, 
  FiSettings,
  FiShield,
  FiGlobe,
  FiMail,
  FiServer,
  FiDatabase
} from 'react-icons/fi';

export default function AdminSettings() {
  const [generalSettings, setGeneralSettings] = useState({
    storeName: 'Book Store',
    storeDescription: 'Your one-stop destination for all types of books',
    contactEmail: 'contact@bookstore.com',
    supportPhone: '+1 (555) 123-4567',
  });

  const [systemSettings, setSystemSettings] = useState({
    itemsPerPage: 10,
    allowRegistrations: true,
    maintenanceMode: false,
    debugMode: false,
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.example.com',
    smtpPort: 587,
    smtpUsername: 'notifications@bookstore.com',
    smtpPassword: '••••••••',
    senderName: 'Book Store',
    senderEmail: 'notifications@bookstore.com',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', message: '' });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage({ type: '', message: '' });

    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success message
      setSaveMessage({ 
        type: 'success', 
        message: 'Settings saved successfully!' 
      });
      
      // In a real app, you would save to your backend:
      // await settingsService.updateSettings({ 
      //   general: generalSettings,
      //   system: systemSettings,
      //   email: emailSettings
      // });
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage({ 
        type: 'error', 
        message: 'Failed to save settings. Please try again.' 
      });
    } finally {
      setIsSaving(false);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setSaveMessage({ type: '', message: '' });
      }, 5000);
    }
  };

  // Handle input changes for general settings
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle input changes for system settings
  const handleSystemChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSystemSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle input changes for email settings
  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
        
        <button 
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="btn btn-primary inline-flex items-center"
        >
          {isSaving ? (
            <>
              <FiRefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FiSave className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </button>
      </div>

      {saveMessage.message && (
        <div className={`p-4 rounded-md ${
          saveMessage.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
        }`}>
          {saveMessage.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* General Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
          <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <FiGlobe className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">General Settings</h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Store Name
              </label>
              <input
                type="text"
                id="storeName"
                name="storeName"
                value={generalSettings.storeName}
                onChange={handleGeneralChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={generalSettings.contactEmail}
                onChange={handleGeneralChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="supportPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Support Phone
              </label>
              <input
                type="text"
                id="supportPhone"
                name="supportPhone"
                value={generalSettings.supportPhone}
                onChange={handleGeneralChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="storeDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Store Description
              </label>
              <textarea
                id="storeDescription"
                name="storeDescription"
                rows={3}
                value={generalSettings.storeDescription}
                onChange={handleGeneralChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
          <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <FiServer className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">System Settings</h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="itemsPerPage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Items Per Page
              </label>
              <input
                type="number"
                id="itemsPerPage"
                name="itemsPerPage"
                min="5"
                max="100"
                value={systemSettings.itemsPerPage}
                onChange={handleSystemChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowRegistrations"
                  name="allowRegistrations"
                  checked={systemSettings.allowRegistrations}
                  onChange={handleSystemChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="allowRegistrations" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Allow user registrations
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  name="maintenanceMode"
                  checked={systemSettings.maintenanceMode}
                  onChange={handleSystemChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Enable maintenance mode
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="debugMode"
                  name="debugMode"
                  checked={systemSettings.debugMode}
                  onChange={handleSystemChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="debugMode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Enable debug mode
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
          <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <FiMail className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Email Settings</h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="smtpServer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SMTP Server
              </label>
              <input
                type="text"
                id="smtpServer"
                name="smtpServer"
                value={emailSettings.smtpServer}
                onChange={handleEmailChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SMTP Port
              </label>
              <input
                type="number"
                id="smtpPort"
                name="smtpPort"
                value={emailSettings.smtpPort}
                onChange={handleEmailChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SMTP Username
              </label>
              <input
                type="text"
                id="smtpUsername"
                name="smtpUsername"
                value={emailSettings.smtpUsername}
                onChange={handleEmailChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SMTP Password
              </label>
              <input
                type="password"
                id="smtpPassword"
                name="smtpPassword"
                value={emailSettings.smtpPassword}
                onChange={handleEmailChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sender Name
              </label>
              <input
                type="text"
                id="senderName"
                name="senderName"
                value={emailSettings.senderName}
                onChange={handleEmailChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sender Email
              </label>
              <input
                type="email"
                id="senderEmail"
                name="senderEmail"
                value={emailSettings.senderEmail}
                onChange={handleEmailChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="btn inline-flex items-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-300"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" /> Reset to Defaults
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary inline-flex items-center"
          >
            {isSaving ? (
              <>
                <FiRefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
