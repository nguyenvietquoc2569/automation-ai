import { ServiceManager } from '@automation-ai/database';
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
      const result = await ServiceManager.getAllServices(page, limit, sortBy);
      
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
      const service = await ServiceManager.getServiceById(id);
      
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
      
      const service = await ServiceManager.createService(serviceData);
      
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
      const service = await ServiceManager.updateService({
        _id: id,
        ...updateData
      });
      
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
      const service = await ServiceManager.deleteService(id);
      
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
      // Add isActive field to service if it doesn't exist
      const service = await ServiceManager.updateService({
        _id: id,
        isActive
      });
      
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
      const stats = await ServiceManager.getServiceStats();
      
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
      const services = await ServiceManager.searchServices(searchText);
      
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
      const services = await ServiceManager.getServicesByCategory(category);
      
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
      const service = await ServiceManager.addTagToService(id, tag);
      
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
      const service = await ServiceManager.removeTagFromService(id, tag);
      
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
