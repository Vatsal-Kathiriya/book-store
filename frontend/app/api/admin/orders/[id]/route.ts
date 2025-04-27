import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/utils/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1] || '';
    const user = await verifyAuth(token);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const orderId = params.id;
    const { status } = await request.json();
    
    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }
    
    // In a real app, you would update the order in your database
    console.log(`Updating order ${orderId} status to ${status}`);
    
    return NextResponse.json({
      success: true,
      message: `Order ${orderId} status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
