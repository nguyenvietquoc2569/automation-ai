import { NextRequest, NextResponse } from 'next/server';
import { registerUserWithService, RegistrationData } from '@automation-ai/services';
import { initializeDatabase } from '@automation-ai/database';

export async function POST(request: NextRequest) {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    const body = await request.json();
    
    // Validate required fields
    const { firstName, lastName, email, password, serviceName, serviceDescription } = body;
    
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, email, password' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Prepare registration data
    const fullName = `${firstName} ${lastName}`;
    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const registrationData: RegistrationData = {
      user: {
        name: fullName,
        username: username,
        ename: fullName,
        password: password,
        emailid: email,
        title: body.title || 'User'
      },
      service: {
        serviceName: serviceName || `${fullName}'s Default Service`,
        description: serviceDescription || `Personal automation service for ${fullName}`,
        serviceShortName: `${username}-service`,
        category: body.serviceCategory || 'OTHER',
        tags: body.serviceTags || ['personal', 'automation']
      }
    };

    // Register user with service using the actual service
    const result = await registerUserWithService(registrationData);

    // Return success response with sanitized data (no password)
    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: result.user.id,
          name: result.user.name,
          username: result.user.username,
          emailid: result.user.emailid,
          title: result.user.title
        },
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          displayName: result.organization.displayName
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration API error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('already exists') || error.message.includes('unique')) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }
      
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid data provided' },
          { status: 400 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'User Registration API',
    timestamp: new Date().toISOString(),
    note: 'Registration API with full database integration'
  });
}
