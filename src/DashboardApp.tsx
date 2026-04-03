import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import NewAdminDashboard from './pages/NewAdminDashboard';
import NewAdvertiserDashboard from './pages/NewAdvertiserDashboard';
import { LanguageProvider } from './contexts/LanguageContext';

type UserType = 'admin' | 'advertiser' | null;

export default function DashboardApp() {
  const [userType, setUserType] = useState<UserType>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const savedUserType = localStorage.getItem('userType') as UserType;
    const savedUserId = localStorage.getItem('userId');

    if (savedUserType && savedUserId) {
      setUserType(savedUserType);
      setUserId(savedUserId);
    }
  }, []);

  const handleLoginSuccess = (id: string, role: 'admin' | 'advertiser') => {
    setUserType(role);
    setUserId(id);
    localStorage.setItem('userType', role);
    localStorage.setItem('userId', id);
  };

  const handleLogout = () => {
    setUserType(null);
    setUserId(null);
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
  };

  if (!userType || !userId) {
    return (
      <LanguageProvider>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </LanguageProvider>
    );
  }

  if (userType === 'admin') {
    return (
      <LanguageProvider>
        <NewAdminDashboard
          adminId={userId}
          onLogout={handleLogout}
        />
      </LanguageProvider>
    );
  }

  if (userType === 'advertiser') {
    return (
      <LanguageProvider>
        <NewAdvertiserDashboard
          advertiserId={userId}
          onLogout={handleLogout}
        />
      </LanguageProvider>
    );
  }

  return null;
}
