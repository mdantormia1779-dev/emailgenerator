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
  LogOut,
  LogIn,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'New Application', href: '/applications/new', icon: PlusCircle, highlight: true },
    { name: 'Meta Job Scanner', href: '/facebook-scanner', icon: Sparkles },
    { name: 'Applications', href: '/applications', icon: Briefcase },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Resumes', href: '/resumes', icon: FileText },
    { name: 'Integrations', href: '/integrations', icon: Mail },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 min-h-screen">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-slate-900 tracking-tight text-base block">JobApply AI</span>
          <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase block -mt-1">
            Personal Assistant
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1.5 flex-1">
        {navItems.map(item => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard' || pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
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

      {/* User Session Footer */}
      {user ? (
        <div className="p-3 mx-3 mb-2 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-3 mx-3 mb-2 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
          <span className="text-xs text-indigo-900 font-medium">Guest User</span>
          <Link
            href="/login"
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </Link>
        </div>
      )}

      {/* Safety Notice Footer */}
      <div className="p-3 border-t border-slate-100 m-3 mt-0 rounded-xl bg-slate-50/50 text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700 flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Safe Sending Active
        </p>
        <p className="text-[10px] leading-relaxed text-slate-500">
          Strict 4-checkbox human confirmation required. Zero hallucination.
        </p>
      </div>
    </aside>
  );
};
