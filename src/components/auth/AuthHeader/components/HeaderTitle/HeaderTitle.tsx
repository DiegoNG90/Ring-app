'use client';
import React from 'react';

import { useWindowSize } from '@/hooks/useWindowSize';
import { LAYOUT_BREAKPOINTS } from '@/types/layout';

function HeaderTitle({ title }: { title: string }) {
  const windowSize = useWindowSize();

  return (
    <p>
      {windowSize?.width &&
        windowSize?.width > LAYOUT_BREAKPOINTS.LARGE_MOBILE &&
        title}
    </p>
  );
}

export default HeaderTitle;
