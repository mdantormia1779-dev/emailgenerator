import { describe, it, expect } from 'vitest';
import { extractEmailsFromText } from '@/lib/email-parser';

describe('extractEmailsFromText', () => {
  it('extracts a single email from job description text', () => {
    const text = `
      Software Engineer at ACME Corp.
      Please send your resume to careers@acmecorp.com for consideration.
    `;
    const emails = extractEmailsFromText(text);
    expect(emails).toEqual(['careers@acmecorp.com']);
  });

  it('extracts multiple unique emails and trims trailing punctuation', () => {
    const text = `
      Apply directly at hiring@techcorp.io, or contact the recruiter at recruiter.john@techcorp.io.
      For inquiries: info@techcorp.io!
      Duplicate mention: hiring@techcorp.io
    `;
    const emails = extractEmailsFromText(text);
    expect(emails).toHaveLength(3);
    expect(emails).toContain('hiring@techcorp.io');
    expect(emails).toContain('recruiter.john@techcorp.io');
    expect(emails).toContain('info@techcorp.io');
  });

  it('correctly handles mailto: links and angle brackets', () => {
    const text = `
      Click here to email us: <mailto:jobs-apply@startup.co> or apply@startup.co.
    `;
    const emails = extractEmailsFromText(text);
    expect(emails).toContain('jobs-apply@startup.co');
    expect(emails).toContain('apply@startup.co');
  });

  it('filters out non-email image assets or false positives', () => {
    const text = `
      Logo image: header-logo@2x.png and styles.css.
      Real contact: jobs@company.com
    `;
    const emails = extractEmailsFromText(text);
    expect(emails).toEqual(['jobs@company.com']);
  });

  it('returns an empty array when no email is present or input is empty', () => {
    expect(extractEmailsFromText('')).toEqual([]);
    expect(extractEmailsFromText('We are hiring! Visit our website to apply.')).toEqual([]);
  });
});
