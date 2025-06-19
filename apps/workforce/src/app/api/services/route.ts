import { NextRequest, NextResponse } from 'next/server';
import { ServicesController } from '@automation-ai/be-services';

/**
 * GET /api/services
 * Get all public services with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const query = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12'),
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    };

    const result = await ServicesController.getServices(query);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/services:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        data: [],
        pagination: {
          current: 1,
          pageSize: 12,
          total: 0,
          totalPages: 0
        },
        filters: {}
      },
      { status: 500 }
    );
  }
}
