import { Sound } from './sound';

describe('Sound', () => {
  let playMock: jest.Mock;
  let pauseMock: jest.Mock;

  beforeEach(() => {
    playMock = jest.fn();
    pauseMock = jest.fn();

    jest.spyOn(window, 'Audio').mockImplementation(
      () =>
        ({
          volume: 1,
          currentTime: 0,
          src: '',
          play: playMock,
          pause: pauseMock,
        }) as unknown as HTMLAudioElement,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('swallows AbortError when play is interrupted by stop', async () => {
    const abort = new DOMException('interrupted', 'AbortError');
    playMock.mockReturnValue(Promise.reject(abort));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const sound = new Sound('/test.mp3');
    await sound.play();
    sound.stop();

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('logs non-AbortError play failures', async () => {
    const notAllowed = new DOMException('not allowed', 'NotAllowedError');
    playMock.mockReturnValue(Promise.reject(notAllowed));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const sound = new Sound('/test.mp3');
    await sound.play();

    expect(consoleSpy).toHaveBeenCalledWith(notAllowed);
    consoleSpy.mockRestore();
  });
});
