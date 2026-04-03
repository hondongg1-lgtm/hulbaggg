import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import NewAdminDashboard from './pages/NewAdminDashboard';
import NewAdvertiserDashboard from './pages/NewAdvertiserDashboard';
import { LanguageProvider } from './contexts/LanguageContext';



export default function DashboardApp() {
  const { user, userRole, userProfile, signOut, loading } = useAuth();

  const handleLoginSuccess = () => {
    // Auth context will automatically update and re-render
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) return null;

  if (!user || !userRole || !userProfile) {
    return (
      <LanguageProvider>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </LanguageProvider>
    );
  }

  if (userRole === 'admin') {
    return (
      <LanguageProvider>
        <NewAdminDashboard
          adminId={userProfile.id}
          onLogout={handleLogout}
        />
      </LanguageProvider>
    );
  }

  if (userRole === 'advertiser') {
    return (
      <LanguageProvider>
        <NewAdvertiserDashboard
          advertiserId={userProfile.id}
          onLogout={handleLogout}
        />
      </LanguageProvider>
    );
  }

  return null;
}
