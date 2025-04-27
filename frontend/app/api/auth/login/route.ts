import { NextResponse } from 'next/server';

// Define a default backend URL if environment variable is not set
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Using the BACKEND_URL constant with proper formatting
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      // If backend returns an error
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Authentication failed' },
        { status: response.status }
      );
    }

    // Get user data and token from backend
    const data = await response.json();

    return NextResponse.json({
      user: data.user,
      token: data.token,
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
