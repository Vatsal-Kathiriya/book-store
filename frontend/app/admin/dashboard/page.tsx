"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Add router import
import { 
  FiArrowUp, 
  FiArrowDown, 
  FiShoppingBag, 
  FiCreditCard, 
  FiUsers, 
  FiBook, 
  FiAlertCircle, 
  FiTrendingUp, 
  FiBarChart2, 
  FiRefreshCw,
  FiPlus,
  FiSearch,
  FiTag,
  FiPackage
} from 'react-icons/fi';
// Remove AdminLayout import since it's provided by parent layout
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Improved dynamic imports with error handling for charts
const ChartComponents = () => {
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [Charts, setCharts] = useState({
    Chart: null,
    Doughnut: null, 
    Bar: null, 
    Line: null
  });

  useEffect(() => {
    const loadCharts = async () => {
      try {
        // Dynamic import Chart.js and properly initialize
        const { Chart } = await import('chart.js/auto');
        // Register required components
        const { 
          ArcElement, 
          CategoryScale, 
          LinearScale, 
          BarElement, 
          PointElement, 
          LineElement, 
          Title, 
          Tooltip, 
          Legend 
        } = await import('chart.js');
        
        // Register the required components
        Chart.register(
          ArcElement, 
          CategoryScale, 
          LinearScale, 
          BarElement, 
          PointElement, 
          LineElement, 
          Title, 
          Tooltip, 
          Legend
        );
        
        // Import chart types from react-chartjs-2
        const { Doughnut, Bar, Line } = await import('react-chartjs-2');
        
        setCharts({
          Chart,
          Doughnut,
          Bar,
          Line
        });
        
        setChartsLoaded(true);
      } catch (error) {
        console.error('Failed to load chart libraries:', error);
      }
    };
    
    loadCharts();
  }, []);
  
  return { chartsLoaded, ...Charts };
};

// The rest of your dashboard component code
export default function DashboardPage() {
  const router = useRouter(); // Initialize router for navigation
  
  // Get chart components
  const { chartsLoaded, Doughnut, Bar, Line } = ChartComponents();
  
  // Your existing state variables
  const [activeTab, setActiveTab] = useState('overview');
  const [salesPeriod, setSalesPeriod] = useState('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false); // For button loading states

  // Action functions for buttons
  const handleAddNewBook = () => {
    setButtonLoading(true);
    router.push('/admin/books/new');
  };

  const handleSearchOrders = () => {
    setButtonLoading(true);
    router.push('/admin/orders?search=true');
  };

  const handleManagePromotions = () => {
    setButtonLoading(true);
    router.push('/admin/promotions');
  };

  const handleManageInventory = () => {
    setButtonLoading(true);
    router.push('/admin/inventory');
  };

  const handleViewAnalytics = () => {
    // Switch to analytics tab if on the same page
    setActiveTab('analytics');
    // Or navigate to detailed analytics
    // router.push('/admin/reports');
  };

  const refreshDashboard = () => {
    setIsLoading(true);
    fetchData();
  };

  // Fetch dashboard data - using static data that matches the screenshot values
  const fetchData = async () => {
    try {
      // Hardcoded data to match the original dashboard values from screenshot
      setDashboardData({
        stats: {
          books: {
            total: 1248,
            change: 5.8,
            increasing: true
          },
          orders: {
            total: 156,
            change: 12.3,
            increasing: true
          },
          users: {
            total: 842,
            change: 8.1,
            increasing: true
          },
          revenue: {
            total: 28450,
            change: 15.4,
            increasing: true,
            currency: '$'
          }
        },
        recentOrders: [
          { id: 'ORD-9843', customer: 'Emma Watson', date: '2023-06-10T14:23:00', status: 'completed', total: 124.95 },
          { id: 'ORD-9842', customer: 'James Smith', date: '2023-06-10T12:30:00', status: 'processing', total: 85.20 },
          { id: 'ORD-9841', customer: 'Robert Johnson', date: '2023-06-10T09:15:00', status: 'pending', total: 42.99 },
          { id: 'ORD-9840', customer: 'Jennifer Davis', date: '2023-06-09T17:45:00', status: 'completed', total: 159.99 },
          { id: 'ORD-9839', customer: 'Michael Brown', date: '2023-06-09T14:20:00', status: 'cancelled', total: 29.99 }
        ],
        inventory: {
          lowStock: [
            { id: 1, title: 'The Great Gatsby', stock: 3, threshold: 5 },
            { id: 2, title: 'To Kill a Mockingbird', stock: 2, threshold: 5 },
            { id: 3, title: '1984', stock: 4, threshold: 5 },
            { id: 4, title: 'Pride and Prejudice', stock: 1, threshold: 5 }
          ],
          categories: [
            { name: 'Fiction', count: 450 },
            { name: 'Science Fiction', count: 210 },
            { name: 'Mystery', count: 198 },
            { name: 'Biography', count: 165 },
            { name: 'History', count: 140 },
            { name: 'Self-Help', count: 85 }
          ]
        },
        chartData: {
          // Weekly sales data points visible in screenshot
          weeklySales: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            data: [1200, 1900, 1500, 2300, 1800, 2500, 2100]
          },
          monthlySales: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [12000, 19000, 15000, 23000, 18000, 25000]
          },
          categoryDistribution: [450, 210, 198, 165, 140, 85],
          userActivity: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            newUsers: [65, 78, 52, 91, 80, 87],
            activeUsers: [120, 130, 110, 150, 140, 160]
          }
        }
      });
      setIsLoading(false);
      setButtonLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setIsLoading(false);
      setButtonLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper function to format numbers
  const formatNumber = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
  };

  // Improved chart rendering function
  const renderChart = (ChartComponent, data, options = {}, className = "h-80") => {
    if (!chartsLoaded || !ChartComponent) {
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <LoadingSpinner size="md" />
        </div>
      );
    }
    
    return (
      <div className={className}>
        <ChartComponent data={data} options={options} />
      </div>
    );
  };

  // Helper to format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Chart configurations
  const salesChartData = chartsLoaded ? {
    labels: dashboardData?.chartData[salesPeriod === 'weekly' ? 'weeklySales' : 'monthlySales'].labels || [],
    datasets: [
      {
        label: 'Revenue',
        data: dashboardData?.chartData[salesPeriod === 'weekly' ? 'weeklySales' : 'monthlySales'].data || [],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  } : null;

  const categoryChartData = chartsLoaded ? {
    labels: dashboardData?.inventory.categories.map(cat => cat.name) || [],
    datasets: [
      {
        data: dashboardData?.inventory.categories.map(cat => cat.count) || [],
        backgroundColor: [
          '#3B82F6', // blue-500
          '#10B981', // emerald-500
          '#F59E0B', // amber-500
          '#EF4444', // red-500
          '#8B5CF6', // violet-500
          '#EC4899'  // pink-500
        ],
        hoverOffset: 4
      }
    ]
  } : null;

  const userActivityData = chartsLoaded ? {
    labels: dashboardData?.chartData.userActivity.labels || [],
    datasets: [
      {
        label: 'New Users',
        data: dashboardData?.chartData.userActivity.newUsers || [],
        backgroundColor: 'rgba(16, 185, 129, 0.7)', // emerald-500 with opacity
        borderRadius: 4
      },
      {
        label: 'Active Users',
        data: dashboardData?.chartData.userActivity.activeUsers || [],
        backgroundColor: 'rgba(59, 130, 246, 0.7)', // blue-500 with opacity
        borderRadius: 4
      }
    ]
  } : null;

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Header with Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === 'overview' 
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === 'analytics' 
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Books Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Books</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatNumber(dashboardData?.stats.books.total)}
              </h3>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FiBook className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`flex items-center text-sm ${
              dashboardData?.stats.books.increasing ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {dashboardData?.stats.books.increasing ? <FiArrowUp className="mr-1" /> : <FiArrowDown className="mr-1" />}
              {dashboardData?.stats.books.change}%
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">from last month</span>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatNumber(dashboardData?.stats.orders.total)}
              </h3>
            </div>
            <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
              <FiShoppingBag className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`flex items-center text-sm ${
              dashboardData?.stats.orders.increasing ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {dashboardData?.stats.orders.increasing ? <FiArrowUp className="mr-1" /> : <FiArrowDown className="mr-1" />}
              {dashboardData?.stats.orders.change}%
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">from last month</span>
          </div>
        </div>

        {/* Users Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatNumber(dashboardData?.stats.users.total)}
              </h3>
            </div>
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
              <FiUsers className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`flex items-center text-sm ${
              dashboardData?.stats.users.increasing ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {dashboardData?.stats.users.increasing ? <FiArrowUp className="mr-1" /> : <FiArrowDown className="mr-1" />}
              {dashboardData?.stats.users.change}%
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">from last month</span>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {dashboardData?.stats.revenue.currency}{formatNumber(dashboardData?.stats.revenue.total)}
              </h3>
            </div>
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
              <FiCreditCard className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`flex items-center text-sm ${
              dashboardData?.stats.revenue.increasing ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {dashboardData?.stats.revenue.increasing ? <FiArrowUp className="mr-1" /> : <FiArrowDown className="mr-1" />}
              {dashboardData?.stats.revenue.change}%
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">from last month</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sales Overview</h2>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setSalesPeriod('weekly')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    salesPeriod === 'weekly' 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Weekly
                </button>
                <button 
                  onClick={() => setSalesPeriod('monthly')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    salesPeriod === 'monthly' 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
            
            {renderChart(Line, salesChartData, {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(156, 163, 175, 0.1)'
                  },
                  ticks: {
                    callback: function(value) {
                      return '$' + value;
                    }
                  }
                },
                x: {
                  grid: {
                    display: false
                  }
                }
              }
            })}
          </div>

          {/* Category Distribution */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Book Categories</h2>
            
            {renderChart(Doughnut, categoryChartData, {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    usePointStyle: true,
                    padding: 20
                  }
                }
              },
              cutout: '65%'
            }, "h-64")}
            
            <div className="mt-6">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-700 dark:text-gray-300">Total Books</span>
                <span className="text-gray-900 dark:text-white">{dashboardData?.stats.books.total}</span>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
              <button className="text-primary-600 dark:text-primary-400 text-sm flex items-center hover:underline">
                View all <FiArrowUp className="ml-1 transform rotate-45" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {dashboardData?.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{order.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{order.customer}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{formatDate(order.date)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">${order.total.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inventory Status */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Low Stock Alert</h2>
            <div className="space-y-4">
              {dashboardData?.inventory.lowStock.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-9 w-9 rounded-md bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mr-3">
                      <FiAlertCircle />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={item.title}>
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.stock} of {item.threshold} remaining
                      </p>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          item.stock / item.threshold < 0.3 
                            ? 'bg-red-500' 
                            : item.stock / item.threshold < 0.6 
                              ? 'bg-yellow-500' 
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${(item.stock / item.threshold) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button 
                onClick={handleManageInventory}
                disabled={buttonLoading}
                className="w-full py-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 text-primary-700 dark:text-primary-400 text-sm font-medium rounded-md transition-colors flex items-center justify-center"
              >
                <FiPackage className="mr-2" /> Manage Inventory
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Activity */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">User Activity</h2>
            
            {renderChart(Bar, userActivityData, {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(156, 163, 175, 0.1)'
                  }
                },
                x: {
                  grid: {
                    display: false
                  }
                }
              }
            })}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <button 
                onClick={handleAddNewBook}
                disabled={buttonLoading}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center transition-colors"
              >
                {buttonLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <FiPlus className="mr-2" />} 
                Add New Book
              </button>
              <button 
                onClick={handleSearchOrders}
                disabled={buttonLoading}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg flex items-center justify-center transition-colors"
              >
                <FiSearch className="mr-2" /> Search Orders
              </button>
              <button 
                onClick={handleManagePromotions}
                disabled={buttonLoading}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg flex items-center justify-center transition-colors"
              >
                <FiTag className="mr-2" /> Manage Promotions
              </button>
              <button 
                onClick={handleViewAnalytics}
                disabled={buttonLoading}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg flex items-center justify-center transition-colors"
              >
                <FiTrendingUp className="mr-2" /> View Analytics
              </button>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Popular Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {dashboardData?.inventory.categories.map((category, index) => (
                <div key={category.name} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                  <div className={`h-12 w-12 rounded-full mx-auto flex items-center justify-center ${
                    ['bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
                     'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
                     'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
                     'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
                     'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
                     'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'][index % 6]
                  }`}>
                    <FiBook />
                  </div>
                  <h3 className="mt-3 font-medium text-gray-900 dark:text-white">{category.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{category.count} books</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex justify-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={refreshDashboard}
          className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
        >
          <FiRefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} /> 
          {isLoading ? 'Refreshing...' : 'Refresh Dashboard'}
        </button>
      </div>
    </div>
  );
};