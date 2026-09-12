import { useState, useEffect } from 'react';

export function useProfileWorkflow() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');

  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

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

  return {
    loading,
    isSaving,
    feedback,
    setFeedback,
    fullName,
    setFullName,
    title,
    setTitle,
    yearsOfExperience,
    setYearsOfExperience,
    summary,
    setSummary,
    skills,
    newSkillInput,
    setNewSkillInput,
    handleAddSkill,
    handleRemoveSkill,
    github,
    setGithub,
    linkedin,
    setLinkedin,
    portfolio,
    setPortfolio,
    phone,
    setPhone,
    location,
    setLocation,
    experiences,
    setExperiences,
    handleAddExperience,
    handleRemoveExperience,
    projects,
    setProjects,
    handleAddProject,
    handleRemoveProject,
    handleSubmit,
  };
}
