import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'JobApply AI - Personal AI Job Application Assistant',
  description:
    'AI-powered job application assistant: analyze requirements, match factual profile skills, generate tailored emails, review, and safely send via Gmail.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
