import { logout } from '@/actions/auth-actions';
import '../globals.css';
import SignoutButton from '@/components/auth/SignOutButton';

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
      <header id="auth-header">
        <p>Welcome back!</p>
        <form action={logout}>
          <SignoutButton />
        </form>
      </header>
      {children}
    </>
  );
}
