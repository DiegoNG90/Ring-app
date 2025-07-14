'use client';
import React from 'react';

export function useWindowSize() {
  const [size, setSize] = React.useState<{
    width?: number;
    height?: number;
  }>({});

  React.useEffect(() => {
    function updateSize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
}
