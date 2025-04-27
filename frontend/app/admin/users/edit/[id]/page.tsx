"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  password?: string;
}

export default function EditUser() {
  const { id } = useParams();
  const router = useRouter();
  const isNewUser = id === 'new';
  
  const [user, setUser] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'user',
    password: '',
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(!isNewUser);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    const fetchUser = async () => {
      if (isNewUser) return;
      
      try {
        setIsLoading(true);
        // For production:
        // const response = await axios.get(`/api/admin/users/${id}`);
        // setUser(response.data);
        
        // For development:
        setTimeout(() => {
          setUser({
            _id: id as string,
            name: `User ${id}`,
            email: `user${id}@example.com`,
            role: Math.random() > 0.5 ? 'admin' : 'user',
          });
          setIsLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('Failed to load user details');
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [id, isNewUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (!user.name || !user.email || !user.role) {
      setError('Please fill all required fields');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Password validation for new users
    if (isNewUser) {
      if (!user.password) {
        setError('Password is required for new users');
        return false;
      }
      
      if (user.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
      
      if (user.password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isNewUser) {
        // For production:
        // const response = await axios.post('/api/admin/users', user);
        
        // For development:
        console.log('Creating new user:', user);
        await new Promise(resolve => setTimeout(resolve, 500));
        setSuccessMessage('User created successfully!');
      } else {
        // For production:
        // const response = await axios.put(`/api/admin/users/${id}`, user);
        
        // For development:
        console.log('Updating user:', user);
        await new Promise(resolve => setTimeout(resolve, 500));
        setSuccessMessage('User updated successfully!');
      }
      
      // Redirect after a short delay so the user can see the success message
      setTimeout(() => {
        router.push('/admin/users');
      }, 2000);
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Failed to save user. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/admin/users" 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Go back"
          >
            <FiArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isNewUser ? 'Add New User' : 'Edit User'}
          </h1>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={user.name}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter user name"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={user.role}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          {isNewUser && (
            <>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  required={isNewUser}
                  minLength={6}
                  className="form-input"
                  placeholder="Enter password"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={isNewUser}
                  className="form-input"
                  placeholder="Confirm password"
                />
              </div>
            </>
          )}
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-end space-x-4">
          <Link
            href="/admin/users"
            className="btn btn-outline"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary inline-flex items-center"
          >
            <FiSave className="mr-2" />
            {isSaving ? 'Saving...' : 'Save User'}
          </button>
        </div>
      </form>
    </div>
  );
}