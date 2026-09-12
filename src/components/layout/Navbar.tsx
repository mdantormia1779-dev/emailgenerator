'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, LogIn, Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { NavbarUserDropdown } from './NavbarUserDropdown';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          Personal AI Application Assistant
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/applications/new">
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            New Application
          </Button>
        </Link>

        {isLoading ? (
          <div className="w-24 h-8 bg-slate-100 animate-pulse rounded-lg" />
        ) : user ? (
          <NavbarUserDropdown user={user} logout={logout} />
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button size="sm" variant="outline" leftIcon={<LogIn className="w-3.5 h-3.5" />}>
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" variant="primary">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
