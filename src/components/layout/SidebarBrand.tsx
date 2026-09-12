'use client';

import React from 'react';
import { Sparkles, X } from 'lucide-react';

export const SidebarBrand: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  return (
    <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
      <div className="flex items-center gap-3">
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
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
