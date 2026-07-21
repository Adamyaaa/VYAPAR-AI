import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

interface AppShellProps {
  children: React.ReactNode;
}

const COLLAPSE_KEY = 'vyapar-sidebar-collapsed';

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(api.isOffline);
  const { profile, user, signOut } = useAuth();

  const businessName = profile?.business_name || user?.email || 'Your business';

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  useEffect(() => {
    const sync = () => api.checkBackendConnection().then(() => setIsOffline(api.isOffline));
    sync();
    const interval = setInterval(sync, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex bg-canvas">
      <Sidebar
        businessName={businessName}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        onSignOut={signOut}
      />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} businessName={businessName} onSignOut={signOut} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar businessName={businessName} isOffline={isOffline} onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
