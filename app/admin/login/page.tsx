import { Logo } from '@/components/brand/Logo';
import { LoginForm } from '@/components/admin/LoginForm';

export const metadata = { title: 'Sign in' };

const NOTICES: Record<string, string> = {
  config: 'Supabase is not configured on this deployment.',
  forbidden: 'This account does not have admin access.',
};

export default async function LoginPage({ searchParams }: PageProps<'/admin/login'>) {
  const { e } = await searchParams;
  return (
    <main className="grid min-h-svh place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <Logo className="w-40 text-bone" />
        <h1 className="font-display mt-10 text-h3 italic">Staff sign-in</h1>
        <p className="mt-2 text-small text-muted">Reservations and messages.</p>
        <LoginForm notice={typeof e === 'string' ? NOTICES[e] : undefined} />
      </div>
    </main>
  );
}
