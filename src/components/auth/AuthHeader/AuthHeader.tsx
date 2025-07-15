import React from 'react';

import SignoutButton from '@/components/auth/SignOutButton';
import Image from 'next/image';

import boxingGloveLogo from '@/assets/boxing-glove.svg';
import boxingHelmetLogo from '@/assets/boxing-helmet.svg';
import { logout } from '@/actions/auth-actions';
import HeaderTitle from './components/HeaderTitle';

function AuthHeader() {
  return (
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
        <HeaderTitle title="Welcome back!" />
      </div>
      <form action={logout}>
        <SignoutButton />
      </form>
    </header>
  );
}

export default AuthHeader;
