import { describe, it, expect } from 'vitest';
import { parseFacebookJobPost } from '@/services/facebook/facebookParser.service';

describe('Facebook Job Post Parser', () => {
  it('extracts role title, skills, and email from typical Facebook developer group post', () => {
    const rawPost = {
      content: `🚀 Urgent Hiring: MERN Stack Developer (Remote)
Company: Nexus Tech Ltd.
We are looking for a skilled MERN Stack Developer.

Requirements:
- MongoDB, Express.js, React, Node.js
- TypeScript experience is a plus
- 3+ years of experience

Send your resume to hr@nexustech.io with expected salary.`,
      postUrl: 'https://facebook.com/groups/devjobs/posts/12345',
      author: 'Nexus HR',
    };

    const parsed = parseFacebookJobPost(rawPost);

    expect(parsed.isJobPost).toBe(true);
    expect(parsed.title.toLowerCase()).toContain('mern stack developer');
    expect(parsed.company).toBe('Nexus Tech Ltd.');
    expect(parsed.recipientEmail).toBe('hr@nexustech.io');
    expect(parsed.requiredSkills).toContain('React');
    expect(parsed.requiredSkills).toContain('Node.js');
    expect(parsed.workType).toBe('Remote');
  });

  it('handles posts with Frontend Developer and clean email extraction', () => {
    const rawPost = {
      content: `📢 We're Hiring: Frontend Engineer
Drop your CV to jobs@modernweb.com.
Must know React.js, Next.js, and Tailwind CSS.`,
    };

    const parsed = parseFacebookJobPost(rawPost);

    expect(parsed.isJobPost).toBe(true);
    expect(parsed.title.toLowerCase()).toContain('frontend');
    expect(parsed.recipientEmail).toBe('jobs@modernweb.com');
    expect(parsed.requiredSkills).toContain('React');
    expect(parsed.requiredSkills).toContain('Next.js');
    expect(parsed.requiredSkills).toContain('Tailwind CSS');
  });

  it('correctly classifies non-job social posts as isJobPost = false', () => {
    const rawPost = {
      content: `Hello everyone, what is the best laptop for programming under $1000? Let me know your thoughts in comments!`,
    };

    const parsed = parseFacebookJobPost(rawPost);
    expect(parsed.isJobPost).toBe(false);
  });
});
