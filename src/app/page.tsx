import AuthForm from '@/components/auth/AuthForm';
import { verifyAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: {
    [key: string]: string | undefined;
  };
}

export default async function Home({ searchParams }: PageProps) {
  const { mode } = await searchParams;

  const result = await verifyAuth();

  if (result.user && result.user.id) {
    return redirect('/training');
  }

  return (
    <main>
      <AuthForm mode={mode || 'login'} />
    </main>
  );
}
