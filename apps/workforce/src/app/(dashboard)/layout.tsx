'use client';
import { ProtectedRoute, OrganizationGuard } from '@automation-ai/fe-session-management';

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute 
      loginPath="/login"
      loadingComponent={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <OrganizationGuard
        errorPath="/dashboard/error/none-org"
        loadingComponent={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Setting up your organization...</p>
            </div>
          </div>
        }
      >
        {children}
      </OrganizationGuard>
    </ProtectedRoute>
  );
}
