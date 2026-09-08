'use client';

import React, { useEffect, useState } from 'react';
import {
  User,
  Briefcase,
  Layers,
  GraduationCap,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Github,
  Linkedin,
  Globe,
  Phone,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Contact / Socials
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  // Nested collections
  const [projects, setProjects] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile');
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          setFullName(d.fullName || '');
          setTitle(d.title || '');
          setYearsOfExperience(d.yearsOfExperience || 0);
          setSummary(d.summary || '');
          setSkills(d.skills || []);
          setGithub(d.github || '');
          setLinkedin(d.linkedin || '');
          setPortfolio(d.portfolio || '');
          setPhone(d.phone || '');
          setLocation(d.location || '');
          setProjects(d.projects || []);
          setExperiences(d.experiences || []);
          setEducation(d.education || []);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const val = newSkillInput.trim();
    if (val && !skills.includes(val)) {
      setSkills([...skills, val]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Experience handlers
  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      {
        company: '',
        role: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
        achievements: [],
      },
    ]);
  };

  const handleRemoveExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  // Project handlers
  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        title: '',
        description: '',
        techStack: [],
        liveUrl: '',
        githubUrl: '',
      },
    ]);
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Education handlers
  const handleAddEducation = () => {
    setEducation([
      ...education,
      {
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startYear: new Date().getFullYear() - 4,
        endYear: new Date().getFullYear(),
      },
    ]);
  };

  const handleRemoveEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Submit Profile Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const payload = {
      fullName,
      title,
      yearsOfExperience: Number(yearsOfExperience),
      summary,
      skills,
      github: github || null,
      linkedin: linkedin || null,
      portfolio: portfolio || null,
      phone: phone || null,
      location: location || null,
      projects,
      experiences,
      education,
    };

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update profile.');
      }

      setFeedback({ type: 'success', message: 'Profile facts successfully saved!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error saving profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Factual User Profile
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 max-w-2xl">
            This profile is your single source of truth. The AI assistant strictly derives skills, projects, and experiences from here and will <strong>never</strong> invent qualifications.
          </p>
        </div>
        <Button
          type="submit"
          isLoading={isSaving}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Profile
        </Button>
      </div>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* 1. Basic Info & Professional Headline */}
      <Card>
        <CardHeader
          title="Personal &amp; Professional Identity"
          subtitle="Your primary candidate information"
        />
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Professional Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Senior Full Stack Engineer"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Years of Experience <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                max={50}
                required
                value={yearsOfExperience}
                onChange={e => setYearsOfExperience(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Professional Summary <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Highlight your core technical strengths, engineering philosophy, and measurable business impact..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          {/* Social Links & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="San Francisco, CA"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" /> Portfolio URL
              </label>
              <input
                type="url"
                value={portfolio}
                onChange={e => setPortfolio(e.target.value)}
                placeholder="https://yourdomain.dev"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Github className="w-3.5 h-3.5 text-slate-400" /> GitHub URL
              </label>
              <input
                type="url"
                value={github}
                onChange={e => setGithub(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Linkedin className="w-3.5 h-3.5 text-slate-400" /> LinkedIn URL
              </label>
              <input
                type="url"
                value={linkedin}
                onChange={e => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Skills Inventory */}
      <Card>
        <CardHeader
          title="Documented Skills Inventory"
          subtitle="The AI will ONLY claim and highlight skills from this verified list"
        />
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkillInput}
              onChange={e => setNewSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder="Type a skill and press Enter (e.g. TypeScript, React, Docker)..."
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <Button type="button" size="sm" onClick={handleAddSkill} leftIcon={<Plus className="w-4 h-4" />}>
              Add Skill
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-indigo-400 hover:text-indigo-600 focus:outline-none"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3. Work Experience */}
      <Card>
        <CardHeader
          title="Work Experience"
          subtitle="Documented positions used to factualize application emails"
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddExperience}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Experience
            </Button>
          }
        />
        <CardContent className="space-y-6">
          {experiences.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-4">
              No work experience added yet. Click &quot;Add Experience&quot; to add positions.
            </p>
          ) : (
            experiences.map((exp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Role #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(idx)}
                    className="text-rose-500 hover:text-rose-700 text-xs p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={e => {
                        const updated = [...experiences];
                        updated[idx].company = e.target.value;
                        setExperiences(updated);
                      }}
                      placeholder="TechCorp Inc."
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Role Title</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={e => {
                        const updated = [...experiences];
                        updated[idx].role = e.target.value;
                        setExperiences(updated);
                      }}
                      placeholder="Senior Software Engineer"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Start Date</label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={e => {
                        const updated = [...experiences];
                        updated[idx].startDate = e.target.value;
                        setExperiences(updated);
                      }}
                      placeholder="2021-03"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">End Date</label>
                    <input
                      type="text"
                      disabled={exp.isCurrent}
                      value={exp.endDate || ''}
                      onChange={e => {
                        const updated = [...experiences];
                        updated[idx].endDate = e.target.value;
                        setExperiences(updated);
                      }}
                      placeholder={exp.isCurrent ? 'Present' : '2023-11'}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white disabled:bg-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Description</label>
                  <textarea
                    rows={3}
                    value={exp.description}
                    onChange={e => {
                      const updated = [...experiences];
                      updated[idx].description = e.target.value;
                      setExperiences(updated);
                    }}
                    placeholder="Describe main responsibilities, team size, and architectural achievements..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 4. Projects */}
      <Card>
        <CardHeader
          title="Documented Projects"
          subtitle="Real projects the AI can highlight when relevant to the job"
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddProject}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Project
            </Button>
          }
        />
        <CardContent className="space-y-4">
          {projects.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-4">
              No projects added. Click &quot;Add Project&quot; to include portfolio projects.
            </p>
          ) : (
            projects.map((proj, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Project #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(idx)}
                    className="text-rose-500 hover:text-rose-700 text-xs p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Title</label>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={e => {
                        const updated = [...projects];
                        updated[idx].title = e.target.value;
                        setProjects(updated);
                      }}
                      placeholder="CloudCommerce"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Tech Stack (comma separated)</label>
                    <input
                      type="text"
                      value={Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack || ''}
                      onChange={e => {
                        const updated = [...projects];
                        updated[idx].techStack = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setProjects(updated);
                      }}
                      placeholder="Next.js, React, PostgreSQL"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Description</label>
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={e => {
                      const updated = [...projects];
                      updated[idx].description = e.target.value;
                      setProjects(updated);
                    }}
                    placeholder="Brief description of what was built, problem solved, and results..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Save Button Bar */}
      <div className="flex justify-end gap-3 sticky bottom-4 p-4 bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 shadow-md">
        <Button
          type="submit"
          size="lg"
          isLoading={isSaving}
          leftIcon={<Save className="w-5 h-5" />}
        >
          Save Complete Profile
        </Button>
      </div>
    </form>
  );
}
