import { useState, useRef, useEffect } from 'react';
import { User, LogOut, ListPlus, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserMenuProps {
  onMyAdsClick: () => void;
}

export function UserMenu({ onMyAdsClick }: UserMenuProps) {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 px-4 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
          {user?.email?.[0].toUpperCase()}
        </div>
        <span className="font-semibold text-slate-700 hidden md:inline">
          {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-scale-in">
          <div className="p-4 bg-gradient-to-br from-slate-50 to-white border-b border-slate-200">
            <p className="font-semibold text-slate-800">{user?.user_metadata?.full_name}</p>
            <p className="text-sm text-slate-500 truncate">{user?.email}</p>
          </div>

          <div className="p-2">
            <button
              onClick={() => {
                onMyAdsClick();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <ListPlus size={20} />
              <span className="font-semibold">إعلاناتي</span>
            </button>

            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Settings size={20} />
              <span className="font-semibold">الإعدادات</span>
            </button>

            <div className="border-t border-slate-200 my-2"></div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={20} />
              <span className="font-semibold">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
