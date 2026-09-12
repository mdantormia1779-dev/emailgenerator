'use client';

import React from 'react';
import Link from 'next/link';
import { LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const SidebarUserFooter: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col">
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
    </div>
  );
};
