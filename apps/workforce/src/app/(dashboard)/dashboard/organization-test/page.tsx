'use client';
import { useSession, useOrganization } from '@automation-ai/fe-session-management';
import { DashboardLayout } from '@automation-ai/fe-dashboard';
import { usePathname } from 'next/navigation';

export default function OrganizationTestPage() {
  const { session, switchOrganization } = useSession();
  const { 
    currentOrg, 
    currentOrgId, 
    availableOrgs, 
    availableOrgIds, 
    activeOrgs, 
    hasOrganization, 
    hasAvailableOrgs, 
    hasActiveOrgs, 
    isCurrentOrganizationActive 
  } = useOrganization();

  const pathname = usePathname();

  const breadcrumbItems = [
    { title: 'Home', href: '/' },
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Organization Test' }
  ];

  const footerProps = {
    companyName: 'Automation AI',
    links: [
      { key: 'privacy', label: 'Privacy Policy', href: '/privacy' },
      { key: 'terms', label: 'Terms of Service', href: '/terms' },
      { key: 'support', label: 'Support', href: '/support' }
    ]
  };

  const handleSwitchOrg = async (orgId: string) => {
    try {
      await switchOrganization(orgId);
    } catch (error) {
      console.error('Failed to switch organization:', error);
    }
  };

  return (
    <DashboardLayout 
      breadcrumbItems={breadcrumbItems}
      title="Organization Test"
      notificationCount={5}
      footerProps={footerProps}
    >
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Organization Management Test</h2>
        
        {/* Debug Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">OrganizationGuard Debug Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Current Path:</strong> {pathname}
            </div>
            <div>
              <strong>Default Exclude Paths:</strong> [&apos;/dashboard/error&apos;]
            </div>
            <div>
              <strong>Is Current Path Excluded:</strong> {pathname.startsWith('/dashboard/error') ? 'YES' : 'NO'}
            </div>
            <div>
              <strong>Error Page Path:</strong> /dashboard/error/none-org
            </div>
            <div>
              <strong>Is Error Page Excluded:</strong> {'/dashboard/error/none-org'.startsWith('/dashboard/error') ? 'YES' : 'NO'}
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-100 rounded text-blue-800">
            <p><strong>Test:</strong> Navigate to <code>/dashboard/error/none-org</code> to see if the OrganizationGuard correctly excludes error pages and shows the error content instead of &quot;Setting up your organization...&quot;</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Current Organization */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Current Organization</h3>
            <div className="mb-2">
              <p><strong>Current Org ID:</strong> {currentOrgId || 'None'}</p>
            </div>
            {currentOrg ? (
              <div>
                <p><strong>Name:</strong> {currentOrg.name}</p>
                <p><strong>Display Name:</strong> {currentOrg.displayName || 'N/A'}</p>
                <p><strong>ID:</strong> {currentOrg.id}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    isCurrentOrganizationActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {isCurrentOrganizationActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-red-600">❌ No current organization (populated data)</p>
            )}
          </div>

          {/* Organization IDs */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Organization IDs (Stored in Session)</h3>
            <div className="space-y-2">
              <div>
                <p><strong>Current Org ID:</strong> {currentOrgId || 'None'}</p>
              </div>
              <div>
                <p><strong>Available Org IDs:</strong></p>
                {availableOrgIds.length > 0 ? (
                  <ul className="list-disc pl-6 mt-1">
                    {availableOrgIds.map((orgId) => (
                      <li key={orgId} className={`${currentOrgId === orgId ? 'font-bold text-blue-600' : ''}`}>
                        {orgId} {currentOrgId === orgId ? '(current)' : ''}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-red-600">❌ No organization IDs available</p>
                )}
              </div>
            </div>
          </div>

          {/* Available Organizations (Populated Data) */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Available Organizations (Populated from DB)</h3>
            {hasAvailableOrgs ? (
              <div className="space-y-2">
                {availableOrgs.map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <span className="font-medium">{org.name}</span>
                      {org.displayName && <span className="text-gray-600 ml-2">({org.displayName})</span>}
                      <span className="text-xs text-gray-500 block">ID: {org.id}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        org.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {org.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleSwitchOrg(org.id)}
                      disabled={currentOrg?.id === org.id || org.isActive === false}
                      className={`px-3 py-1 rounded text-sm ${
                        currentOrg?.id === org.id
                          ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                          : org.isActive === false
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {currentOrg?.id === org.id ? 'Current' : org.isActive === false ? 'Disabled' : 'Switch'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-600">❌ No available organizations (populated data)</p>
            )}
          </div>

          {/* Active Organizations Only */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Active Organizations Only</h3>
            {hasActiveOrgs ? (
              <div className="space-y-2">
                {activeOrgs.map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <span className="font-medium">{org.name}</span>
                      {org.displayName && <span className="text-gray-600 ml-2">({org.displayName})</span>}
                      <span className="text-xs text-gray-500 block">ID: {org.id}</span>
                    </div>
                    <button
                      onClick={() => handleSwitchOrg(org.id)}
                      disabled={currentOrg?.id === org.id}
                      className={`px-3 py-1 rounded text-sm ${
                        currentOrg?.id === org.id
                          ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {currentOrg?.id === org.id ? 'Current' : 'Switch'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-600">❌ No active organizations available</p>
            )}
          </div>

          {/* Status Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Status Summary</h3>
            <ul className="space-y-1">
              <li>Has Current Organization: {hasOrganization ? '✅ Yes' : '❌ No'}</li>
              <li>Current Organization Active: {isCurrentOrganizationActive ? '✅ Yes' : '❌ No'}</li>
              <li>Has Available Organizations: {hasAvailableOrgs ? '✅ Yes' : '❌ No'}</li>
              <li>Has Active Organizations: {hasActiveOrgs ? '✅ Yes' : '❌ No'}</li>
              <li>Total Available: {availableOrgs.length}</li>
              <li>Total Active: {activeOrgs.length}</li>
              <li>Available Org IDs: {availableOrgIds.length}</li>
            </ul>
          </div>

          {/* Debug Information */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
            <p className="text-sm">
              <strong>Organization Guard Logic:</strong><br />
              • If no current org but has available orgs → Auto-switch to first available<br />
              • If no current org and no available orgs → Redirect to /dashboard/error/none-org<br />
              • If has current org → Show normal content
            </p>
            <p className="text-sm mt-2">
              <strong>Pathname:</strong> {pathname}
            </p>
            <div className="mt-2 text-xs">
              <strong>Raw Session Data:</strong>
              <pre className="bg-white p-2 rounded border mt-1 overflow-auto">
                {JSON.stringify({
                  currentOrg: session?.currentOrg,
                  availableOrgs: session?.availableOrgs,
                  user: session?.user ? { id: session.user.id, name: session.user.name } : null
                }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
