# 🔄 **Organization Switch API Documentation**

## **API Endpoint: `/api/auth/switch-organization`**

This API allows authenticated users to switch between organizations they have access to. It includes proper authentication guards and comprehensive error handling.

---

## **🛡️ Authentication & Security**

### **Authentication Guards**
- **Middleware Protection**: Route is protected by Next.js middleware
- **Session Validation**: Uses `AuthGuard.withAuth()` wrapper for automatic session validation
- **Permission Checking**: Validates user access to target organization
- **IP Validation**: Logs IP addresses for security auditing

### **Security Features**
- **HttpOnly Cookies**: Session tokens stored securely
- **CSRF Protection**: SameSite cookie settings
- **Input Validation**: JSON parsing with error handling
- **Error Sanitization**: Generic error messages to prevent information leakage

---

## **📋 API Endpoints**

### **GET /api/auth/switch-organization**
Get available organizations for the current user.

#### **Request**
```bash
GET /api/auth/switch-organization
Headers:
  - Cookie: sessionToken=<token>
  - Authorization: Bearer <token> (optional)
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "currentOrganization": {
      "id": "org_123",
      "name": "Acme Corp",
      "displayName": "Acme Corporation",
      "logo": "https://example.com/logo.png",
      "subscription": {
        "plan": "premium",
        "features": ["feature1", "feature2"]
      }
    },
    "availableOrganizations": [
      {
        "id": "org_123",
        "name": "Acme Corp",
        "displayName": "Acme Corporation",
        "logo": "https://example.com/logo.png"
      },
      {
        "id": "org_456",
        "name": "Tech Solutions",
        "displayName": "Tech Solutions Ltd",
        "logo": "https://example.com/logo2.png"
      }
    ],
    "canSwitchOrganizations": true
  }
}
```

### **POST /api/auth/switch-organization**
Switch to a different organization.

#### **Request**
```bash
POST /api/auth/switch-organization
Headers:
  - Content-Type: application/json
  - Cookie: sessionToken=<token>
  - Authorization: Bearer <token> (optional)

Body:
{
  "organizationId": "org_456"
}
```

#### **Response**
```json
{
  "success": true,
  "message": "Organization switched successfully",
  "data": {
    "sessionToken": "new_session_token_with_org_context",
    "refreshToken": "new_refresh_token",
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "emailid": "john@example.com"
    },
    "currentOrg": {
      "id": "org_456",
      "name": "Tech Solutions",
      "displayName": "Tech Solutions Ltd",
      "logo": "https://example.com/logo2.png",
      "subscription": {
        "plan": "basic",
        "features": ["feature1"]
      }
    },
    "availableOrgs": [...],
    "permissions": ["read", "write"],
    "roles": ["member"],
    "expiresAt": "2025-06-17T10:30:00Z"
  }
}
```

---

## **🔐 Authentication Guard System**

### **AuthGuard Utilities**

#### **Basic Authentication**
```typescript
// Wrap any API handler with authentication
export const GET = AuthGuard.withAuth(async (request, session) => {
  // session is automatically validated and provided
  return NextResponse.json({ user: session.user });
});
```

#### **Permission-Based Protection**
```typescript
// Require specific permission
export const POST = AuthGuard.withPermission('organization:switch', 
  async (request, session) => {
    // Only users with 'organization:switch' permission can access
  }
);
```

#### **Role-Based Protection**
```typescript
// Require specific role(s)
export const DELETE = AuthGuard.withRole(['admin', 'manager'], 
  async (request, session) => {
    // Only admins or managers can access
  }
);
```

#### **Organization Scoped**
```typescript
// Automatically get current organization context
export const GET = AuthGuard.withOrganization(
  async (request, session, orgId) => {
    // orgId is automatically extracted from session
  }
);
```

### **Middleware Configuration**

#### **Protected Routes**
The following API routes are automatically protected:
- `/api/auth/me`
- `/api/auth/logout`
- `/api/auth/switch-organization`
- `/api/user/*`
- `/api/organization/*`
- `/api/admin/*`

#### **Public Routes**
The following API routes are public (no authentication required):
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/forgot-password`
- `/api/auth/reset-password`
- `/api/health`
- `/api/status`

---

## **🎯 Usage Examples**

### **Frontend Integration**

#### **Get Available Organizations**
```typescript
const getAvailableOrganizations = async () => {
  const response = await fetch('/api/auth/switch-organization', {
    credentials: 'include'
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.data.availableOrganizations;
  }
  
  throw new Error('Failed to get organizations');
};
```

#### **Switch Organization**
```typescript
const switchOrganization = async (organizationId: string) => {
  const response = await fetch('/api/auth/switch-organization', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ organizationId })
  });
  
  if (response.ok) {
    const data = await response.json();
    // Session is automatically updated via cookies
    // Refresh page or update app state
    window.location.reload();
    return data;
  }
  
  throw new Error('Failed to switch organization');
};
```

### **React Hook Example**
```typescript
const useOrganizationSwitcher = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const orgs = await getAvailableOrganizations();
      setOrganizations(orgs);
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const switchTo = async (orgId: string) => {
    try {
      setLoading(true);
      await switchOrganization(orgId);
    } catch (error) {
      console.error('Failed to switch organization:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return { organizations, loading, loadOrganizations, switchTo };
};
```

---

## **❌ Error Responses**

### **401 Unauthorized**
```json
{
  "error": "No session token provided"
}
```

### **403 Forbidden**
```json
{
  "error": "Access denied to the specified organization"
}
```

### **404 Not Found**
```json
{
  "error": "Organization not found or inactive"
}
```

### **400 Bad Request**
```json
{
  "error": "Organization ID is required"
}
```

### **500 Internal Server Error**
```json
{
  "error": "Organization switch failed"
}
```

---

## **🔄 Session Management**

### **Cookie Updates**
When switching organizations, the API automatically:
1. **Updates session token** with new organization context
2. **Refreshes cookies** with new expiration times
3. **Maintains security settings** (httpOnly, secure, sameSite)
4. **Updates refresh token** if applicable

### **Session Context**
After switching, the session includes:
- **New organization details** in `currentOrg`
- **Updated permissions** based on new organization
- **Updated roles** for the new organization context
- **Same user identity** (user doesn't change)

---

## **🛠️ Technical Implementation**

### **Database Operations**
1. **Session Validation**: Validates current session token
2. **User Lookup**: Finds user and verifies organization access
3. **Organization Validation**: Checks if target org exists and is active
4. **Session Update**: Updates session with new organization context
5. **User Update**: Updates user's current organization preference

### **Security Considerations**
- **Access Control**: Users can only switch to organizations they belong to
- **Audit Logging**: All organization switches are logged with IP addresses
- **Token Refresh**: Session tokens are refreshed to include new context
- **State Consistency**: Database and session state remain synchronized

### **Performance Optimizations**
- **Single Database Query**: Efficient organization access validation
- **Cached Session Data**: Session includes pre-computed organization list
- **Minimal Token Updates**: Only updates necessary token fields

---

## **🚀 Benefits**

### **For Users**
✅ **Seamless Switching** - No need to log out and back in  
✅ **Secure Access** - Only authorized organizations are accessible  
✅ **Context Preservation** - Session maintains user preferences  
✅ **Real-time Updates** - Immediate access to new organization resources  

### **For Developers**
✅ **Easy Integration** - Simple API calls with automatic session management  
✅ **Consistent Security** - Built-in authentication guards  
✅ **Error Handling** - Comprehensive error responses  
✅ **Type Safety** - Full TypeScript support  

### **For Organizations**
✅ **Access Control** - Strict organization boundaries  
✅ **Audit Trail** - Complete logging of organization access  
✅ **Multi-tenancy** - Clean separation of organizational data  
✅ **Security Compliance** - Enterprise-grade security standards  

---

**🎉 The Organization Switch API provides a secure, efficient way to manage multi-organization access with enterprise-grade security and developer-friendly implementation!**
