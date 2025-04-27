"use client";

import { useState, useEffect } from 'react';
import { 
  FiBarChart2, 
  FiPieChart, 
  FiTrendingUp, 
  FiCalendar, 
  FiDownload, 
  FiRefreshCw 
} from 'react-icons/fi';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function AdminReports() {
  // State for selected report
  const [activeReport, setActiveReport] = useState<string>('monthly-revenue');
  
  // State for report data
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Filter states
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [period, setPeriod] = useState<string>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Fetch report data based on active report
  const fetchReportData = async () => {
    setLoading(true);
    setError('');
    
    try {
      let url = `/api/reports/${activeReport}`;
      let params = {};
      
      // Add parameters based on report type
      switch (activeReport) {
        case 'monthly-revenue':
          params = { year };
          break;
        case 'top-selling-books':
          params = { period, limit: 10 };
          break;
        case 'sales-by-category':
          if (startDate) params = { ...params, startDate };
          if (endDate) params = { ...params, endDate };
          break;
      }
      
      const response = await axios.get(url, { params });
      setReportData(response.data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch report when active report changes or filters change
  useEffect(() => {
    fetchReportData();
  }, [activeReport, year, period]);
  
  // Format data for Monthly Revenue Chart
  const getMonthlyRevenueChartData = () => {
    if (!reportData || !reportData.data) return null;
    
    return {
      labels: reportData.data.map(item => item.monthName),
      datasets: [
        {
          label: 'Revenue ($)',
          data: reportData.data.map(item => item.revenue),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgb(53, 162, 235)',
          borderWidth: 1,
        },
        {
          label: 'Orders',
          data: reportData.data.map(item => item.orders),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1,
          yAxisID: 'y1',
        }
      ],
    };
  };
  
  // Format data for Sales by Category Chart
  const getCategoryChartData = () => {
    if (!reportData || !reportData.data) return null;
    
    return {
      labels: reportData.data.map(item => item.category),
      datasets: [
        {
          label: 'Sales by Category',
          data: reportData.data.map(item => item.totalSales),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
          ],
          borderWidth: 1,
        }
      ]
    };
  };
  
  // Format data for Top Selling Books Chart
  const getTopSellingBooksChartData = () => {
    if (!reportData || !reportData.data) return null;
    
    return {
      labels: reportData.data.map(item => `${item.title.substring(0, 15)}...`),
      datasets: [
        {
          label: 'Quantity Sold',
          data: reportData.data.map(item => item.totalQuantitySold),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1,
        }
      ]
    };
  };
  
  // Export report to CSV
  const exportToCSV = () => {
    if (!reportData || !reportData.data) return;
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Get headers (keys of first data item)
    const headers = Object.keys(reportData.data[0]);
    csvContent += headers.join(',') + '\n';
    
    // Add data rows
    reportData.data.forEach(item => {
      const row = headers.map(header => {
        const value = item[header];
        // Handle strings with commas
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',');
      csvContent += row + '\n';
    });
    
    // Create download link and click it
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeReport}-report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Render appropriate chart based on active report
  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-80">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center text-red-700 dark:text-red-400">
          <p className="text-lg font-medium">{error}</p>
          <button 
            onClick={fetchReportData}
            className="mt-4 btn btn-outline text-red-600 dark:text-red-400"
          >
            Try Again
          </button>
        </div>
      );
    }
    
    if (!reportData) return null;
    
    switch (activeReport) {
      case 'monthly-revenue':
        const monthlyData = getMonthlyRevenueChartData();
        if (!monthlyData) return null;
        
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Monthly Revenue - {reportData.year}
            </h3>
            <div className="h-80">
              <Bar 
                data={monthlyData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Revenue ($)'
                      }
                    },
                    y1: {
                      position: 'right',
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Orders'
                      },
                      grid: {
                        drawOnChartArea: false
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        );
        
      case 'sales-by-category':
        const categoryData = getCategoryChartData();
        if (!categoryData) return null;
        
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Sales by Category
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Pie 
                  data={categoryData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
              <div className="overflow-auto max-h-80">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Sales ($)
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {reportData.data.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.category}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${item.totalSales.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.totalQuantity.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case 'top-selling-books':
        const booksData = getTopSellingBooksChartData();
        if (!booksData) return null;
        
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Top Selling Books - {reportData.period}
            </h3>
            <div className="h-80">
              <Bar 
                data={booksData} 
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Quantity Sold'
                      }
                    }
                  }
                }}
              />
            </div>
            <div className="mt-6 overflow-auto max-h-60">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Author
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Sales
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {reportData.data.map((book, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {book.title}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {book.author}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {book.category}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {book.totalQuantitySold}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        ${book.totalRevenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'inventory-status':
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Inventory Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">Total Books</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {reportData.summary.totalUniqueBooks.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300">Total Inventory</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {reportData.summary.totalInventoryItems.toLocaleString()}
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {reportData.summary.totalLowStock.toLocaleString()}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300">Out of Stock</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {reportData.summary.totalOutOfStock.toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="overflow-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Books
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Qty
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Avg. Price
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      In Stock %
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Low Stock
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Out of Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {reportData.data.map((category, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {category.category}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {category.totalBooks}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {category.totalQuantity}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${category.averagePrice}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <span className="mr-2">{category.inStockPercentage}%</span>
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                category.inStockPercentage > 80 ? 'bg-green-600' : 
                                category.inStockPercentage > 50 ? 'bg-yellow-400' : 'bg-red-600'
                              }`} 
                              style={{ width: `${category.inStockPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                          {category.lowStockCount}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          {category.outOfStockCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'customer-insights':
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Customer Insights
            </h3>
            
            <div className="overflow-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Orders
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Avg. Order
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Days Since
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Purchase
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {reportData.data.map((customer, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {customer.name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {customer.email}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        ${customer.totalSpent.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {customer.orderCount}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${customer.averageOrderValue}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {customer.daysSinceLastPurchase}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(customer.lastPurchase).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
        
        <div className="flex gap-2">
          <button
            onClick={fetchReportData}
            className="btn btn-outline inline-flex items-center"
            title="Refresh Report"
          >
            <FiRefreshCw className="mr-2" /> Refresh
          </button>
          
          <button
            onClick={exportToCSV}
            className="btn btn-primary inline-flex items-center"
            disabled={!reportData || !reportData.data}
            title="Export to CSV"
          >
            <FiDownload className="mr-2" /> Export
          </button>
        </div>
      </div>
      
      {/* Report Selection Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex overflow-x-auto">
          <button
            className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
              activeReport === 'monthly-revenue'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveReport('monthly-revenue')}
          >
            <FiTrendingUp className="mr-2" /> Monthly Revenue
          </button>
          
          <button
            className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
              activeReport === 'sales-by-category'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveReport('sales-by-category')}
          >
            <FiPieChart className="mr-2" /> Sales by Category
          </button>
          
          <button
            className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
              activeReport === 'top-selling-books'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveReport('top-selling-books')}
          >
            <FiBarChart2 className="mr-2" /> Top Selling Books
          </button>
          
          <button
            className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
              activeReport === 'inventory-status'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveReport('inventory-status')}
          >
            <FiBarChart2 className="mr-2" /> Inventory Status
          </button>
          
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
              activeReport === 'customer-insights'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveReport('customer-insights')}
          >
            <FiBarChart2 className="mr-2" /> Customer Insights
          </button>
        </nav>
      </div>
      
      {/* Filter Controls */}
      {activeReport === 'monthly-revenue' && (
        <div className="flex flex-wrap gap-4 items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center">
            <label htmlFor="year" className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Year:
            </label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="form-select text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              {[2023, 2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      
      {activeReport === 'top-selling-books' && (
        <div className="flex flex-wrap gap-4 items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center">
            <label htmlFor="period" className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Period:
            </label>
            <select
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="form-select text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 90 days</option>
              <option value="year">Last year</option>
              <option value="">All time</option>
            </select>
          </div>
        </div>
      )}
      
      {activeReport === 'sales-by-category' && (
        <div className="flex flex-wrap gap-4 items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center">
            <label htmlFor="startDate" className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date:
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-input text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex items-center">
            <label htmlFor="endDate" className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date:
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-input text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <button
            onClick={() => fetchReportData()}
            className="btn btn-sm btn-primary"
          >
            Apply Filter
          </button>
          
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              // Clear filters and fetch data
              setTimeout(() => fetchReportData(), 0);
            }}
            className="btn btn-sm btn-outline"
          >
            Clear
          </button>
        </div>
      )}
      
      {/* Chart Area */}
      <div>
        {renderChart()}
      </div>
    </div>
  );
}