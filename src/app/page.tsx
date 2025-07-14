import AuthForm from '@/components/auth/AuthForm';

interface PageProps {
  searchParams: {
    [key: string]: string | undefined;
  };
}

export default async function Home({ searchParams }: PageProps) {
  const { mode } = await searchParams;
  return (
    <main>
      <AuthForm mode={mode || 'login'} />
    </main>
  );
}
