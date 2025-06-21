'use client';
import { usePathname } from 'next/navigation';

export default function OrgGuardTestPage() {
  const pathname = usePathname();
  
  const excludePaths = ['/dashboard/error']; // Default exclude paths
  const isExcludedPath = excludePaths.some(excludePath => pathname.startsWith(excludePath));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Organization Guard Test</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Current pathname:</strong> {pathname}
        </div>
        
        <div>
          <strong>Exclude paths:</strong> {JSON.stringify(excludePaths)}
        </div>
        
        <div>
          <strong>Is excluded path:</strong> {isExcludedPath ? 'YES' : 'NO'}
        </div>
        
        <div>
          <strong>Path check details:</strong>
          <ul className="ml-4 mt-2">
            {excludePaths.map((excludePath, index) => (
              <li key={index}>
                &quot;{pathname}&quot;.startsWith(&quot;{excludePath}&quot;) = {pathname.startsWith(excludePath) ? 'true' : 'false'}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <p className="text-blue-800">
          This page should {isExcludedPath ? 'be excluded from' : 'be checked by'} the OrganizationGuard.
        </p>
      </div>
    </div>
  );
}
