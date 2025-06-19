# Service Management Workbench Documentation

## Overview

The Service Management feature is part of the Workbench module, providing a comprehensive interface to manage automation services within the platform. It allows users to create, read, update, delete, and manage the status of services.

## URL Access

**Service Management:** `/dashboard/workbench/service-management`

## Features

### 🔧 **Service CRUD Operations**

#### **Create Service**
- Click the "Create Service" button in the top-right corner
- Fill out the required fields:
  - **Service Name**: Human-readable name for the service
  - **Service Short Name**: Unique identifier (alphanumeric, hyphens, underscores only)
  - **Description**: Detailed description of the service
  - **Category**: Select from predefined categories (AUTOMATION, INTEGRATION, etc.)
  - **Tags**: Optional tags for categorization and filtering

#### **View Services**
- Services are displayed in a responsive table format
- Pagination support for large datasets
- Shows service details including name, description, category, tags, and status

#### **Edit Service**
- Click the edit icon (pencil) next to any service
- Modify service details (note: short name cannot be changed after creation)
- Save changes with validation

#### **Delete Service**
- Click the delete icon (trash) next to any service
- Confirm deletion in the popup dialog
- Service will be permanently removed

### 🔍 **Search & Filtering**

#### **Text Search**
- Use the search box to find services by:
  - Service name
  - Description
  - Service short name

#### **Category Filter**
- Filter services by category using the dropdown
- Available categories:
  - AUTOMATION
  - INTEGRATION
  - ANALYTICS
  - MONITORING
  - SECURITY
  - COMMUNICATION
  - STORAGE
  - COMPUTE
  - NETWORKING
  - DATABASE
  - OTHER

### ⚡ **Service Status Management**

#### **Active/Inactive Toggle**
- Each service has a status indicator (green = active, red = inactive)
- Toggle service status using the switch next to the status badge
- Status changes are applied immediately
- Visual feedback shows current status

### 📊 **Table Features**

#### **Pagination**
- Navigate through pages of services
- Configurable page size (10, 20, 50, 100 items per page)
- Quick jump to specific pages
- Shows total count and current range

#### **Responsive Design**
- Table adapts to different screen sizes
- Tooltips for truncated content
- Mobile-friendly interface

## API Endpoints

### **Backend API Routes**

#### **Get All Services**
```
GET /api/workbench/services
Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 10)
- search: Text search query
- category: Filter by category
- tags: Comma-separated list of tags
- sortBy: Field to sort by (default: serviceName)
- sortOrder: asc or desc (default: asc)
```

#### **Create Service**
```
POST /api/workbench/services
Body: {
  serviceName: string,
  serviceShortName: string,
  description: string,
  category: ServiceCategory,
  tags: string[]
}
```

#### **Get Service by ID**
```
GET /api/workbench/services/{id}
```

#### **Update Service**
```
PUT /api/workbench/services/{id}
Body: Partial service data
```

#### **Delete Service**
```
DELETE /api/workbench/services/{id}
```

#### **Toggle Service Status**
```
PUT /api/workbench/services/{id}/toggle-status
Body: { isActive: boolean }
```

## Database Schema

### **Service Model**
```typescript
interface Service {
  _id: string;
  serviceName: string;           // Human-readable name
  serviceShortName: string;      // Unique identifier
  description: string;           // Service description
  category: ServiceCategory;     // Service category
  tags: string[];               // Array of tags
  isActive?: boolean;           // Service status (default: true)
  createdAt: Date;              // Creation timestamp
  updatedAt: Date;              // Last update timestamp
}
```

## Usage Examples

### **Creating a New Service**

1. Navigate to `/dashboard/workbench/service-management`
2. Click "Create Service" button
3. Fill out the form:
   ```
   Service Name: Facebook Auto Post Agent Service
   Service Short Name: facebook-auto-post
   Description: Automated posting service for Facebook social media platform
   Category: AUTOMATION
   Tags: facebook, social-media, automation, posting
   ```
4. Click "Create Service"

### **Managing Service Status**

1. Locate the service in the table
2. Find the status column with the toggle switch
3. Click the switch to toggle between Active/Inactive
4. Status change is applied immediately

### **Searching for Services**

1. Use the search box to find services:
   - Type "facebook" to find Facebook-related services
   - Type "automation" to find automation services
2. Use category filter to narrow results
3. Results update in real-time

## Error Handling

### **Common Errors**
- **Duplicate Short Name**: Service short names must be unique
- **Validation Errors**: Required fields must be filled
- **Network Errors**: Connection issues with the server
- **Permission Errors**: User doesn't have access to modify services

### **Error Messages**
- Clear, user-friendly error messages displayed via notifications
- Form validation errors shown inline
- API errors handled gracefully with fallback messages

## Security

### **Authentication**
- All API endpoints require authentication
- Uses existing session management system
- Automatically redirects to login if not authenticated

### **Authorization**
- Service management requires appropriate permissions
- Operations are logged for audit purposes

## Performance

### **Optimization Features**
- Pagination to handle large datasets
- Debounced search to reduce API calls
- Caching for better performance
- Responsive loading states

## Future Enhancements

- [ ] Bulk operations (activate/deactivate multiple services)
- [ ] Service templates and cloning
- [ ] Advanced filtering options
- [ ] Service usage analytics
- [ ] Import/export functionality
- [ ] Service dependency management
- [ ] Version control for service configurations

## Technical Architecture

### **Frontend Libraries**
- `@automation-ai/service-managemant-fe`: React components
- Built with Ant Design for consistent UI
- TypeScript for type safety
- Responsive design patterns

### **Backend Libraries**
- `@automation-ai/service-managemant-be`: API controllers
- `@automation-ai/database`: Data access layer
- MongoDB for data storage
- Express.js/Next.js API routes

### **Integration**
- Uses existing dashboard layout
- Integrates with session management
- Follows established patterns and conventions
