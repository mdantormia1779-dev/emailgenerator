import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { decryptToken, encryptToken } from '@/lib/crypto';
import prisma from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { getResumeFileBuffer } from './storage.service';

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
];

export function getOAuth2Client(): OAuth2Client {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri =
    process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/api/integrations/gmail/callback';

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Generates the Google OAuth authorization URL.
 */
export function getGmailAuthUrl(): string {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Ensure refresh_token is returned
    scope: GMAIL_SCOPES,
  });
}

/**
 * Exchanges OAuth authorization code for tokens and persists encrypted credentials.
 */
export async function handleOAuthCallback(userId: string, code: string): Promise<string> {
  const oauth2Client = getOAuth2Client();

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Retrieve user's email address from Google OAuth2
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();
  const gmailAddress = userInfo.data.email;

  if (!gmailAddress) {
    throw new AppError('Could not retrieve email address from Gmail account.');
  }

  const encryptedAccessToken = encryptToken(tokens.access_token || '');
  const encryptedRefreshToken = encryptToken(tokens.refresh_token || '');
  const tokenExpiry = new Date(tokens.expiry_date || Date.now() + 3600 * 1000);

  // Upsert GmailAccount in database
  await prisma.gmailAccount.upsert({
    where: { userId },
    update: {
      email: gmailAddress,
      encryptedAccessToken,
      encryptedRefreshToken,
      tokenExpiry,
      isConnected: true,
      updatedAt: new Date(),
    },
    create: {
      userId,
      email: gmailAddress,
      encryptedAccessToken,
      encryptedRefreshToken,
      tokenExpiry,
      isConnected: true,
    },
  });

  return gmailAddress;
}

/**
 * Disconnects the user's Gmail account.
 */
export async function disconnectGmail(userId: string): Promise<void> {
  await prisma.gmailAccount.updateMany({
    where: { userId },
    data: {
      isConnected: false,
      encryptedAccessToken: '',
      encryptedRefreshToken: '',
    },
  });
}

/**
 * Formats an RFC 2822 email message with optional MIME attachments and encodes it to base64url.
 */
export function buildMimeEmail(options: {
  from: string;
  to: string;
  subject: string;
  body: string;
  attachment?: {
    filename: string;
    mimeType: string;
    content: Buffer;
  } | null;
}): string {
  const boundary = `====_NextPart_${Date.now()}_====`;
  const sanitizedSubject = options.subject.replace(/[\r\n]+/g, ' ');

  if (!options.attachment) {
    // Simple text email
    const messageParts = [
      `From: ${options.from}`,
      `To: ${options.to}`,
      `Subject: =?UTF-8?B?${Buffer.from(sanitizedSubject).toString('base64')}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: 8bit',
      '',
      options.body,
    ];
    return Buffer.from(messageParts.join('\r\n'))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  // Multipart with attachment
  const messageParts = [
    `From: ${options.from}`,
    `To: ${options.to}`,
    `Subject: =?UTF-8?B?${Buffer.from(sanitizedSubject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    options.body,
    '',
    `--${boundary}`,
    `Content-Type: ${options.attachment.mimeType}; name="${options.attachment.filename}"`,
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${options.attachment.filename}"`,
    '',
    options.attachment.content.toString('base64'),
    '',
    `--${boundary}--`,
  ];

  return Buffer.from(messageParts.join('\r\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Sends an email using server-side Gmail API or realistic simulator in demo mode.
 */
export async function sendGmailEmail(options: {
  userId: string;
  recipientEmail: string;
  subject: string;
  body: string;
  resumeId?: string | null;
}): Promise<{ messageId: string; senderEmail: string }> {
  // 1. Retrieve connected account
  const account = await prisma.gmailAccount.findUnique({
    where: { userId: options.userId },
  });

  const isDemo = process.env.DEMO_MODE === 'true' || !process.env.GMAIL_CLIENT_ID;

  if (!account || !account.isConnected) {
    if (isDemo) {
      // In demo mode without linked OAuth, use demo sender
      const demoSender = 'demo.applicant@gmail.com';
      const demoMessageId = `mock_gmail_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      console.log(`[Gmail Service Demo Mode] Simulated send to ${options.recipientEmail} with id ${demoMessageId}`);
      return { messageId: demoMessageId, senderEmail: demoSender };
    }
    throw new AppError('No connected Gmail account found. Please connect your Gmail account in Integrations.', 400);
  }

  const oauth2Client = getOAuth2Client();
  const accessToken = decryptToken(account.encryptedAccessToken);
  const refreshToken = decryptToken(account.encryptedRefreshToken);

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: account.tokenExpiry.getTime(),
  });

  // Handle attachment if resume is specified
  let attachment: { filename: string; mimeType: string; content: Buffer } | null = null;
  if (options.resumeId) {
    const resume = await prisma.resume.findUnique({
      where: { id: options.resumeId },
    });
    if (resume) {
      const buffer = await getResumeFileBuffer(resume.filePath);
      attachment = {
        filename: resume.originalName,
        mimeType: resume.mimeType,
        content: buffer,
      };
    }
  }

  // Build MIME message
  const rawBase64 = buildMimeEmail({
    from: account.email,
    to: options.recipientEmail,
    subject: options.subject,
    body: options.body,
    attachment,
  });

  if (isDemo && (!accessToken || !refreshToken)) {
    const mockId = `mock_gmail_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return { messageId: mockId, senderEmail: account.email };
  }

  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawBase64,
      },
    });

    const messageId = res.data.id || `msg_${Date.now()}`;
    return { messageId, senderEmail: account.email };
  } catch (err: unknown) {
    console.error('Gmail API Error during send:', err);
    throw new AppError('Failed to send email through Gmail. Please verify your connection.', 500);
  }
}
