import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/utils/auth';

// Define a default backend URL if environment variable is not set
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract token from Authorization header
    const token = request.headers.get('Authorization')?.split(' ')[1] || '';
    
    // Verify the user has admin privileges
    const user = await verifyAuth(token);

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const orderId = params.id;
    console.log(`Admin getting order info for ID: ${orderId}`);

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Validate if it looks like a potential ObjectId before fetching
    if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
      console.log(`Admin: Invalid ObjectId format for ID: ${orderId}`);
      return NextResponse.json({ error: 'Invalid Order ID format' }, { status: 400 });
    }

    // Fetch the specific order from the backend admin endpoint
    const response = await fetch(`${BACKEND_URL}/admin/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Backend error fetching admin order ${orderId}:`, data);
      const errorMessage = data.error?.includes('Cast to ObjectId failed')
        ? 'Order not found or invalid ID.'
        : (data.message || 'Failed to load order details from backend');
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status === 400 ? 404 : response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in admin order detail API route:', error);
    
    if (error instanceof TypeError && error.message.includes('Invalid URL')) {
      return NextResponse.json(
        { error: 'Configuration error: Backend service URL is not defined.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error while fetching admin order details' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1] || '';
    const user = await verifyAuth(token);

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const orderId = params.id;
    const requestBody = await request.json();
    const { status } = requestBody;

    console.log(`Admin updating order ${orderId} status to ${status}`, requestBody);

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: 'Status field is required' }, { status: 400 });
    }

    // Validate status value - add allowed statuses
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return NextResponse.json({ 
        error: `Invalid status value. Must be one of: ${validStatuses.join(', ')}` 
      }, { status: 400 });
    }

    // Call the backend API to update the order status
    console.log(`Admin updating order ${orderId} status to ${status}`);
    
    // Ensure URL is correctly formatted
    const updateUrl = `${BACKEND_URL}/admin/orders/${orderId}/status`;
    console.log(`Making request to: ${updateUrl}`);
    
    const response = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status }),
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000) // 10-second timeout
    });

    // Additional debug logging
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Additional error check for network issues
    if (!response) {
      console.error('Network error while updating order status');
      return NextResponse.json(
        { error: 'Network error: Could not connect to backend service' },
        { status: 503 }
      );
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Error parsing backend response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response received from backend' },
        { status: 502 }
      );
    }

    if (!response.ok) {
      console.error(`Backend error updating order status ${orderId} to ${status}:`, data);
      return NextResponse.json(
        { error: data.message || `Failed to update order status to ${status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order ${orderId} status updated to ${status}`,
      order: data.order // Return the updated order from backend if available
    });
    
  } catch (error) {
    console.error('Error updating order status:', error);
    
    if (error instanceof TypeError && error.message.includes('Invalid URL')) {
      return NextResponse.json(
        { error: 'Configuration error: Backend service URL is not defined.' },
        { status: 500 }
      );
    }
    
    // More specific error message with error details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Order status update failed with error: ${errorMessage}`);
    
    return NextResponse.json(
      { error: 'Internal server error while updating order status. Please try again.' },
      { status: 500 }
    );
  }
}
