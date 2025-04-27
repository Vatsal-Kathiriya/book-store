import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1] || '';
    const user = await verifyAuth(token);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Mock data for demonstration purposes
    const orders = [
      {
        id: 'ORD-001',
        user: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        items: [
          {
            book: { title: 'The Great Gatsby' },
            quantity: 1,
            price: 12.99,
          },
          {
            book: { title: 'To Kill a Mockingbird' },
            quantity: 2,
            price: 10.99,
          },
        ],
        totalAmount: 34.97,
        status: 'processing',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ORD-002',
        user: {
          name: 'Jane Smith',
          email: 'jane@example.com',
        },
        items: [
          {
            book: { title: '1984' },
            quantity: 1,
            price: 9.99,
          },
        ],
        totalAmount: 9.99,
        status: 'delivered',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      },
    ];
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
