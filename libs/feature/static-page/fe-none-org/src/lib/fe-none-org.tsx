import { useState } from 'react';

// Styles for the error page
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '24px',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '48px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    textAlign: 'center' as const
  },
  icon: {
    width: '80px',
    height: '80px',
    margin: '0 auto 24px',
    backgroundColor: '#fee2e2',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    color: '#dc2626'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '16px',
    lineHeight: '1.2'
  },
  subtitle: {
    fontSize: '18px',
    color: '#6b7280',
    marginBottom: '32px',
    lineHeight: '1.5'
  },
  description: {
    fontSize: '16px',
    color: '#4b5563',
    marginBottom: '40px',
    lineHeight: '1.6',
    textAlign: 'left' as const
  },
  stepsList: {
    textAlign: 'left' as const,
    marginBottom: '32px'
  },
  step: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '16px',
    fontSize: '16px',
    color: '#374151'
  },
  stepNumber: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
    marginRight: '12px',
    flexShrink: 0,
    marginTop: '2px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '140px'
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    color: '#374151',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '140px'
  },
  helpSection: {
    marginTop: '40px',
    padding: '24px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  helpTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '12px'
  },
  helpText: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5'
  },
  contactLink: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '500'
  }
};

export function FeNoneOrg() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 1000);
  };

  const handleGoToDashboard = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  const handleLogoutAndRedirect = async () => {
    if (typeof window !== 'undefined') {
      setIsLoggingOut(true);
      
      try {
        // Call the logout API
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
        
        // Wait a moment for the logout to process
        setTimeout(() => {
          window.location.href = '/login';
        }, 500);
      } catch (error) {
        console.error('Logout failed:', error);
        // Fallback: still redirect to login page
        window.location.href = '/login';
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Error Icon */}
        <div style={styles.icon}>
          <span role="img" aria-label="Warning">⚠️</span>
        </div>

        {/* Title */}
        <h1 style={styles.title}>
          No Organization Selected
        </h1>

        {/* Subtitle */}
        <p style={styles.subtitle}>
          Your session is active, but no organization is currently selected
        </p>

        {/* Description */}
        <div style={styles.description}>
          <p>
            To access the dashboard and its features, you need to have an organization 
            selected in your session. This typically happens automatically when you log in, 
            but sometimes the organization context may be lost.
          </p>
        </div>

        {/* Steps to resolve */}
        <div style={styles.stepsList}>
          <h3 style={{ ...styles.helpTitle, textAlign: 'center', marginBottom: '24px' }}>
            How to resolve this:
          </h3>
          
          <div style={styles.step}>
            <div style={styles.stepNumber}>1</div>
            <div>
              <strong>Refresh the page</strong> - This may restore your organization context 
              if it was temporarily lost.
            </div>
          </div>

          <div style={styles.step}>
            <div style={styles.stepNumber}>2</div>
            <div>
              <strong>Go to Dashboard</strong> - Navigate to the main dashboard where you 
              can select an organization.
            </div>
          </div>

          <div style={styles.step}>
            <div style={styles.stepNumber}>3</div>
            <div>
              <strong>Re-login</strong> - Sign out of your current session and sign back in to restore your 
              complete session with organization context.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.buttonGroup}>
          <button 
            style={{
              ...styles.primaryButton,
              opacity: isRefreshing ? 0.7 : 1,
              cursor: isRefreshing ? 'not-allowed' : 'pointer'
            }}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Page'}
          </button>
          
          <button 
            style={styles.secondaryButton}
            onClick={handleGoToDashboard}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.backgroundColor = '#f9fafb';
              target.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.backgroundColor = '#ffffff';
              target.style.borderColor = '#d1d5db';
            }}
          >
            Go to Dashboard
          </button>
          
          <button 
            style={{
              ...styles.secondaryButton,
              opacity: isLoggingOut ? 0.7 : 1,
              cursor: isLoggingOut ? 'not-allowed' : 'pointer'
            }}
            onClick={handleLogoutAndRedirect}
            disabled={isLoggingOut}
            onMouseEnter={(e) => {
              if (!isLoggingOut) {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.backgroundColor = '#f9fafb';
                target.style.borderColor = '#9ca3af';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoggingOut) {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.backgroundColor = '#ffffff';
                target.style.borderColor = '#d1d5db';
              }
            }}
          >
            {isLoggingOut ? 'Logging out...' : 'Re-login'}
          </button>
        </div>

        {/* Help Section */}
        <div style={styles.helpSection}>
          <h4 style={styles.helpTitle}>Need Help?</h4>
          <p style={styles.helpText}>
            If you continue to experience this issue, please contact your system administrator 
            or <a href="/support" style={styles.contactLink}>reach out to support</a>. 
            This error typically indicates a session management issue that may require assistance.
          </p>
        </div>
      </div>
    </div>
  );
}

export default FeNoneOrg;
