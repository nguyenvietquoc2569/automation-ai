import { NextRequest, NextResponse } from 'next/server';
import { databaseService, Service, Subscription } from '@automation-ai/database';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: serviceId } = await params;
    
    if (!serviceId) {
      return NextResponse.json({
        success: false,
        error: 'Service ID is required'
      }, { status: 400 });
    }

    // Initialize database if not ready
    if (!databaseService.isReady()) {
      await databaseService.initialize();
    }

    // Validate if it's a valid ObjectId
    let query: { _id: ObjectId } | { serviceShortName: string };
    if (ObjectId.isValid(serviceId)) {
      query = { _id: new ObjectId(serviceId) };
    } else {
      // If not ObjectId, try to find by shortName
      query = { serviceShortName: serviceId };
    }

    const service = await Service.findOne(query);

    if (!service) {
      return NextResponse.json({
        success: false,
        error: 'Service not found'
      }, { status: 404 });
    }

    // Convert to plain object to avoid Mongoose metadata
    const serviceData = service.toObject();

    // Check subscription status if userId is provided in query params
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    let isSubscribed = false;
    
    if (userId && ObjectId.isValid(userId)) {
      const subscription = await Subscription.findOne({
        serviceId: serviceData._id,
        userId: new ObjectId(userId),
        status: 'active'
      });
      isSubscribed = !!subscription;
    }

    // Enhanced service detail with mock data for demo
    const serviceDetail = {
      ...serviceData,
      longDescription: serviceData.description || `
        <h3>Welcome to ${serviceData.serviceName}</h3>
        <p>This is a comprehensive service designed to help you automate your workflow and increase productivity.</p>
        <p>Our service provides cutting-edge features that are built with modern technology stack and industry best practices.</p>
        <h4>What makes us different:</h4>
        <ul>
          <li>Easy to integrate and use</li>
          <li>Scalable and reliable infrastructure</li>
          <li>24/7 customer support</li>
          <li>Regular updates and improvements</li>
        </ul>
      `,
      features: [
        'Advanced automation capabilities',
        'Real-time data processing',
        'Secure and compliant infrastructure',
        'Easy integration with existing systems',
        'Comprehensive analytics and reporting',
        'Multi-language support'
      ],
      author: {
        name: 'Automation AI Team',
        company: 'Automation AI',
        avatar: '/api/placeholder/40/40'
      },
      stats: {
        downloads: Math.floor(Math.random() * 10000) + 1000,
        rating: 4.5 + Math.random() * 0.5,
        reviews: Math.floor(Math.random() * 500) + 50
      },
      pricing: {
        plan: 'Professional',
        price: 29.99,
        currency: '$',
        period: 'month'
      },
      isSubscribed: isSubscribed
    };

    return NextResponse.json({
      success: true,
      data: serviceDetail
    });

  } catch (error) {
    console.error('Error fetching service detail:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
