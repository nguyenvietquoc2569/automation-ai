import { Service } from './models/service.model';
import { ServiceCategory, CreateServiceDto } from '@automation-ai/types';

/**
 * Service management utility class
 * Provides CRUD operations and utility methods for agent services
 */
export class ServiceManager {
  /**
   * Create a new service
   */
  static async createService(serviceData: CreateServiceDto) {
    try {
      // Check if service with same short name already exists
      const existingService = await Service.findOne({ 
        serviceShortName: serviceData.serviceShortName 
      });
      
      if (existingService) {
        throw new Error(`Service with short name '${serviceData.serviceShortName}' already exists`);
      }
      
      const service = new Service(serviceData);
      await service.save();
      
      return service;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }
  
  /**
   * Get service by short name
   */
  static async getServiceByShortName(serviceShortName: string) {
    try {
      return await Service.findOne({ serviceShortName });
    } catch (error) {
      console.error('Error getting service by short name:', error);
      throw error;
    }
  }
  
  /**
   * Get service by ID
   */
  static async getServiceById(id: string) {
    try {
      return await Service.findById(id);
    } catch (error) {
      console.error('Error getting service by ID:', error);
      throw error;
    }
  }
  
  /**
   * Get all services by category
   */
  static async getServicesByCategory(category: ServiceCategory) {
    try {
      return await Service.findByCategory(category);
    } catch (error) {
      console.error('Error getting services by category:', error);
      throw error;
    }
  }
  
  /**
   * Get services by tags
   */
  static async getServicesByTags(tags: string[]) {
    try {
      return await Service.findByTags(tags);
    } catch (error) {
      console.error('Error getting services by tags:', error);
      throw error;
    }
  }
  
  /**
   * Search services by text
   */
  static async searchServices(searchText: string) {
    try {
      return await Service.searchByText(searchText);
    } catch (error) {
      console.error('Error searching services:', error);
      throw error;
    }
  }
  
  /**
   * Update service
   */
  static async updateService(updateData: { _id: string } & Partial<CreateServiceDto>) {
    try {
      const { _id, ...updateFields } = updateData;
      
      const service = await Service.findByIdAndUpdate(
        _id,
        updateFields,
        { new: true, runValidators: true }
      );
      
      if (!service) {
        throw new Error(`Service with ID '${_id}' not found`);
      }
      
      return service;
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
      
      return service;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }
  
  /**
   * Get all services with pagination
   */
  static async getAllServices(page = 1, limit = 10, sortBy = 'serviceName') {
    try {
      const skip = (page - 1) * limit;
      const sortOrder: Record<string, 1 | -1> = { [sortBy]: 1 };
      
      const [services, total] = await Promise.all([
        Service.find({})
          .sort(sortOrder)
          .skip(skip)
          .limit(limit),
        Service.countDocuments({})
      ]);
      
      return {
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
    } catch (error) {
      console.error('Error getting all services:', error);
      throw error;
    }
  }
  
  /**
   * Get popular services
   */
  static async getPopularServices(limit = 10) {
    try {
      return await Service.getPopular(limit);
    } catch (error) {
      console.error('Error getting popular services:', error);
      throw error;
    }
  }
  
  /**
   * Add tag to service
   */
  static async addTagToService(serviceId: string, tag: string) {
    try {
      const service = await Service.findById(serviceId);
      if (!service) {
        throw new Error(`Service with ID '${serviceId}' not found`);
      }
      
      return await service.addTag(tag);
    } catch (error) {
      console.error('Error adding tag to service:', error);
      throw error;
    }
  }
  
  /**
   * Remove tag from service
   */
  static async removeTagFromService(serviceId: string, tag: string) {
    try {
      const service = await Service.findById(serviceId);
      if (!service) {
        throw new Error(`Service with ID '${serviceId}' not found`);
      }
      
      return await service.removeTag(tag);
    } catch (error) {
      console.error('Error removing tag from service:', error);
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
      
      return {
        totalServices,
        servicesByCategory,
        recentServices
      };
    } catch (error) {
      console.error('Error getting service statistics:', error);
      throw error;
    }
  }
}
