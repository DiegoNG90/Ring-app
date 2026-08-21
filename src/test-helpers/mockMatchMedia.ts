type ChangeListener = (event: MediaQueryListEvent) => void;

export interface MockMatchMediaController {
  setLandscape: (landscape: boolean) => void;
  restore: () => void;
}

export function mockMatchMedia(
  initialLandscape = false,
): MockMatchMediaController {
  let isLandscape = initialLandscape;
  const listeners = new Set<ChangeListener>();
  const originalMatchMedia = window.matchMedia;

  const matchMediaImpl = jest.fn((query: string) => {
    const matches =
      query === '(orientation: landscape)'
        ? isLandscape
        : query === '(orientation: portrait)'
          ? !isLandscape
          : false;

    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: jest.fn((event: string, listener: ChangeListener) => {
        if (event === 'change') listeners.add(listener);
      }),
      removeEventListener: jest.fn(
        (event: string, listener: ChangeListener) => {
          if (event === 'change') listeners.delete(listener);
        },
      ),
      addListener: jest.fn((listener: ChangeListener) => {
        listeners.add(listener);
      }),
      removeListener: jest.fn((listener: ChangeListener) => {
        listeners.delete(listener);
      }),
      dispatchEvent: jest.fn(),
    };
  });

  window.matchMedia = matchMediaImpl as typeof window.matchMedia;

  return {
    setLandscape(landscape: boolean) {
      isLandscape = landscape;
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: landscape ? 844 : 390,
      });
      Object.defineProperty(window, 'innerHeight', {
        configurable: true,
        value: landscape ? 390 : 844,
      });

      const event = { matches: landscape } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
      window.dispatchEvent(new Event('resize'));
    },
    restore() {
      window.matchMedia = originalMatchMedia;
    },
  };
}
