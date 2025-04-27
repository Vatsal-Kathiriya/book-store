"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FiSave, FiUser, FiLock, FiMapPin } from 'react-icons/fi';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordForm, setPasswordForm] = useState<PasswordChange>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // First check if user is logged in
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (!token || !storedUser) {
          router.push('/login');
          return;
        }
        
        setIsLoading(true);
        setError('');
        
        // For production:
        // const response = await axios.get('/api/users/profile', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // setUser(response.data);
        
        // For development:
        const userData = JSON.parse(storedUser);
        setUser({
          _id: userData.id || '123',
          name: userData.name || 'John Doe',
          email: userData.email || 'john@example.com',
          role: userData.role || 'user',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          }
        });
        
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle nested address fields
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setUser(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          address: {
            ...prev.address,
            [addressField]: value
          }
        };
      });
    } else {
      setUser(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          [name]: value
        };
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setSuccessMessage('');
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // For production:
      // await axios.put('/api/users/profile', {
      //   name: user.name,
      //   address: user.address
      // }, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // For development:
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local storage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...storedUser,
        name: user.name
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    setPasswordError('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    setIsSaving(true);
    setPasswordSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      
      // For production:
      // await axios.put('/api/users/change-password', {
      //   currentPassword: passwordForm.currentPassword,
      //   newPassword: passwordForm.newPassword
      // }, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // For development:
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordSuccess('Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError('Failed to change password. Ensure your current password is correct.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container-page flex justify-center items-center min-h-[50vh]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="container-page">
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center text-red-700 dark:text-red-400">
          <p className="text-lg font-medium">{error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 btn btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      {/* Profile Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex -mb-px">
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            <FiUser className="mr-2" /> Personal Information
          </button>
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'address'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('address')}
          >
            <FiMapPin className="mr-2" /> Address Information
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'password'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('password')}
          >
            <FiLock className="mr-2" /> Change Password
          </button>
        </nav>
      </div>
      
      {/* Success / Error Messages */}
      {successMessage && activeTab !== 'password' && (
        <div className="p-4 mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
          {successMessage}
        </div>
      )}
      
      {error && activeTab !== 'password' && (
        <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
      
      {/* Personal Information */}
      {activeTab === 'profile' && user && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Personal Information</h2>
            <form onSubmit={updateProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={user.name}
                    onChange={handleProfileChange}
                    className="form-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={user.email}
                    readOnly
                    className="form-input bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    title="Email cannot be changed"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    For email changes, please contact support.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  type="submit" 
                  className="btn btn-primary inline-flex items-center"
                  disabled={isSaving}
                >
                  <FiSave className="mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Address Information */}
      {activeTab === 'address' && user && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Address Information</h2>
            <form onSubmit={updateProfile}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    value={user.address?.street || ''}
                    onChange={handleProfileChange}
                    className="form-input"
                    placeholder="Enter your street address"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="address.city"
                      name="address.city"
                      value={user.address?.city || ''}
                      onChange={handleProfileChange}
                      className="form-input"
                      placeholder="Enter your city"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      id="address.state"
                      name="address.state"
                      value={user.address?.state || ''}
                      onChange={handleProfileChange}
                      className="form-input"
                      placeholder="Enter your state or province"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ZIP / Postal Code
                    </label>
                    <input
                      type="text"
                      id="address.zipCode"
                      name="address.zipCode"
                      value={user.address?.zipCode || ''}
                      onChange={handleProfileChange}
                      className="form-input"
                      placeholder="Enter your ZIP code"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      id="address.country"
                      name="address.country"
                      value={user.address?.country || ''}
                      onChange={handleProfileChange}
                      className="form-input"
                      placeholder="Enter your country"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  type="submit" 
                  className="btn btn-primary inline-flex items-center"
                  disabled={isSaving}
                >
                  <FiSave className="mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Change Password */}
      {activeTab === 'password' && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Change Password</h2>
            
            {passwordSuccess && (
              <div className="p-4 mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
                {passwordSuccess}
              </div>
            )}
            
            {passwordError && (
              <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                {passwordError}
              </div>
            )}
            
            <form onSubmit={updatePassword}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="form-input"
                    placeholder="Enter your current password"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="form-input"
                    placeholder="Enter your new password"
                    required
                    minLength={6}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Password must be at least 6 characters long
                  </p>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="form-input"
                    placeholder="Confirm your new password"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  type="submit" 
                  className="btn btn-primary inline-flex items-center"
                  disabled={isSaving}
                >
                  <FiLock className="mr-2" />
                  {isSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
