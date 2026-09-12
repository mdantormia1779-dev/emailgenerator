'use client';

import React from 'react';
import { Mail, User } from 'lucide-react';

interface SignupNameEmailFieldsProps {
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
}

export const SignupNameEmailFields: React.FC<SignupNameEmailFieldsProps> = ({
  name,
  setName,
  email,
  setEmail,
}) => {
  return (
    <>
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            placeholder="e.g. Tanvir Ahmed"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>
      </div>
    </>
  );
};
