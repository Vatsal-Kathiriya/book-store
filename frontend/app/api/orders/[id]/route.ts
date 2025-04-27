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
    
    // Verify the user is authenticated
    const user = await verifyAuth(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const orderId = params.id;
    console.log(`Getting order info for ID: ${orderId}`);

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Validate if it looks like a potential MongoDB ObjectId format before fetching
    if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
      console.log(`Invalid ObjectId format for ID: ${orderId}`);
      return NextResponse.json({ error: 'Invalid Order ID format' }, { status: 400 });
    }

    // Fetch the specific order from the backend API
    const response = await fetch(`${BACKEND_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Backend error fetching order ${orderId}:`, data);
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
    console.error('Error in order detail API route:', error);
    
    if (error instanceof TypeError && error.message.includes('Invalid URL')) {
      return NextResponse.json(
        { error: 'Configuration error: Backend service URL is not defined.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error while fetching order details' },
      { status: 500 }
    );
  }
}
