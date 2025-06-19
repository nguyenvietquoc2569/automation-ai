import { NextRequest, NextResponse } from 'next/server';
import { ServiceManagementController } from '@automation-ai/service-managemant-be';
import { AuthGuard } from '../../../../../../utils/auth-guard';

/**
 * PUT /api/workbench/services/[id]/toggle-status
 * Toggle service active/inactive status
 */
export const PUT = AuthGuard.withAuth(async (request: NextRequest) => {
  try {
    // Extract service short name from URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const serviceShortName = pathSegments[pathSegments.length - 2]; // Get ID from path (before 'toggle-status')
    const body = await request.json();
    const { isActive } = body;
    
    if (!serviceShortName) {
      return NextResponse.json(
        { success: false, error: 'Service short name is required' },
        { status: 400 }
      );
    }
    
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'isActive field is required and must be a boolean' 
        },
        { status: 400 }
      );
    }
    
    const result = await ServiceManagementController.toggleServiceStatusByShortName(serviceShortName, isActive);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in PUT /api/workbench/services/[id]/toggle-status:', error);
    
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
        error: error instanceof Error ? error.message : 'Failed to toggle service status' 
      },
      { status: 500 }
    );
  }
});
