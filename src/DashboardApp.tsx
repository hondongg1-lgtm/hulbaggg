import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import NewAdminDashboard from './pages/NewAdminDashboard';
import NewAdvertiserDashboard from './pages/NewAdvertiserDashboard';

export default function DashboardApp() {
  const { user, userRole, userProfile, loading } = useAuth();

  const handleLoginSuccess = () => {
    // Auth context will automatically update and re-render
  };

  if (loading) return null;

  if (!user || !userRole || !userProfile) {
    return (
      <LoginPage onLoginSuccess={handleLoginSuccess} />
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {userRole === 'admin' && (
          <NewAdminDashboard
            adminId={userProfile.id}
          />
        )}

        {userRole === 'advertiser' && (
          <NewAdvertiserDashboard
            advertiserId={userProfile.id}
          />
        )}
      </main>
    </div>
  );
}
