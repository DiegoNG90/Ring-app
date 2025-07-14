import { logout } from '@/actions/auth-actions';
import '../globals.css';
import SignoutButton from '@/components/auth/SignOutButton';
import Image from 'next/image';

export const metadata = {
  title: 'Training!',
  description: 'Next.js Authentication',
};

import boxingGloveLogo from '@/assets/boxing-glove.svg';
import boxingHelmetLogo from '@/assets/boxing-helmet.svg';

export default function AuthRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header id="auth-header">
        <div className="flex justify-center items-center gap-4">
          <Image
            src={boxingGloveLogo}
            alt="boxing glove"
            className="grayscale-25"
            width={64}
            height={64}
          />
          <Image
            src={boxingHelmetLogo}
            alt="boxing glove"
            className="hue-rotate-135"
            width={64}
            height={64}
          />

          <p>Welcome back!</p>
        </div>
        <form action={logout}>
          <SignoutButton />
        </form>
      </header>
      {children}
    </>
  );
}
