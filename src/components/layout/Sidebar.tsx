'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { SidebarNav } from './SidebarNav';
import { SidebarUserFooter } from './SidebarUserFooter';

export const Sidebar: React.FC = () => {
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

      {/* Navigation Links */}
      <SidebarNav />

      {/* User Session & Safety Footers */}
      <SidebarUserFooter />
    </aside>
  );
};
