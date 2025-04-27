import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Add auth token to all requests
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// User API service
export const userService = {
  // Get all users with pagination and filtering
  getAllUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    sortField?: string;
    sortOrder?: string;
  }) => {
    const queryParams = new URLSearchParams();
    
    for (const [key, value] of Object.entries(params)) {
      if (value) queryParams.append(key, value.toString());
    }
    
    const response = await axios.get(`${API_URL}/admin/users?${queryParams.toString()}`, {
      headers: getAuthHeader()
    });
    
    return response.data;
  },
  
  // Get user by ID
  getUserById: async (id: string) => {
    const response = await axios.get(`${API_URL}/admin/users/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  
  // Create new user
  createUser: async (userData: any) => {
    const response = await axios.post(`${API_URL}/admin/users`, userData, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  
  // Update user
  updateUser: async (id: string, userData: any) => {
    const response = await axios.put(`${API_URL}/admin/users/${id}`, userData, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  
  // Delete user
  deleteUser: async (id: string) => {
    const response = await axios.delete(`${API_URL}/admin/users/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  
  // Get current user profile
  getCurrentUser: async () => {
    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  
  // Update user profile
  updateProfile: async (userData: any) => {
    const response = await axios.put(`${API_URL}/users/profile`, userData, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  
  // Change password
  changePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    const response = await axios.put(`${API_URL}/users/change-password`, passwordData, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};