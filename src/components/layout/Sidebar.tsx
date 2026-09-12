'use client';

import React from 'react';
import { SidebarBrand } from './SidebarBrand';
import { SidebarNav } from './SidebarNav';
import { SidebarUserFooter } from './SidebarUserFooter';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  return (
    <>
      {/* Desktop Sidebar: Sticky & Fixed Height with internal scroll */}
      <aside className="hidden md:flex flex-col w-64 sticky top-0 h-screen flex-shrink-0 bg-white border-r border-slate-200 z-20 overflow-y-auto">
        <SidebarBrand />
        <SidebarNav />
        <SidebarUserFooter />
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <aside className="relative flex flex-col w-64 max-w-[80vw] bg-white h-full shadow-2xl z-10 overflow-y-auto">
            <SidebarBrand onClose={onClose} />
            <SidebarNav onItemClick={onClose} />
            <SidebarUserFooter />
          </aside>
        </div>
      )}
    </>
  );
};
