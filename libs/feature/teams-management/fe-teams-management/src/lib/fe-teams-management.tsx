import { useState, useEffect } from 'react';
import { useSession } from '@automation-ai/fe-session-management';
import { 
  TeamsApiService, 
  OrganizationListItem,
} from './teams-api-service';

// Styles - you can move these to CSS modules or styled-components
const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '24px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280'
  },
  tabsContainer: {
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '24px'
  },
  tabsList: {
    display: 'flex',
    gap: '0',
    listStyle: 'none',
    margin: '0',
    padding: '0'
  },
  tab: {
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none'
  },
  activeTab: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6'
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const
  },
  tableHeader: {
    backgroundColor: '#f9fafb'
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#1f2937',
    borderBottom: '1px solid #f3f4f6'
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '500'
  },
  activeStatus: {
    backgroundColor: '#dcfce7',
    color: '#166534'
  },
  inactiveStatus: {
    backgroundColor: '#fef2f2',
    color: '#dc2626'
  },
  actionButton: {
    padding: '6px 12px',
    marginRight: '8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    color: '#374151',
    cursor: 'pointer'
  },
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  switch: {
    position: 'relative' as const,
    display: 'inline-block',
    width: '44px',
    height: '24px'
  },
  switchInput: {
    opacity: 0,
    width: 0,
    height: 0
  },
  slider: {
    position: 'absolute' as const,
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ccc',
    transition: '.4s',
    borderRadius: '24px'
  },
  sliderActive: {
    backgroundColor: '#3b82f6'
  },
  sliderBefore: {
    position: 'absolute' as const,
    content: '""',
    height: '18px',
    width: '18px',
    left: '3px',
    bottom: '3px',
    backgroundColor: 'white',
    transition: '.4s',
    borderRadius: '50%'
  },
  sliderChecked: {
    transform: 'translateX(20px)'
  }
};

interface OrganizationTableProps {
  organizations: OrganizationListItem[];
  onEdit: (org: OrganizationListItem) => void;
  onToggleStatus: (org: OrganizationListItem, newStatus: boolean) => void;
}

function OrganizationTable({ organizations, onEdit, onToggleStatus }: OrganizationTableProps) {
  return (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead style={styles.tableHeader}>
          <tr>
            <th style={styles.th}>Organization</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Members</th>
            <th style={styles.th}>Your Role</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org) => {
            const permissions = TeamsApiService.getUserPermissions(org.userPermissions || []);
            
            return (
              <tr key={org.id}>
                <td style={styles.td}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{org.displayName || org.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{org.name}</div>
                  </div>
                </td>
                <td style={styles.td}>{org.description || 'No description'}</td>
                <td style={styles.td}>{org.memberCount || 0}</td>
                <td style={styles.td}>
                  <span style={{ 
                    ...styles.statusBadge, 
                    backgroundColor: '#f3f4f6',
                    color: '#374151'
                  }}>
                    {org.userRole || 'Member'}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.statusBadge,
                    ...(org.isActive ? styles.activeStatus : styles.inactiveStatus)
                  }}>
                    {org.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={styles.td}>
                  <button
                    style={{
                      ...styles.actionButton,
                      ...(permissions.canEdit ? {} : styles.disabledButton)
                    }}
                    onClick={() => permissions.canEdit && onEdit(org)}
                    disabled={!permissions.canEdit}
                  >
                    Edit
                  </button>
                  
                  <label style={styles.switch}>
                    <input
                      style={styles.switchInput}
                      type="checkbox"
                      checked={org.isActive}
                      onChange={(e) => {
                        const target = e.target as HTMLInputElement;
                        permissions.canToggleStatus && onToggleStatus(org, target.checked);
                      }}
                      disabled={!permissions.canToggleStatus}
                    />
                    <span style={{
                      ...styles.slider,
                      ...(org.isActive ? styles.sliderActive : {}),
                      opacity: permissions.canToggleStatus ? 1 : 0.5,
                      cursor: permissions.canToggleStatus ? 'pointer' : 'not-allowed'
                    }}>
                      <span style={{
                        ...styles.sliderBefore,
                        ...(org.isActive ? styles.sliderChecked : {})
                      }} />
                    </span>
                  </label>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function FeTeamsManagement() {
  const { session } = useSession();
  const [activeTab, setActiveTab] = useState('organizations');
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setLoading(true);
        // Get current user ID from session
        const userId = session?.user?.id;
        if (!userId) {
          console.error('No user ID found in session');
          return;
        }
        
        const orgs = await TeamsApiService.getUserOrganizations(userId);
        setOrganizations(orgs);
      } catch (error) {
        console.error('Failed to load organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      loadOrganizations();
    }
  }, [session?.user?.id]);

  const handleEditOrganization = (org: OrganizationListItem) => {
    // TODO: Open edit modal/form
    console.log('Edit organization:', org);
    // Use console.log instead of alert for now - replace with proper modal
    console.log(`Edit organization: ${org.displayName || org.name}`);
  };

  const handleToggleOrganizationStatus = async (org: OrganizationListItem, newStatus: boolean) => {
    try {
      const userId = session?.user?.id;
      if (!userId) {
        console.error('No user ID found in session');
        return;
      }

      const updatedOrg = await TeamsApiService.toggleOrganizationStatus(org.id, newStatus, userId);
      setOrganizations(prev => 
        prev.map(o => o.id === org.id ? updatedOrg : o)
      );
    } catch (error) {
      console.error('Failed to toggle organization status:', error);
      // Use console.error instead of alert for now - replace with proper error handling
      console.error('Failed to update organization status');
    }
  };

  const tabs = [
    { id: 'organizations', label: 'Organization Management' },
    { id: 'members', label: 'Members' },
    { id: 'roles', label: 'Roles & Permissions' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Teams Management</h1>
        <p style={styles.subtitle}>
          Manage your organizations, members, roles, and permissions
        </p>
      </div>

      <div style={styles.tabsContainer}>
        <ul style={styles.tabsList}>
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                style={{
                  ...styles.tab,
                  ...(activeTab === tab.id ? styles.activeTab : {})
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        {activeTab === 'organizations' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                Loading organizations...
              </div>
            ) : organizations.length > 0 ? (
              <OrganizationTable
                organizations={organizations}
                onEdit={handleEditOrganization}
                onToggleStatus={handleToggleOrganizationStatus}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
                No organizations found
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
            Members management coming soon...
          </div>
        )}

        {activeTab === 'roles' && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
            Roles & permissions management coming soon...
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
            Settings coming soon...
          </div>
        )}
      </div>
    </div>
  );
}

export default FeTeamsManagement;
