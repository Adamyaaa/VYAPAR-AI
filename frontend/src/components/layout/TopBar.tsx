import React from 'react';
import { Search, Bell, Sun, Moon, Wifi, WifiOff, Menu } from 'lucide-react';
import { useTheme } from '../../context/useTheme';
import { Avatar } from '../ui';

interface TopBarProps {
  businessName: string;
  isOffline: boolean;
  onOpenMobileNav: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export const TopBar: React.FC<TopBarProps> = ({ businessName, isOffline, onOpenMobileNav }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between gap-4 px-5 md:px-8 py-4 bg-surface/80 backdrop-blur-md border-b border-border-soft sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 -ml-2 rounded-md text-ink-muted hover:bg-surface-2 cursor-pointer"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <p className="text-[11px] text-ink-faint m-0">{getGreeting()},</p>
          <h2 className="text-[15px] md:text-[17px] font-semibold text-ink truncate m-0">{businessName}</h2>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2 flex-1 max-w-xs bg-surface-2 border border-border-soft rounded-md px-3 py-2 text-ink-faint">
        <Search size={15} />
        <input
          type="text"
          placeholder="Search customers, transactions…"
          className="bg-transparent border-none outline-none text-[13px] text-ink placeholder:text-ink-faint w-full"
        />
      </div>

      <div className="flex items-center gap-1.5 md:gap-2.5">
        <span
          className={`hidden md:inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${
            isOffline
              ? 'bg-amber-soft text-amber border-amber/20'
              : 'bg-emerald-soft text-emerald border-emerald/20'
          }`}
        >
          {isOffline ? <WifiOff size={11} /> : <Wifi size={11} />}
          {isOffline ? 'Demo' : 'Live'}
        </span>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-md text-ink-muted hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo/40"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button
          aria-label="Notifications"
          className="p-2 rounded-md text-ink-muted hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo/40"
        >
          <Bell size={17} />
        </button>

        <div className="hidden md:block">
          <Avatar name={businessName} size={32} />
        </div>
      </div>
    </header>
  );
};
