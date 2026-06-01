'use client';

import React from 'react';
import logo from '@/assets/logout.svg';
import Image from 'next/image';

function SignoutButton() {
  return (
    <div className="flex gap-2 justify-center items-center">
      <button className="flex gap-2 items-center">
        Salir{' '}
        <Image
          src={logo}
          className="size-4 color-white"
          alt="Logout"
          width={16}
          height={16}
        />
      </button>
    </div>
  );
}

export default SignoutButton;
