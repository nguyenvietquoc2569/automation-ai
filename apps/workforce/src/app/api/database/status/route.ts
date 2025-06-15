import { NextResponse } from 'next/server';
import { getDatabaseStatus, initializeDatabase } from '@automation-ai/database';

export async function GET() {
  try {
    const status = getDatabaseStatus();
    
    return NextResponse.json({
      database: status,
      message: status.initialized ? 'Database is connected' : 'Database not initialized'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to get database status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await initializeDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
