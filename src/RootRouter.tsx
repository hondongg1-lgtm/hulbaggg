import { useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import App from './App';
import AppUserFlow from './AppUserFlow';
import DashboardApp from './DashboardApp';
import RoleSelectionPage from './pages/RoleSelectionPage';
import { Loader } from 'lucide-react';

export default function RootRouter() {
  const { user, userRole, loading } = useAuth();
  
  // Debug logs
  console.log('[RootRouter] User:', user?.email, '| Role:', userRole, '| Loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-600 font-bold">جاري تحميل البيانات...</p>
      </div>
    );
  }

  const path = window.location.pathname;
  const search = window.location.search;
  const isUserFlow = path === '/user' || search.includes('user=true');
  const isDashboardFlow = path === '/admin' || path === '/advertiser' || 
                          search.includes('admin=true') || search.includes('advertiser=true');

  console.log('[RootRouter] URL Context - isUserFlow:', isUserFlow, 'isDashboardFlow:', isDashboardFlow);

  // 1. Logged In Logic
  if (user) {
    if (!userRole) {
      console.log('[RootRouter] Logged in but NO ROLE. Showing RoleSelectionPage');
      return (
        <LanguageProvider>
          <RoleSelectionPage />
        </LanguageProvider>
      );
    }

    if (userRole === 'user') {
      console.log('[RootRouter] Role is USER. Showing AppUserFlow');
      return <AppUserFlow />;
    }

    if (userRole === 'admin' || userRole === 'advertiser') {
      console.log('[RootRouter] Role is ADMIN/ADVERTISER. Showing DashboardApp');
      return <DashboardApp />;
    }
  }

  // 2. Not Logged In Logic (URL-based)
  if (isUserFlow) {
    console.log('[RootRouter] Not logged in, but URL says USER flow. Showing AppUserFlow');
    return <AppUserFlow />;
  }

  if (isDashboardFlow) {
    console.log('[RootRouter] Not logged in, but URL says DASHBOARD flow. Showing DashboardApp');
    return <DashboardApp />;
  }

  // 3. Default Landing
  console.log('[RootRouter] Not logged in, No specific URL. Showing Landing App');
  return <App />;
}
