import React, { useState, useEffect } from 'react';
import { OrganizationListItem } from '../teams-api-service';

// Role interface based on the database model
export interface RoleItem {
  _id: string;
  name: string;
  displayName?: string;
  description?: string;
  organizationId: string;
  permissions: string[];
  isActive: boolean;
  isSystemRole?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface RoleManagementProps {
  organizations: OrganizationListItem[];
  onEditRole?: (role: RoleItem) => void;
}

// Styles
const styles = {
  container: {
    padding: '0',
  },
  orgSelectorContainer: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px',
  },
  select: {
    width: '100%',
    maxWidth: '400px',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#fff',
    color: '#1f2937',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  selectFocus: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#1f2937',
    borderBottom: '1px solid #f3f4f6',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '48px 24px',
    color: '#6b7280',
  },
  emptyStateTitle: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '8px',
  },
  emptyStateText: {
    fontSize: '14px',
  },
  loadingState: {
    textAlign: 'center' as const,
    padding: '48px 24px',
    color: '#6b7280',
    fontSize: '14px',
  },
  errorState: {
    textAlign: 'center' as const,
    padding: '48px 24px',
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    margin: '16px 0',
  },
  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    marginRight: '8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  actionButtonHover: {
    backgroundColor: '#f9fafb',
    borderColor: '#9ca3af',
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '500',
  },
  systemRole: {
    backgroundColor: '#ddd6fe',
    color: '#5b21b6',
  },
  customRole: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '500',
  },
  activeStatus: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  inactiveStatus: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
  },
  permissionsList: {
    maxWidth: '300px',
    fontSize: '12px',
    color: '#6b7280',
  },
  editIcon: {
    width: '14px',
    height: '14px',
    fill: 'currentColor',
  },
};

// EditIcon component
const EditIcon: React.FC = () => (
  <svg style={styles.editIcon} viewBox="0 0 20 20">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.828-2.828z" />
  </svg>
);

export function RoleManagement({ organizations, onEditRole }: RoleManagementProps) {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Filter organizations to only show those where user has appropriate permissions
  const manageableOrgs = organizations.filter(org => {
    const permissions = org.userPermissions || [];
    return permissions.includes('org.owner') || permissions.includes('org.roles.manage');
  });

  // Set initial selected organization
  useEffect(() => {
    if (manageableOrgs.length > 0 && !selectedOrgId) {
      setSelectedOrgId(manageableOrgs[0].id);
    }
  }, [manageableOrgs, selectedOrgId]);

  // Fetch roles when selected organization changes
  useEffect(() => {
    if (selectedOrgId) {
      fetchRoles(selectedOrgId);
    } else {
      setRoles([]);
    }
  }, [selectedOrgId]);

  const fetchRoles = async (orgId: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/teams/organizations/${orgId}/roles`);
      if (!response.ok) {
        throw new Error(`Failed to fetch roles: ${response.statusText}`);
      }
      const data = await response.json();
      setRoles(data.roles || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch roles');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (role: RoleItem) => {
    if (onEditRole) {
      onEditRole(role);
    }
  };

  const formatPermissions = (permissions: string[]) => {
    if (permissions.length === 0) return 'No permissions';
    if (permissions.length <= 3) {
      return permissions.join(', ');
    }
    return `${permissions.slice(0, 3).join(', ')} +${permissions.length - 3} more`;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (manageableOrgs.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={styles.emptyStateTitle}>No Organizations Available</div>
          <div style={styles.emptyStateText}>
            You don't have permission to manage roles in any organization.
            You need "org.owner" or "org.roles.manage" permissions.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Organization Selector */}
      <div style={styles.orgSelectorContainer}>
        <label style={styles.label} htmlFor="orgSelect">
          Select Organization
        </label>
        <select
          id="orgSelect"
          value={selectedOrgId}
          onChange={(e) => setSelectedOrgId(e.target.value)}
          style={styles.select}
          onFocus={(e) => Object.assign(e.target.style, styles.selectFocus)}
          onBlur={(e) => Object.assign(e.target.style, styles.select)}
        >
          {manageableOrgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.displayName || org.name}
            </option>
          ))}
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div style={styles.errorState}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={styles.loadingState}>
          Loading roles...
        </div>
      )}

      {/* Roles Table */}
      {!loading && !error && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.th}>Role Name</th>
                <th style={styles.th}>Display Name</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Permissions</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={7} style={styles.emptyState}>
                    <div style={styles.emptyStateTitle}>No Roles Found</div>
                    <div style={styles.emptyStateText}>
                      This organization doesn't have any roles yet.
                    </div>
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role._id}>
                    <td style={styles.td}>
                      <strong>{role.name}</strong>
                    </td>
                    <td style={styles.td}>
                      {role.displayName || '-'}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.roleBadge,
                          ...(role.isSystemRole ? styles.systemRole : styles.customRole),
                        }}
                      >
                        {role.isSystemRole ? 'System' : 'Custom'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(role.isActive ? styles.activeStatus : styles.inactiveStatus),
                        }}
                      >
                        {role.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.permissionsList} title={role.permissions.join(', ')}>
                        {formatPermissions(role.permissions)}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {formatDate(role.createdAt)}
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.actionButton}
                        onClick={() => handleEditRole(role)}
                        onMouseEnter={(e) => Object.assign((e.target as HTMLElement).style, styles.actionButtonHover)}
                        onMouseLeave={(e) => Object.assign((e.target as HTMLElement).style, styles.actionButton)}
                        title="Edit role"
                      >
                        <EditIcon />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RoleManagement;
