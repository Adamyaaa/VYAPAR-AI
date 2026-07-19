import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { api } from '../../utils/api';

interface AppShellProps {
  children: React.ReactNode;
}

const COLLAPSE_KEY = 'vyapar-sidebar-collapsed';

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(api.isOffline);

  // Placeholder until real Supabase Auth (Phase 1) replaces the current profile stub.
  const businessName = 'Apna Bazaar';

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  useEffect(() => {
    const interval = setInterval(() => {
      api.checkBackendConnection().then(() => setIsOffline(api.isOffline));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex bg-canvas">
      <Sidebar businessName={businessName} collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} businessName={businessName} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar businessName={businessName} isOffline={isOffline} onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
