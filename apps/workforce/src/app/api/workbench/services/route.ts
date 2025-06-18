import { NextRequest, NextResponse } from 'next/server';
import { ServiceManagementController } from '@automation-ai/service-managemant-be';
import { ServiceCategory } from '@automation-ai/types';
import { AuthGuard } from '../../../../utils/auth-guard';

/**
 * GET /api/workbench/services
 * Get all services with pagination and filtering
 */
export const GET = AuthGuard.withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      category: searchParams.get('category') as ServiceCategory | null,
      search: searchParams.get('search') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      sortBy: searchParams.get('sortBy') || 'serviceName',
      sortOrder: (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc'
    };
    
    const result = await ServiceManagementController.getServices(params);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/workbench/services:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get services' 
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/workbench/services
 * Create a new service
 */
export const POST = AuthGuard.withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    
    const result = await ServiceManagementController.createService(body);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/workbench/services:', error);
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create service' 
      },
      { status: 500 }
    );
  }
});
