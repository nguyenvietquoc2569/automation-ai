import { NextRequest, NextResponse } from 'next/server';
import { databaseService, Service, Subscription } from '@automation-ai/database';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: serviceId } = await params;
    const body = await request.json();
    const { userId } = body;
    
    if (!serviceId || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Service ID and User ID are required'
      }, { status: 400 });
    }

    // Initialize database if not ready
    if (!databaseService.isReady()) {
      await databaseService.initialize();
    }

    // Check if service exists
    let serviceQuery: { _id: ObjectId } | { serviceShortName: string };
    if (ObjectId.isValid(serviceId)) {
      serviceQuery = { _id: new ObjectId(serviceId) };
    } else {
      serviceQuery = { serviceShortName: serviceId };
    }

    const service = await Service.findOne(serviceQuery);
    if (!service) {
      return NextResponse.json({
        success: false,
        error: 'Service not found'
      }, { status: 404 });
    }

    // Check if already subscribed (including any existing subscription regardless of status)
    const existingSubscription = await Subscription.findOne({
      serviceId: service._id,
      userId: new ObjectId(userId)
    });

    if (existingSubscription) {
      // If subscription exists but is not active, reactivate it
      if (existingSubscription.status !== 'active') {
        existingSubscription.status = 'active';
        existingSubscription.subscribedAt = new Date();
        existingSubscription.unsubscribedAt = undefined;
        const updatedSubscription = await existingSubscription.save();
        
        return NextResponse.json({
          success: true,
          data: {
            subscriptionId: updatedSubscription._id,
            serviceId: service._id,
            userId,
            subscribedAt: updatedSubscription.subscribedAt
          }
        });
      } else {
        // Already active subscription
        return NextResponse.json({
          success: false,
          error: 'Already subscribed to this service'
        }, { status: 409 });
      }
    }

    // Create subscription
    const subscription = new Subscription({
      serviceId: service._id,
      userId: new ObjectId(userId),
      subscribedAt: new Date(),
      status: 'active'
    });

    const savedSubscription = await subscription.save();

    return NextResponse.json({
      success: true,
      data: {
        subscriptionId: savedSubscription._id,
        serviceId: service._id,
        userId,
        subscribedAt: savedSubscription.subscribedAt
      }
    });

  } catch (error) {
    console.error('Error subscribing to service:', error);
    
    // Handle duplicate key error specifically
    if (error instanceof Error && error.message.includes('E11000')) {
      return NextResponse.json({
        success: false,
        error: 'You are already subscribed to this service'
      }, { status: 409 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: serviceId } = await params;
    const body = await request.json();
    const { userId } = body;
    
    if (!serviceId || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Service ID and User ID are required'
      }, { status: 400 });
    }

    // Initialize database if not ready
    if (!databaseService.isReady()) {
      await databaseService.initialize();
    }

    // Check if service exists
    let serviceQuery: { _id: ObjectId } | { serviceShortName: string };
    if (ObjectId.isValid(serviceId)) {
      serviceQuery = { _id: new ObjectId(serviceId) };
    } else {
      serviceQuery = { serviceShortName: serviceId };
    }

    const service = await Service.findOne(serviceQuery);
    if (!service) {
      return NextResponse.json({
        success: false,
        error: 'Service not found'
      }, { status: 404 });
    }

    // Remove subscription (soft delete by changing status)
    const result = await Subscription.findOneAndUpdate(
      {
        serviceId: service._id,
        userId: new ObjectId(userId),
        status: 'active'
      },
      {
        status: 'cancelled',
        unsubscribedAt: new Date()
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'Active subscription not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        serviceId: service._id,
        userId,
        unsubscribedAt: result.unsubscribedAt
      }
    });

  } catch (error) {
    console.error('Error unsubscribing from service:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
