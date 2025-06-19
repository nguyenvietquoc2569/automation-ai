import { NextRequest, NextResponse } from 'next/server';
import { ServicesController } from '@automation-ai/be-services';

/**
 * GET /api/services/[shortName]
 * Get service by short name
 */
export async function GET(request: NextRequest) {
  try {
    // Extract service short name from URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const serviceShortName = pathSegments[pathSegments.length - 1];
    
    if (!serviceShortName) {
      return NextResponse.json(
        { success: false, error: 'Service short name is required' },
        { status: 400 }
      );
    }
    
    const result = await ServicesController.getServiceByShortName(serviceShortName);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/services/[shortName]:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
