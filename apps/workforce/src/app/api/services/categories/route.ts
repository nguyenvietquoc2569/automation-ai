import { NextRequest, NextResponse } from 'next/server';
import { ServicesController } from '@automation-ai/be-services';

/**
 * GET /api/services/categories
 * Get all available service categories
 */
export async function GET(request: NextRequest) {
  try {
    const result = await ServicesController.getCategories();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/services/categories:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        data: []
      },
      { status: 500 }
    );
  }
}
