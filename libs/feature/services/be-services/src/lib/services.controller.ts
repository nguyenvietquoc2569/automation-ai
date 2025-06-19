import { Service } from '@automation-ai/database';
import { IService } from '@automation-ai/types';

export interface ServiceListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ServiceListResponse {
  success: boolean;
  data: IService[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: string;
  };
  error?: string;
}

interface ServiceFilter {
  isActive: boolean;
  $or?: Array<{
    serviceName?: { $regex: string; $options: string };
    description?: { $regex: string; $options: string };
    tags?: { $in: RegExp[] };
  }>;
  category?: string;
}

interface SortOptions {
  [key: string]: 1 | -1;
}

/**
 * Services Controller for public service listing
 */
export class ServicesController {
  /**
   * Get all public services with filtering and pagination
   */
  static async getServices(query: ServiceListQuery): Promise<ServiceListResponse> {
    try {
      const {
        page = 1,
        limit = 12,
        search = '',
        category = '',
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = query;

      // Build filter conditions
      const filter: ServiceFilter = {
        isActive: true // Only show active services
      };

      // Add search filter
      if (search) {
        filter.$or = [
          { serviceName: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      // Add category filter
      if (category) {
        filter.category = category;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Build sort options
      const sortOptions: SortOptions = {};
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute queries
      const [services, totalCount] = await Promise.all([
        Service.find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        Service.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: services.map(service => ({
          ...service,
          _id: service._id.toString()
        })) as IService[],
        pagination: {
          current: page,
          pageSize: limit,
          total: totalCount,
          totalPages
        },
        filters: {
          search,
          category,
          sortBy,
          sortOrder
        }
      };
    } catch (error) {
      console.error('Error getting services:', error);
      return {
        success: false,
        data: [],
        pagination: {
          current: 1,
          pageSize: 12,
          total: 0,
          totalPages: 0
        },
        filters: {},
        error: 'Failed to retrieve services'
      };
    }
  }

  /**
   * Get service by short name
   */
  static async getServiceByShortName(serviceShortName: string) {
    try {
      const service = await Service.findOne({ 
        serviceShortName,
        isActive: true 
      }).lean();
      
      if (!service) {
        return {
          success: false,
          error: 'Service not found'
        };
      }
      
      return {
        success: true,
        data: service
      };
    } catch (error) {
      console.error('Error getting service by short name:', error);
      return {
        success: false,
        error: 'Failed to retrieve service'
      };
    }
  }

  /**
   * Get available categories
   */
  static async getCategories() {
    try {
      const categories = await Service.distinct('category', { isActive: true });
      
      return {
        success: true,
        data: categories.filter(Boolean) // Remove null/undefined values
      };
    } catch (error) {
      console.error('Error getting categories:', error);
      return {
        success: false,
        data: [],
        error: 'Failed to retrieve categories'
      };
    }
  }
}
