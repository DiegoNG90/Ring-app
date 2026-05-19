import '../globals.css';
import AuthHeader from '@/components/auth/AuthHeader';

export const metadata = {
  title: 'Training!',
  description: 'Next.js Authentication',
};

export default function AuthRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthHeader />
      {children}
    </>
  );
}
