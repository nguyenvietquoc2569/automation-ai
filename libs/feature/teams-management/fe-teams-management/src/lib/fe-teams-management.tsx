import { useState, useEffect } from 'react';
import { useSession } from '@automation-ai/fe-session-management';
import { 
  TeamsApiService, 
  OrganizationListItem,
  OrganizationUpdateRequest,
} from './teams-api-service';
import { AddNewOrg } from './add-new-org';
import { EditOrgModal } from './edit-org-modal';
import { RoleManagement, type RoleItem } from './role-management';

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
  },
  currentOrgHighlight: {
    backgroundColor: '#fef3c7',
    border: '2px solid #f59e0b'
  },
  tooltip: {
    position: 'relative' as const,
    display: 'inline-block'
  },
  tooltipText: {
    visibility: 'hidden' as const,
    width: '200px',
    backgroundColor: '#374151',
    color: '#fff',
    textAlign: 'center' as const,
    borderRadius: '6px',
    padding: '8px',
    position: 'absolute' as const,
    zIndex: 1,
    bottom: '125%',
    left: '50%',
    marginLeft: '-100px',
    fontSize: '12px',
    opacity: 0,
    transition: 'opacity 0.3s'
  },
  tooltipVisible: {
    visibility: 'visible' as const,
    opacity: 1
  },
  tooltipArrow: {
    position: 'absolute' as const,
    top: '100%',
    left: '50%',
    marginLeft: '-5px',
    borderWidth: '5px',
    borderStyle: 'solid',
    borderColor: '#374151 transparent transparent transparent'
  },
  currentOrgBadge: {
    ...{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 8px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500'
    },
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    marginLeft: '8px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937'
  },
  addButton: {
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s'
  },
  addButtonHover: {
    backgroundColor: '#2563eb'
  },
  addButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  }
};

interface OrganizationTableProps {
  organizations: OrganizationListItem[];
  currentOrgId?: string;
  onEdit: (org: OrganizationListItem) => void;
  onToggleStatus: (org: OrganizationListItem, newStatus: boolean) => void;
}

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  show?: boolean;
}

function Tooltip({ text, children, show = true }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  if (!show) {
    return children as React.ReactElement;
  }

  return (
    <div 
      style={styles.tooltip}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <span style={{
        ...styles.tooltipText,
        ...(isVisible ? styles.tooltipVisible : {})
      }}>
        {text}
        <span style={styles.tooltipArrow} />
      </span>
    </div>
  );
}

function OrganizationTable({ organizations, currentOrgId, onEdit, onToggleStatus }: OrganizationTableProps) {
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
            const isCurrentOrg = org.id === currentOrgId;
            const canEdit = permissions.canEdit && !isCurrentOrg;
            const canToggleStatus = permissions.canToggleStatus && !isCurrentOrg;
            
            return (
              <tr 
                key={org.id}
                style={isCurrentOrg ? styles.currentOrgHighlight : {}}
              >
                <td style={styles.td}>
                  <div>
                    <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                      {org.displayName || org.name}
                      {isCurrentOrg && (
                        <span style={styles.currentOrgBadge}>
                          Current
                        </span>
                      )}
                    </div>
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
                  <Tooltip 
                    text={isCurrentOrg ? "Switch to another organization to edit the current one" : (!permissions.canEdit ? "You don't have permission to edit this organization" : "")}
                    show={isCurrentOrg || !permissions.canEdit}
                  >
                    <button
                      style={{
                        ...styles.actionButton,
                        ...(canEdit ? {} : styles.disabledButton)
                      }}
                      onClick={() => canEdit && onEdit(org)}
                      disabled={!canEdit}
                    >
                      Edit
                    </button>
                  </Tooltip>
                  
                  <Tooltip 
                    text={isCurrentOrg ? "Switch to another organization to modify the current one" : (!permissions.canToggleStatus ? "You don't have permission to change this organization's status" : "")}
                    show={isCurrentOrg || !permissions.canToggleStatus}
                  >
                    <label style={styles.switch}>
                      <input
                        style={styles.switchInput}
                        type="checkbox"
                        checked={org.isActive}
                        onChange={(e) => {
                          const target = e.target as HTMLInputElement;
                          canToggleStatus && onToggleStatus(org, target.checked);
                        }}
                        disabled={!canToggleStatus}
                      />
                      <span style={{
                        ...styles.slider,
                        ...(org.isActive ? styles.sliderActive : {}),
                        opacity: canToggleStatus ? 1 : 0.5,
                        cursor: canToggleStatus ? 'pointer' : 'not-allowed'
                      }}>
                        <span style={{
                          ...styles.sliderBefore,
                          ...(org.isActive ? styles.sliderChecked : {})
                        }} />
                      </span>
                    </label>
                  </Tooltip>
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
  const { session, refreshSession, switchOrganization } = useSession();
  const [activeTab, setActiveTab] = useState('organizations');
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState<OrganizationListItem | null>(null);
  
  // Constants for organization limits
  const MAX_ORGANIZATIONS = 5;

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
    setEditingOrganization(org);
    setIsEditModalOpen(true);
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

  const handleAddOrganization = async (orgData: { name: string; description?: string }) => {
    try {
      const userId = session?.user?.id;
      if (!userId) {
        throw new Error('No user ID found in session');
      }

      const newOrg = await TeamsApiService.createOrganization(orgData, userId);
      setOrganizations(prev => [...prev, newOrg]);
      
      // Check if user has no current organization before refresh
      const shouldSwitchOrg = !session?.currentOrg || !session?.currentOrgId;
      
      // Refresh session to include the new organization in availableOrgs
      // This prevents the redirect to none-org page
      await refreshSession();
      
      // Switch to the new organization if user had no current organization
      // Add a small delay to ensure session is updated
      if (shouldSwitchOrg) {
        try {
          // Small delay to ensure session update has propagated
          await new Promise(resolve => setTimeout(resolve, 500));
          await switchOrganization(newOrg.id);
        } catch (switchError) {
          console.warn('Failed to auto-switch to new organization:', switchError);
          // Not critical - user can manually switch later
        }
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  const handleUpdateOrganization = async (orgId: string, updateData: OrganizationUpdateRequest) => {
    try {
      const userId = session?.user?.id;
      if (!userId) {
        throw new Error('No user ID found in session');
      }

      const updatedOrg = await TeamsApiService.updateOrganization(orgId, updateData, userId);
      setOrganizations(prev => 
        prev.map(o => o.id === orgId ? updatedOrg : o)
      );
    } catch (error) {
      console.error('Failed to update organization:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  const handleEditRole = (role: RoleItem) => {
    console.log('Edit role:', role);
    // TODO: Implement role edit modal
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
            {/* Section Header with Add Button */}
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Organization Management</h3>
              <button
                style={{
                  ...styles.addButton,
                  ...(organizations.length >= MAX_ORGANIZATIONS ? styles.addButtonDisabled : {})
                }}
                onClick={() => setIsAddModalOpen(true)}
                disabled={organizations.length >= MAX_ORGANIZATIONS}
                onMouseEnter={(e) => {
                  if (organizations.length < MAX_ORGANIZATIONS) {
                    Object.assign(e.currentTarget.style, styles.addButtonHover);
                  }
                }}
                onMouseLeave={(e) => {
                  if (organizations.length < MAX_ORGANIZATIONS) {
                    Object.assign(e.currentTarget.style, styles.addButton);
                  } else {
                    Object.assign(e.currentTarget.style, {
                      ...styles.addButton,
                      ...styles.addButtonDisabled
                    });
                  }
                }}
              >
                <span>+</span> ADD Organization
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                Loading organizations...
              </div>
            ) : organizations.length > 0 ? (
              <OrganizationTable
                organizations={organizations}
                currentOrgId={session?.currentOrg?.id}
                onEdit={handleEditOrganization}
                onToggleStatus={handleToggleOrganizationStatus}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
                No organizations found
              </div>
            )}

            {/* Add Organization Modal */}
            <AddNewOrg
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onSubmit={handleAddOrganization}
              maxOrgsReached={organizations.length >= MAX_ORGANIZATIONS}
              currentOrgCount={organizations.length}
              maxOrgs={MAX_ORGANIZATIONS}
            />

            {/* Edit Organization Modal */}
            <EditOrgModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setEditingOrganization(null);
              }}
              onSubmit={handleUpdateOrganization}
              organization={editingOrganization}
            />
          </div>
        )}

        {activeTab === 'members' && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
            Members management coming soon...
          </div>
        )}

        {activeTab === 'roles' && (
          <RoleManagement 
            organizations={organizations}
            onEditRole={handleEditRole}
          />
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
