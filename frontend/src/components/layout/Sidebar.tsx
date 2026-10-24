'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Waves,
  Bell,
  BarChart3,
  Cpu,
  Settings,
  Droplets,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccountActions } from './AccountActions';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/tanks', label: 'Water Tanks', icon: Waves },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/devices', label: 'Devices', icon: Cpu },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-screen fixed left-0 top-0 bg-[#0d1528] border-r border-blue-900/20 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-blue-900/20">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Droplets className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
            Hydrava
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Pro
            </span>
          </span>
          <span className="text-xs text-blue-300/60 font-medium tracking-wide">
            Water Level Monitor
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-colors',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                )}
              />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
              )}
            </Link>
          );
        })}
        <div className="mt-3 border-t border-red-500/20 pt-3">
          <AccountActions />
        </div>
      </nav>

      {/* System Status / Version Footer */}
      <div className="p-4 border-t border-blue-900/20 bg-[#0a0f1e]/40">
        <div className="flex items-center justify-between px-2 py-1 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-300 font-medium">IoT Core Live</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-400 border border-slate-700/50">
            v1.0.0
          </span>
        </div>
      </div>
    </aside>
  );
}
