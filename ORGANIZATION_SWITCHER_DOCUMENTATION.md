# Organization Switcher Documentation

## Overview

The Organization Switcher is a React component that allows users to switch between different organizations they have access to in the dashboard header. It integrates with the session management system to provide seamless organization switching with automatic data reload.

## Features

✅ **Multi-organization Support**: Dropdown selection for users with access to multiple orgs  
✅ **Visual Identification**: Shows organization logos and display names  
✅ **Smart Display**: Auto-hides when user only has access to one organization  
✅ **Loading States**: Shows loading spinner during organization switching  
✅ **Error Handling**: Proper error handling for failed API calls  
✅ **Data Refresh**: Triggers full page reload to refresh all org-specific data  
✅ **Responsive Design**: Works on mobile and desktop  

## Component Location

**File:** `libs/shared/fe-dashboard/src/lib/OrganizationSwitcher.tsx`  
**Integration:** `libs/shared/fe-dashboard/src/lib/DashboardHeader.tsx`

## Props

```typescript
interface OrganizationSwitcherProps {
  style?: React.CSSProperties;           // Custom styling
  placement?: 'header' | 'sidebar';     // Display mode
  showLabel?: boolean;                   // Show/hide label
}
```

## Usage in Dashboard Header

The component is automatically integrated into the dashboard header between the notifications badge and language switcher:

```
[Logo + Title] ---- [Breadcrumbs] ---- [Notifications] [Org Switcher] [Language] [User Menu]
```

## API Integration

### Switch Organization Endpoint
- **URL:** `POST /api/auth/switch-organization`
- **Body:** `{ "organizationId": "org-uuid" }`
- **Response:** Updated session with new organization context

### Session Data Structure
```typescript
interface SessionData {
  currentOrg: SessionOrganization;        // Current active organization
  availableOrgs: Array<{                  // Organizations user can switch to
    id: string;
    name: string;
    displayName?: string;
    logo?: string;
  }>;
}
```

## How It Works

1. **Initialization**: Component reads `session.availableOrgs` from session context
2. **Display Logic**: Only shows if user has access to 2+ organizations
3. **User Selection**: User clicks dropdown and selects new organization
4. **API Call**: Component calls `switchOrganization(orgId)` from session context
5. **Backend Processing**: API validates access and updates session cookies
6. **Data Refresh**: Page reloads to refresh all organization-specific data

## Testing the Organization Switcher

### Current Behavior
- If user has access to only 1 organization: Component is hidden
- If user has access to 2+ organizations: Component shows dropdown

### To Test with Multiple Organizations
1. **Login** to the dashboard with a user account
2. **Check Console**: Look for session data to see `availableOrgs` array
3. **Backend Setup**: Ensure your user has access to multiple organizations in the database
4. **Verify Display**: Organization switcher should appear in header

### Test Data Structure
Ensure your session API returns data like this:
```json
{
  "currentOrg": {
    "id": "org-1",
    "name": "Company A",
    "displayName": "Company A Inc.",
    "logo": "https://example.com/logo-a.png"
  },
  "availableOrgs": [
    {
      "id": "org-1", 
      "name": "Company A",
      "displayName": "Company A Inc.",
      "logo": "https://example.com/logo-a.png"
    },
    {
      "id": "org-2",
      "name": "Company B", 
      "displayName": "Company B Corp.",
      "logo": "https://example.com/logo-b.png"
    }
  ]
}
```

## Error Handling

- **Invalid Organization**: Shows error if user tries to switch to unauthorized org
- **API Failure**: Displays error message and maintains current state
- **Network Issues**: Gracefully handles connection problems
- **Loading States**: Shows spinner during switch process

## Customization

### Styling
```tsx
<OrganizationSwitcher 
  style={{ minWidth: 200 }} 
  showLabel={false}
/>
```

### Placement Modes
- **Header Mode**: Compact design for dashboard header
- **Sidebar Mode**: Full-width design for sidebar integration

## Security Features

- **Access Validation**: Backend validates user has access to target organization
- **Session Management**: Proper session token handling and updates
- **CSRF Protection**: Uses secure cookies with proper attributes
- **Input Validation**: Validates organization IDs before processing

## Integration Notes

- **Session Context**: Uses `@automation-ai/fe-session-management`
- **UI Components**: Built with Ant Design components
- **Icons**: Uses `@ant-design/icons` for consistent styling
- **TypeScript**: Full type safety for all props and data structures

## Future Enhancements

- [ ] Organization search/filter for users with many orgs
- [ ] Recent organizations quick access
- [ ] Organization-specific themes/branding
- [ ] Bulk actions across multiple organizations
- [ ] Organization favorites/pinning
