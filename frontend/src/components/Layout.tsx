import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Wifi, 
  WifiOff, 
  Menu, 
  X, 
  ChevronRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { api } from '../utils/api';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(api.isOffline);
  const businessName = 'Apna Bazaar'; // Mocked profile name

  useEffect(() => {
    // Keep checking API connection status
    const interval = setInterval(() => {
      api.checkBackendConnection().then(() => {
        setIsOffline(api.isOffline);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/ledger', label: 'Ledger Book', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0b0f19] text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            H
          </div>
          <span className="font-semibold text-lg tracking-tight">Hisaab AI</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${isOffline ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
            {isOffline ? <WifiOff size={12} /> : <Wifi size={12} />}
            <span>{isOffline ? 'Demo' : 'Live'}</span>
          </div>
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar overlay menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[53px] bg-slate-950/95 z-40 flex flex-col animate-fade-in">
          <nav className="flex-1 py-6 px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-900 bg-slate-900/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white text-sm">
                AB
              </div>
              <div>
                <p className="font-semibold text-slate-200 text-sm">{businessName}</p>
                <p className="text-xs text-slate-500">Premium Owner</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0b0f19] text-white border-r border-slate-900 sticky top-0 h-screen z-30">
        {/* Sidebar Brand Logo */}
        <div className="px-6 py-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-xl text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            H
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight m-0 text-white">Hisaab AI</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Udhar Shield Lite</p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider px-3 mb-2">Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between group px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-500 text-white font-medium shadow-[0_4px_12px_rgba(16,185,129,0.3)]' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {!isActive && (
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Connection Stats */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/40">
          <div className="mb-4">
            <div className={`flex items-center gap-2 justify-center py-2 px-3 rounded-lg border text-xs font-medium ${
              isOffline 
                ? 'bg-amber-500/5 text-amber-400 border-amber-500/10' 
                : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`}></span>
              <span>{isOffline ? 'Demo Mode (Offline)' : 'Backend Connected'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
              AB
            </div>
            <div className="truncate flex-1">
              <p className="font-semibold text-slate-200 text-sm truncate leading-tight">{businessName}</p>
              <p className="text-xs text-slate-500 mt-0.5">Owner Account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar on desktop */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/40 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-20">
          <div>
            <h2 className="text-xl font-bold text-slate-800 m-0">
              {location.pathname === '/' && 'Welcome back, ' + businessName}
              {location.pathname === '/customers' && 'Manage Customers'}
              {location.pathname === '/ledger' && 'Ledger Book Details'}
            </h2>
            <p className="text-xs text-slate-500 m-0">Record voice & text ledgers seamlessly</p>
          </div>

          <div className="flex items-center gap-6">
            {/* Quick dashboard stats */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <TrendingUp size={14} className="text-emerald-500" />
                <span>Credit Health: <strong className="text-emerald-600">92%</strong></span>
              </div>
              <div className="h-4 w-px bg-slate-200"></div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <UserCheck size={14} className="text-indigo-500" />
                <span>Active Ledger: <strong className="text-indigo-600">4 Accounts</strong></span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
