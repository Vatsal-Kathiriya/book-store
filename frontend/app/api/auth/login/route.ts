import { NextResponse } from 'next/server';

// Define a default backend URL if environment variable is not set
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    console.log(`Frontend API: Login attempt for ${email}`);
    
    // Check for empty credentials
    if (!email || !password) {
      console.log('Frontend API: Empty credentials provided');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Using the BACKEND_URL constant with proper formatting
    console.log(`Frontend API: Making request to ${BACKEND_URL}/auth/login`);
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      // Add cache: 'no-store' to prevent caching
      cache: 'no-store',
    });

    // Parse response data
    const data = await response.json();
    console.log(`Frontend API: Backend response status: ${response.status}`);
    
    // Handle non-successful responses
    if (!response.ok) {
      console.log(`Frontend API: Login failed with status ${response.status}`);
      console.log(`Frontend API: Error message: ${data.message || 'Unknown error'}`);
      
      return NextResponse.json(
        { error: data.message || 'Authentication failed' },
        { status: response.status }
      );
    }

    // Validate response format
    if (!data.user || !data.token) {
      console.log('Frontend API: Invalid response format from backend');
      console.log('Frontend API: Response data:', JSON.stringify(data));
      
      return NextResponse.json(
        { error: 'Invalid response from authentication server' },
        { status: 500 }
      );
    }

    console.log(`Frontend API: Login successful for user ${data.user.email}`);
    
    // Return user data and token
    return NextResponse.json({
      user: data.user,
      token: data.token
    });
    
  } catch (error) {
    console.error('Frontend API: Login error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to authentication server' },
      { status: 500 }
    );
  }
}
