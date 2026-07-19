import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  BarChart3,
  Settings,
  LifeBuoy,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Avatar } from '../ui';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/ledger', label: 'Ledger', icon: BookOpen },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/support', label: 'Support', icon: LifeBuoy },
];

interface SidebarProps {
  businessName: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ businessName, collapsed, onToggleCollapsed }) => {
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 248 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="hidden md:flex flex-col bg-surface border-r border-border-soft sticky top-0 h-screen z-30 shrink-0 overflow-hidden"
    >
      <div className="px-4 py-6 flex items-center gap-2.5">
        <div className="w-8.5 h-8.5 rounded-sm bg-[linear-gradient(155deg,var(--color-indigo),var(--color-indigo-ink))] flex items-center justify-center font-bold text-white text-sm shrink-0">
          V
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="font-semibold text-[14px] leading-tight text-ink truncate m-0">Hisaab AI</h1>
            <p className="text-[10px] text-ink-faint uppercase tracking-wider font-medium m-0">Vyapar AI</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-[13.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo/40 ${
                isActive ? 'bg-indigo-soft text-indigo-ink' : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
              }`}
            >
              <Icon size={17} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border-soft">
        <button
          onClick={onToggleCollapsed}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-ink-faint hover:text-ink hover:bg-surface-2 transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronsRight size={17} /> : <ChevronsLeft size={17} />}
          {!collapsed && <span className="text-[12.5px] font-medium">Collapse</span>}
        </button>

        <div className={`flex items-center gap-2.5 px-1 mt-2 ${collapsed ? 'justify-center' : ''}`}>
          <Avatar name={businessName} size={32} />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-ink truncate m-0">{businessName}</p>
              <p className="text-[11px] text-ink-faint m-0">Owner account</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export const MOBILE_NAV_ITEMS = NAV_ITEMS;
