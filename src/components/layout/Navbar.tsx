'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, Plus, LogOut, LogIn, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
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
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[120px] truncate">{user.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Your Profile
                </Link>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 transition border-t border-slate-100"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
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
