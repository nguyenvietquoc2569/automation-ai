import { NextRequest, NextResponse } from 'next/server';
import { ServiceManagementController } from '@automation-ai/service-managemant-be';
import { AuthGuard } from '../../../../../utils/auth-guard';

/**
 * GET /api/workbench/services/[id]
 * Get service by ID
 */
export const GET = AuthGuard.withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    const result = await ServiceManagementController.getServiceById(id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/workbench/services/[id]:', error);
    
    if (error instanceof Error && error.message === 'Service not found') {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get service' 
      },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/workbench/services/[id]
 * Update service by ID
 */
export const PUT = AuthGuard.withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    const body = await request.json();
    
    const result = await ServiceManagementController.updateService(id, body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in PUT /api/workbench/services/[id]:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update service' 
      },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/workbench/services/[id]
 * Delete service by ID
 */
export const DELETE = AuthGuard.withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    const result = await ServiceManagementController.deleteService(id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in DELETE /api/workbench/services/[id]:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete service' 
      },
      { status: 500 }
    );
  }
});
