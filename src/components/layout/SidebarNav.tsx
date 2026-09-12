'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  User,
  FileText,
  Mail,
  Settings,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'New Application', href: '/applications/new', icon: PlusCircle, highlight: true },
  { name: 'Meta Job Scanner', href: '/facebook-scanner', icon: Sparkles },
  { name: 'Applications', href: '/applications', icon: Briefcase },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Resumes', href: '/resumes', icon: FileText },
  { name: 'Integrations', href: '/integrations', icon: Mail },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const SidebarNav: React.FC<{ onItemClick?: () => void }> = ({ onItemClick }) => {
  const pathname = usePathname();

  return (
    <nav className="p-4 space-y-1.5 flex-1">
      {NAV_ITEMS.map(item => {
        const isActive =
          item.href === '/dashboard'
            ? pathname === '/dashboard' || pathname === '/'
            : item.href === '/applications'
            ? pathname === '/applications' ||
              (pathname.startsWith('/applications/') && !pathname.startsWith('/applications/new'))
            : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onItemClick}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${item.highlight && !isActive ? 'text-indigo-600 font-semibold hover:bg-indigo-50/50' : ''}`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
            {item.name}
            {item.highlight && (
              <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                New
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};
