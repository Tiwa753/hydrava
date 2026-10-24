'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AccountActions } from './AccountActions';
import DemoBanner from '@/components/ui/DemoBanner';
import {
  Menu,
  X,
  Droplets,
  LayoutDashboard,
  Waves,
  Bell,
  BarChart3,
  Cpu,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PageWrapperProps {
  title: string;
  children: React.ReactNode;
  isConnected?: boolean;
  isPolling?: boolean;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
}

const mobileNavItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/tanks', label: 'Water Tanks', icon: Waves },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/devices', label: 'Devices', icon: Cpu },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function PageWrapper({
  title,
  children,
  isConnected,
  isPolling,
  lastUpdated,
  onRefresh,
}: PageWrapperProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100 flex flex-col lg:flex-row font-sans">
      {/* Desktop Fixed Sidebar */}
      <Sidebar />

      {/* Mobile Header Bar */}
      <div className="lg:hidden h-14 bg-[#0d1528] border-b border-blue-900/30 px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow">
            <Droplets className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight text-white text-base">Hydrava</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          type="button"
          className="p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-14 z-30 bg-[#0d1528]/95 backdrop-blur-md flex flex-col p-4 border-b border-blue-900/40">
          <nav className="space-y-1.5 flex-1">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="mt-3 border-t border-red-500/20 pt-3">
              <AccountActions onAction={() => setMobileMenuOpen(false)} />
            </div>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-[260px] flex flex-col min-h-screen min-w-0 bg-grid">
        <DemoBanner />
        <Header
          title={title}
          isConnected={isConnected}
          isPolling={isPolling}
          lastUpdated={lastUpdated}
          onRefresh={onRefresh}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
