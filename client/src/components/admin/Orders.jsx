import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    // ...existing imports...
    Alert,
    Spinner, // Add Spinner import
    Button, // Ensure Button is imported
    Card,   // Ensure Card is imported
    Row,    // Ensure Row is imported
    Table,  // Ensure Table is imported
    Form,   // Ensure Form is imported
    // Add other necessary imports like Col, Pagination if used in collapsed code
} from 'react-bootstrap';
import { format } from 'date-fns';
import { FaSync, FaFilter, FaEye } from 'react-icons/fa'; // Assuming FaEye is used for View
import './Admin.css';

// Basic logger placeholder - replace with a proper logger if available
const logger = console;

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusUpdateError, setStatusUpdateError] = useState(''); // Specific error for status updates
    const [statusUpdateLoading, setStatusUpdateLoading] = useState({}); // Loading state per order
    const [filters, setFilters] = useState({
        status: '',
        dateRange: 'last7days',
        search: '',
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalPages: 1,
        totalOrders: 0,
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const fetchOrders = useCallback(async (page = pagination.page, limit = pagination.limit, currentFilters = filters) => {
        setLoading(true);
        setError('');
        setStatusUpdateError(''); // Clear status update error on refresh/filter
        try {
            const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : null;
            if (!token) {
                setError('Not authorized. Please log in.');
                setLoading(false);
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    page,
                    limit,
                    status: currentFilters.status || undefined, // Send empty string as undefined
                    dateRange: currentFilters.dateRange,
                    search: currentFilters.search || undefined,
                },
            };

            const { data } = await axios.get(`${API_URL}/admin/orders`, config);
            setOrders(data.orders);
            setPagination({
                page: data.page,
                limit: data.limit,
                totalPages: data.totalPages,
                totalOrders: data.totalOrders,
            });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch orders');
            logger.error("Fetch orders error:", err);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, filters, API_URL]); // Include dependencies

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page]); // Fetch when page changes

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        // Reset to page 1 when applying new filters
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchOrders(1, pagination.limit, filters);
    };

    const resetFilters = () => {
        const defaultFilters = { status: '', dateRange: 'last7days', search: '' };
        setFilters(defaultFilters);
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchOrders(1, pagination.limit, defaultFilters);
    };

    const handleRefresh = () => {
        fetchOrders(); // Refetch with current filters and page
    };

    const handleStatusChange = async (orderId, newStatus) => {
        setStatusUpdateLoading(prev => ({ ...prev, [orderId]: true })); // Set loading for this specific order
        setStatusUpdateError(''); // Clear previous status update errors
        setError(''); // Clear general errors
    
        try {
            const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : null;
            if (!token) {
                setStatusUpdateError('Authentication error: Not logged in.');
                setStatusUpdateLoading(prev => ({ ...prev, [orderId]: false }));
                return;
            }
    
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                // Add timeout to prevent hanging requests
                timeout: 10000 // 10 second timeout
            };
    
            // Log request details for debugging
            logger.log(`Updating order ${orderId} status to ${newStatus} via PUT ${API_URL}/admin/orders/${orderId}/status`);
    
            // Make the request with better error handling
            const response = await axios.put(
                `${API_URL}/admin/orders/${orderId}/status`, 
                { status: newStatus }, 
                config
            );
    
            // Check if the response contains the expected success data
            if (response.data && response.data.success) {
                // Update the status locally for immediate feedback
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === orderId 
                            ? { ...order, status: response.data.order?.status || newStatus } 
                            : order
                    )
                );
                
                // Optionally show a success message
                // toast.success(`Order ${orderId} status updated to ${newStatus}`);
            } else {
                // Handle unexpected successful response format
                throw new Error('Invalid response format from server');
            }
        } catch (err) {
            logger.error(`Status update error for order ${orderId}:`, err);
    
            let message = 'Failed to update order status. Please try again.';
    
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    // Get the most specific error message possible
                    message = err.response.data?.message || 
                              err.response.data?.error || 
                              `Server error: ${err.response.status}`;
                              
                    logger.error("Server Response Data:", err.response.data);
                    
                    // Add additional context for certain status codes
                    if (err.response.status === 401 || err.response.status === 403) {
                        message += ' Authentication error: Please log in again.';
                    }
                } else if (err.request) {
                    message = 'Network error: Server did not respond. Please check your connection.';
                } else {
                    message = `Request error: ${err.message}`;
                }
            } else {
                message = `Error: ${err.message || 'Unknown error'}`;
            }
    
            setStatusUpdateError(message);
            
            // Consider refreshing data if there might be a state inconsistency
            if (message.includes('not found') || message.includes('Invalid')) {
                fetchOrders(); // Refresh to get latest data
            }
        } finally {
            setStatusUpdateLoading(prev => ({ ...prev, [orderId]: false }));
        }
    };


    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'PPp'); // e.g., Apr 28, 2025, 2:44:00 AM
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']; // Define available statuses

    return (
        <div className="admin-orders-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Order Management</h2>
                <Button variant="outline-secondary" onClick={handleRefresh} disabled={loading}>
                    <FaSync className={loading ? 'spin' : ''} /> Refresh
                </Button>
            </div>

            {/* Filters Section */}
            <Card className="mb-4 filter-card">
                <Card.Header><FaFilter /> Filters</Card.Header>
                <Card.Body>
                    <Row className="g-3">
                        {/* ... existing filter inputs ... */}
                    </Row>
                </Card.Body>
            </Card>

            {error && <Alert variant="danger">{error}</Alert>}
            {/* Display status update error separately and make it dismissible */}
            {statusUpdateError && <Alert variant="danger" onClose={() => setStatusUpdateError('')} dismissible>
                <strong>Update Failed:</strong> {statusUpdateError}
            </Alert>}

            {loading && !orders.length ? (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : (
                <>
                    <div className="table-responsive">
                        <Table striped bordered hover responsive className="admin-table">
                            <thead>
                                <tr>
                                    <th>ORDER ID</th>
                                    <th>CUSTOMER</th>
                                    <th>DATE</th>
                                    <th>ITEMS</th>
                                    <th>AMOUNT</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id}>
                                        <td>
                                            <div>{order.orderId}</div>
                                            <small className="text-muted">{order.paymentMethod}</small>
                                        </td>
                                        <td>
                                            <div>{order.user?.name || 'N/A'}</div>
                                            <small className="text-muted">{order.user?.email || 'N/A'}</small>
                                        </td>
                                        <td>{formatDate(order.createdAt)}</td>
                                        <td>
                                            <div>{order.items.length} Items</div>
                                            {order.items.slice(0, 1).map(item => ( // Show first item name
                                                <small key={item._id} className="text-muted d-block">
                                                    {item.book?.title || 'Book Title Missing'}
                                                </small>
                                            ))}
                                            {order.items.length > 1 && <small className="text-muted d-block">...</small>}
                                        </td>
                                        <td>
                                            {/* Status Dropdown */}
                                            <div className="d-flex align-items-center"> {/* Wrapper for alignment */}
                                                <Form.Select
                                                    size="sm"
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    disabled={statusUpdateLoading[order._id]} // Disable while updating this specific order
                                                    aria-label={`Order status for ${order.orderId}`}
                                                    className="me-2" // Add margin to the right
                                                    style={{ minWidth: '120px' }} // Ensure dropdown has enough width
                                                >
                                                    {orderStatuses.map(status => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </Form.Select>
                                                {statusUpdateLoading[order._id] && <Spinner animation="border" size="sm" />}
                                            </div>
                                        </td>
                                        <td>
                                            {/* Keep View button or add other actions */}
                                            <Button variant="outline-primary" size="sm" onClick={() => {/* Implement view logic */}}>
                                                <FaEye /> View
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    {/* ... existing pagination controls ... */}
                </>
            )}
        </div>
    );
};

export default Orders;
