export interface ServiceListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Service {
  _id: string;
  serviceName: string;
  description: string;
  category: string;
  tags: string[];
  serviceShortName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceListResponse {
  success: boolean;
  data: Service[];
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

export interface CategoryResponse {
  success: boolean;
  data: string[];
  error?: string;
}

export type ViewMode = 'card' | 'list';

export interface ServiceFilters {
  search: string;
  category: string;
}

export interface ServiceSort {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
