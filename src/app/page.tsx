import AuthForm from '@/components/auth/AuthForm';
import { verifyAuth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const result = await verifyAuth();

  if (result.user && result.user.id) {
    return redirect('/training');
  }

  return (
    <main>
      <AuthForm />
    </main>
  );
}
