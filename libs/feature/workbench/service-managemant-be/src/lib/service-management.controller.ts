import { Service } from '@automation-ai/database';
import { ServiceCategory, CreateServiceDto } from '@automation-ai/types';

/**
 * Service Management API Controller
 * Handles CRUD operations for services in the workbench
 */
export class ServiceManagementController {
  
  /**
   * Get all services with pagination and filtering
   */
  static async getServices(params: {
    page?: number;
    limit?: number;
    category?: ServiceCategory;
    search?: string;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        search,
        tags,
        sortBy = 'serviceName',
        sortOrder = 'asc'
      } = params;

      // Build query
      const queryConditions: Record<string, unknown> = {};
      
      if (category) {
        queryConditions.category = category;
      }
      
      if (tags && tags.length > 0) {
        queryConditions.tags = { $in: tags };
      }
      
      if (search) {
        queryConditions.$or = [
          { serviceName: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { serviceShortName: { $regex: search, $options: 'i' } }
        ];
      }

      // Get services with pagination
      const skip = (page - 1) * limit;
      const mongoSortOrder: Record<string, 1 | -1> = { [sortBy]: 1 };
      
      const [services, total] = await Promise.all([
        Service.find(queryConditions)
          .sort(mongoSortOrder)
          .skip(skip)
          .limit(limit),
        Service.countDocuments(queryConditions)
      ]);
      
      const result = {
        services,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
      
      return {
        success: true,
        data: result.services,
        pagination: result.pagination,
        filters: {
          category,
          search,
          tags,
          sortBy,
          sortOrder
        }
      };
    } catch (error) {
      console.error('Error getting services:', error);
      throw new Error('Failed to retrieve services');
    }
  }
  
  /**
   * Get service by ID
   */
  static async getServiceById(id: string) {
    try {
      const service = await Service.findById(id);
      
      if (!service) {
        throw new Error('Service not found');
      }
      
      return {
        success: true,
        data: service
      };
    } catch (error) {
      console.error('Error getting service by ID:', error);
      throw error;
    }
  }
  
  /**
   * Create new service
   */
  static async createService(serviceData: CreateServiceDto) {
    try {
      // Validate required fields
      if (!serviceData.serviceName || !serviceData.description || !serviceData.serviceShortName) {
        throw new Error('Service name, description, and short name are required');
      }
      
      // Check if service with same short name already exists
      const existingService = await Service.findOne({ 
        serviceShortName: serviceData.serviceShortName 
      });
      
      if (existingService) {
        throw new Error(`Service with short name '${serviceData.serviceShortName}' already exists`);
      }
      
      const service = new Service(serviceData);
      await service.save();
      
      return {
        success: true,
        data: service,
        message: 'Service created successfully'
      };
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }
  
  /**
   * Update service
   */
  static async updateService(id: string, updateData: Partial<CreateServiceDto>) {
    try {
      const service = await Service.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!service) {
        throw new Error(`Service with ID '${id}' not found`);
      }
      
      return {
        success: true,
        data: service,
        message: 'Service updated successfully'
      };
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }
  
  /**
   * Delete service
   */
  static async deleteService(id: string) {
    try {
      const service = await Service.findByIdAndDelete(id);
      
      if (!service) {
        throw new Error(`Service with ID '${id}' not found`);
      }
      
      return {
        success: true,
        data: service,
        message: 'Service deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }
  
  /**
   * Toggle service status (activate/deactivate)
   */
  static async toggleServiceStatus(id: string, isActive: boolean) {
    try {
      const service = await Service.findByIdAndUpdate(
        id,
        { isActive },
        { new: true, runValidators: true }
      );
      
      if (!service) {
        throw new Error(`Service with ID '${id}' not found`);
      }
      
      return {
        success: true,
        data: service,
        message: `Service ${isActive ? 'activated' : 'deactivated'} successfully`
      };
    } catch (error) {
      console.error('Error toggling service status:', error);
      throw error;
    }
  }
  
  /**
   * Get service statistics
   */
  static async getServiceStats() {
    try {
      const [
        totalServices,
        servicesByCategory,
        recentServices
      ] = await Promise.all([
        Service.countDocuments({}),
        Service.aggregate([
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 }
            }
          },
          {
            $sort: { count: -1 }
          }
        ]),
        Service.find({})
          .sort({ createdAt: -1 })
          .limit(5)
          .select('serviceName serviceShortName category createdAt')
      ]);
      
      const stats = {
        totalServices,
        servicesByCategory,
        recentServices
      };
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting service statistics:', error);
      throw error;
    }
  }
  
  /**
   * Search services
   */
  static async searchServices(searchText: string) {
    try {
      const services = await Service.find({
        $text: { $search: searchText }
      }).sort({ score: { $meta: 'textScore' } });
      
      return {
        success: true,
        data: services
      };
    } catch (error) {
      console.error('Error searching services:', error);
      throw error;
    }
  }
  
  /**
   * Get services by category
   */
  static async getServicesByCategory(category: ServiceCategory) {
    try {
      const services = await Service.find({ category });
      
      return {
        success: true,
        data: services
      };
    } catch (error) {
      console.error('Error getting services by category:', error);
      throw error;
    }
  }
  
  /**
   * Add tag to service
   */
  static async addTagToService(id: string, tag: string) {
    try {
      const service = await Service.findById(id);
      if (!service) {
        throw new Error(`Service with ID '${id}' not found`);
      }
      
      const normalizedTag = tag.toLowerCase().trim();
      if (!service.tags.includes(normalizedTag)) {
        service.tags.push(normalizedTag);
        await service.save();
      }
      
      return {
        success: true,
        data: service,
        message: 'Tag added successfully'
      };
    } catch (error) {
      console.error('Error adding tag to service:', error);
      throw error;
    }
  }
  
  /**
   * Remove tag from service
   */
  static async removeTagFromService(id: string, tag: string) {
    try {
      const service = await Service.findById(id);
      if (!service) {
        throw new Error(`Service with ID '${id}' not found`);
      }
      
      const normalizedTag = tag.toLowerCase().trim();
      service.tags = service.tags.filter(t => t !== normalizedTag);
      await service.save();
      
      return {
        success: true,
        data: service,
        message: 'Tag removed successfully'
      };
    } catch (error) {
      console.error('Error removing tag from service:', error);
      throw error;
    }
  }
}
