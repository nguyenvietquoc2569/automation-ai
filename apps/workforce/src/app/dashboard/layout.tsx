// Temporarily disable session guard until we fix the import issue
// import { SessionGuard } from '@automation-ai/fe-session-management/server';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Temporarily disable session guard
    <div className="dashboard-layout">
      {children}
    </div>
    /* <SessionGuard 
      requireAuth={true}
      loginPath="/login"
    >
      <div className="dashboard-layout">
        {children}
      </div>
    </SessionGuard> */
  );
}
