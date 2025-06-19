export interface ServiceDetailResponse {
  success: boolean;
  data?: ServiceDetail;
  error?: string;
}

export interface ServiceDetail {
  _id: string;
  serviceName: string;
  description: string;
  category: string;
  tags: string[];
  serviceShortName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Additional fields for detail view
  longDescription?: string;
  features?: string[];
  pricing?: {
    plan: string;
    price: number;
    currency: string;
    period: string;
  };
  author?: {
    name: string;
    company: string;
    avatar?: string;
  };
  stats?: {
    downloads: number;
    rating: number;
    reviews: number;
  };
  isSubscribed?: boolean;
}

export interface SubscriptionRequest {
  serviceId: string;
  userId: string;
}

export interface SubscriptionResponse {
  success: boolean;
  data?: {
    subscriptionId: string;
    serviceId: string;
    userId: string;
    subscribedAt: string;
  };
  error?: string;
}

export class ServiceDetailAPI {
  private baseUrl: string;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  async getServiceDetail(serviceId: string, userId?: string): Promise<ServiceDetailResponse> {
    try {
      const url = new URL(`${this.baseUrl}/services/${serviceId}`, window.location.origin);
      if (userId) {
        url.searchParams.set('userId', userId);
      }
      const response = await fetch(url.toString());
      return await response.json() as ServiceDetailResponse;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch service detail'
      };
    }
  }

  async subscribeToService(serviceId: string, userId: string): Promise<SubscriptionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/services/${serviceId}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId, userId }),
      });
      return await response.json() as SubscriptionResponse;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to subscribe to service'
      };
    }
  }

  async unsubscribeFromService(serviceId: string, userId: string): Promise<SubscriptionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/services/${serviceId}/subscribe`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      return await response.json() as SubscriptionResponse;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unsubscribe from service'
      };
    }
  }
}

export default ServiceDetailAPI;
