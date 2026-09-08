'use client';

import React from 'react';
import Link from 'next/link';
import { User, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Navbar: React.FC = () => {
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

        <Link
          href="/profile"
          className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
        >
          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
            <User className="w-3.5 h-3.5" />
          </div>
          <span>Alex Morgan</span>
        </Link>
      </div>
    </header>
  );
};
