'use client';

import React from 'react';
import { Github, Linkedin, Globe, Phone, MapPin } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

interface ProfileSocialLinksProps {
  location: string;
  setLocation: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  portfolio: string;
  setPortfolio: (val: string) => void;
  github: string;
  setGithub: (val: string) => void;
  linkedin: string;
  setLinkedin: (val: string) => void;
}

export const ProfileSocialLinks: React.FC<ProfileSocialLinksProps> = ({
  location,
  setLocation,
  phone,
  setPhone,
  portfolio,
  setPortfolio,
  github,
  setGithub,
  linkedin,
  setLinkedin,
}) => {
  const fields = [
    { label: 'Location', icon: MapPin, val: location, set: setLocation, placeholder: 'San Francisco, CA', type: 'text' },
    { label: 'Phone', icon: Phone, val: phone, set: setPhone, placeholder: '+1 (555) 019-2834', type: 'text' },
    { label: 'Portfolio URL', icon: Globe, val: portfolio, set: setPortfolio, placeholder: 'https://yourdomain.dev', type: 'url' },
    { label: 'GitHub URL', icon: Github, val: github, set: setGithub, placeholder: 'https://github.com/username', type: 'url' },
    { label: 'LinkedIn URL', icon: Linkedin, val: linkedin, set: setLinkedin, placeholder: 'https://linkedin.com/in/username', type: 'url' },
  ];

  return (
    <Card>
      <CardHeader title="Contact & Social Links" subtitle="Verified channels for employers and recruiters" />
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {fields.map(({ label, icon: Icon, val, set, placeholder, type }) => (
            <div key={label}>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Icon className="w-3.5 h-3.5 text-slate-400" /> {label}
              </label>
              <input
                type={type}
                value={val}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
