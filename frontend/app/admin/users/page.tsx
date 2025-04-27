"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  FiEdit, 
  FiTrash2, 
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
  FiUserPlus,
  FiFilter,
  FiCalendar,
  FiX,
  FiRefreshCw
} from 'react-icons/fi';
import axios from 'axios';
import { format, subDays } from 'date-fns';
import { userService } from '@/services/userService';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface FilterOptions {
  searchTerm: string;
  role: string;
  startDate: string;
  endDate: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Advanced filter state
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    role: '',
    startDate: '',
    endDate: '',
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Server-side pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const initialLoadComplete = useRef(false);

  // Sample user data - In production, fetch from backend
  const sampleUsers: User[] = Array.from({ length: 25 }, (_, i) => {
    const roles = ['user', 'admin'];
    return {
      _id: `user-${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: roles[i % roles.length],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
    };
  });

  // Fetch users with filters and pagination
  const fetchUsers = async (resetPage = false) => {
    try {
      setIsLoading(true);
      setError('');
      
      const page = resetPage ? 1 : pagination.page;
      
      // Build query parameters
      const params = {
        page,
        limit: pagination.limit,
        search: filters.searchTerm,
        role: filters.role,
        startDate: filters.startDate,
        endDate: filters.endDate,
        sortField: 'createdAt',
        sortOrder: 'desc'
      };
      
      try {
        // Use the userService to fetch users
        const response = await userService.getAllUsers(params);
        
        setUsers(response.data);
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        });
      } catch (error) {
        // Check if it's a development environment and fall back to mock data
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using mock data for development');
          mockFetchUsers(page, params);
        } else {
          throw error; // Re-throw for production environment
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock function for development
  const mockFetchUsers = (page: number, params: any) => {
    let filteredUsers = sampleUsers;
    
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm) || 
        user.email.toLowerCase().includes(searchTerm)
      );
    }
    
    if (params.role) {
      filteredUsers = filteredUsers.filter(user => user.role === params.role);
    }
    
    if (params.startDate) {
      const startDate = new Date(params.startDate);
      filteredUsers = filteredUsers.filter(user => new Date(user.createdAt) >= startDate);
    }
    
    if (params.endDate) {
      const endDate = new Date(params.endDate);
      // Set time to end of day
      endDate.setHours(23, 59, 59, 999);
      filteredUsers = filteredUsers.filter(user => new Date(user.createdAt) <= endDate);
    }
    
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / pagination.limit);
    
    // Get paginated slice
    const startIndex = (page - 1) * pagination.limit;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pagination.limit);
    
    setUsers(paginatedUsers);
    setPagination(prev => ({
      ...prev,
      page: page,
      total,
      totalPages
    }));
  };

  // Initial load
  useEffect(() => {
    if (!initialLoadComplete.current) {
      fetchUsers();
      initialLoadComplete.current = true;
    }
  }, []);

  // Handle filter change
  const handleFilterChange = (name: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchUsers(true); // Reset to page 1 when applying filters
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      role: '',
      startDate: '',
      endDate: '',
    });
    fetchUsers(true);
  };

  // Change page
  const changePage = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
    fetchUsers(false);
  };

  // Open delete confirmation modal
  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setUserToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      // Use the userService to delete the user
      await userService.deleteUser(userToDelete._id);
      
      closeDeleteModal();
      fetchUsers();
      
    } catch (err) {
      console.error('Error deleting user:', err);
      // Handle the error - maybe show a notification
    }
  };

  if (isLoading && !users.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
      </div>
    );
  }

  if (error && !users.length) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center text-red-700 dark:text-red-400">
        <p className="text-lg font-medium">{error}</p>
        <button 
          onClick={() => fetchUsers()}
          className="mt-4 btn btn-outline text-red-600 dark:text-red-400"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        
        <div className="relative">
          <button 
            onClick={() => document.getElementById('userActionDropdown')?.classList.toggle('hidden')}
            className="btn btn-primary inline-flex items-center"
          >
            User Actions <FiChevronRight className="ml-2 transform rotate-90" />
          </button>
          
          <div 
            id="userActionDropdown" 
            className="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1 border border-gray-200 dark:border-gray-700"
          >
            <Link 
              href="/admin/users/new" 
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiUserPlus className="mr-2" /> Add New User
            </Link>
            <Link 
              href="/admin/users/import" 
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiRefreshCw className="mr-2" /> Import Users
            </Link>
            <Link 
              href="/admin/users/export" 
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiFilter className="mr-2" /> Export Users
            </Link>
          </div>
        </div>
      </div>
      
      {/* Unified Search Bar */}
      <div className="flex flex-col gap-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search users by name, email or filter by role..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="w-full pl-10 pr-20 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:bg-gray-800 dark:text-white"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          
          <button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300"
          >
            {showAdvancedFilters ? "Basic" : "Advanced"} Filters
          </button>
        </div>
        
        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Advanced Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:bg-gray-800 dark:text-white" // Added text-gray-900
                  />
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:bg-gray-800 dark:text-white" // Added text-gray-900
                  />
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <button 
                onClick={resetFilters}
                className="btn btn-outline inline-flex items-center"
              >
                <FiRefreshCw className="mr-1" /> Reset Filters
              </button>
              
              <button 
                onClick={applyFilters}
                className="btn btn-primary inline-flex items-center"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Quick date range filters */}
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => {
            const today = new Date();
            const startDate = format(today, 'yyyy-MM-dd');
            
            setFilters(prev => ({
              ...prev,
              startDate,
              endDate: startDate
            }));
            
            setTimeout(() => applyFilters(), 0);
          }}
          className="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
        >
          Today
        </button>
        
        <button 
          onClick={() => {
            const today = new Date();
            const startDate = format(subDays(today, 7), 'yyyy-MM-dd');
            const endDate = format(today, 'yyyy-MM-dd');
            
            setFilters(prev => ({
              ...prev,
              startDate,
              endDate
            }));
            
            setTimeout(() => applyFilters(), 0);
          }}
          className="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
        >
          Last 7 days
        </button>
        
        <button 
          onClick={() => {
            const today = new Date();
            const startDate = format(subDays(today, 30), 'yyyy-MM-dd');
            const endDate = format(today, 'yyyy-MM-dd');
            
            setFilters(prev => ({
              ...prev,
              startDate,
              endDate
            }));
            
            setTimeout(() => applyFilters(), 0);
          }}
          className="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
        >
          Last 30 days
        </button>
      </div>
      
      {/* Users table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        {isLoading && users.length > 0 && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created At
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/admin/users/edit/${user._id}`}
                          className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                          title="Edit"
                        >
                          <FiEdit className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          title="Delete"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No users found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Server-side Pagination */}
        {pagination.totalPages > 0 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{users.length > 0 ? ((pagination.page - 1) * pagination.limit) + 1 : 0}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => changePage(Math.max(1, pagination.page - 1))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <FiChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, and pages around current page
                      const currentPage = pagination.page;
                      return (
                        page === 1 || 
                        page === pagination.totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1) ||
                        (page === 2 && currentPage === 1) ||
                        (page === pagination.totalPages - 1 && currentPage === pagination.totalPages)
                      );
                    })
                    .map((page, index, array) => {
                      // Add ellipsis where there are gaps
                      const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                      const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1;
                      
                      return (
                        <React.Fragment key={page}>
                          {showEllipsisBefore && (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => changePage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                              page === pagination.page
                                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                          {showEllipsisAfter && (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                              ...
                            </span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  
                  <button
                    onClick={() => changePage(Math.min(pagination.totalPages, pagination.page + 1))}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <FiChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Mobile pagination */}
            <div className="flex items-center justify-between sm:hidden">
              <button
                onClick={() => changePage(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => changePage(Math.min(pagination.totalPages, pagination.page + 1))}
                disabled={pagination.page === pagination.totalPages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete confirmation modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                    <FiAlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Delete User
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete {userToDelete.name}? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
