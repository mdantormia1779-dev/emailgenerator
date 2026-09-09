import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE_NAME, verifyToken } from '@/lib/auth-jwt';

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      redirect('/dashboard');
    }
  }

  redirect('/login');
}
