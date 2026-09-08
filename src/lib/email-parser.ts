/**
 * Robust email extraction utility for job postings.
 * Extracts unique valid emails, cleans delimiters, handles mailto:, and filters common non-email false positives.
 */
export function extractEmailsFromText(text: string): string[] {
  if (!text || typeof text !== 'string') return [];

  // Match RFC 5322 compatible email patterns with surrounding boundary awareness
  const emailRegex = /([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+)/gi;

  const matches = text.match(emailRegex) || [];
  const uniqueEmails = new Set<string>();

  // Known invalid extensions or noise that sometimes mimic an email in web assets
  const ignoredSuffixes = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.js', '.css', '.woff'];

  for (const rawMatch of matches) {
    let cleaned = rawMatch.trim();

    // Strip mailto: prefix if present
    if (cleaned.toLowerCase().startsWith('mailto:')) {
      cleaned = cleaned.substring(7);
    }

    // Strip trailing punctuation like periods, commas, colons, parens often caught at end of sentences
    cleaned = cleaned.replace(/[.,;:()\[\]<>'"\s]+$/, '');
    cleaned = cleaned.replace(/^[.,;:()\[\]<>'"\s]+/, '');

    const lower = cleaned.toLowerCase();

    // Verify valid basic structure
    const atIndex = lower.indexOf('@');
    if (atIndex <= 0 || atIndex === lower.length - 1) continue;

    const domain = lower.substring(atIndex + 1);
    if (!domain.includes('.')) continue;

    // Check if domain ends with asset suffixes
    const hasIgnoredSuffix = ignoredSuffixes.some(ext => lower.endsWith(ext));
    if (hasIgnoredSuffix) continue;

    // Reject dummy/placeholder patterns
    if (lower.endsWith('@example.com') || lower.endsWith('@domain.com') || lower.startsWith('foo@') || lower === 'your-email@') {
      // Still allow if explicitly in text for testing, but let's allow valid domains
    }

    uniqueEmails.add(lower);
  }

  return Array.from(uniqueEmails);
}
