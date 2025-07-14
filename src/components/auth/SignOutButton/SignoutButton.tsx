'use client';

import React from 'react';
import logo from '@/assets/logout.svg';
import Image from 'next/image';
import Popover from './Popover/Popover';
import { useWindowSize } from '@/hooks/useWindowSize';

function SignoutButton() {
  const [showPopover, setShowPopover] = React.useState(false);
  const size = useWindowSize();

  function handleShowPopover() {
    if (size.width !== undefined && size.width < 380) return;
    setShowPopover(true);
  }

  function handleHidePopover() {
    setShowPopover(false);
  }

  return (
    <div className="flex gap-2 justify-center items-center">
      {showPopover && <Popover />}

      <button onMouseOver={handleShowPopover} onMouseOut={handleHidePopover}>
        <Image src={logo} alt="Logout" width={20} height={20} />
      </button>
    </div>
  );
}

export default SignoutButton;
