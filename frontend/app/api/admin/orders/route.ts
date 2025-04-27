import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/utils/auth';

// Define a default backend URL if environment variable is not set
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api';

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const token = request.headers.get('Authorization')?.split(' ')[1] || '';
    
    // Verify the user has admin privileges
    const user = await verifyAuth(token);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }
    
    // Extract query parameters from request
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/admin/orders?${queryString}` : '/admin/orders';
    
    console.log(`Admin fetching orders from ${BACKEND_URL}${endpoint}`);
    
    // Call the backend API to fetch admin orders
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Backend error fetching admin orders:', data);
      return NextResponse.json(
        { error: data.message || 'Failed to fetch orders' },
        { status: response.status }
      );
    }
    
    // Return the orders data
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in admin orders API route:', error);
    
    if (error instanceof TypeError && error.message.includes('Invalid URL')) {
      return NextResponse.json(
        { error: 'Configuration error: Backend service URL is not defined.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error while fetching admin orders' },
      { status: 500 }
    );
  }
}
