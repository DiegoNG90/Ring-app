'use client';

export class Sound {
  private soundSrc: string;
  private volume: number;
  private audio: HTMLAudioElement | null = null;

  constructor(soundSrc?: string, volume?: number) {
    this.soundSrc = soundSrc || '/sounds/boxing-bell.ogg';
    this.volume = volume || 0.5;
  }

  private ensureAudio(): HTMLAudioElement {
    if (!this.audio && typeof window !== 'undefined') {
      this.audio = new Audio(this.soundSrc);
      this.audio.volume = this.volume;
    }
    return this.audio!;
  }

  play(): Promise<void> {
    const audio = this.ensureAudio();
    audio.currentTime = 0;
    const promise = audio.play();
    if (!promise) return Promise.resolve();

    return promise.catch((err: unknown) => {
      const errorName = err instanceof Error ? err.name : 'unknown';
      if (errorName === 'AbortError') return;
      console.error(err);
    });
  }

  pause(): void {
    const audio = this.ensureAudio();
    audio.pause();
  }

  stop(): void {
    const audio = this.ensureAudio();
    audio.pause();
    audio.currentTime = 0;
  }

  setVolume(newVolume: number): void {
    this.volume = Math.max(0, Math.min(1, newVolume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  getVolume(): number {
    return this.volume;
  }

  setSrc(newSrc: string): void {
    this.soundSrc = newSrc;
    if (this.audio) {
      this.audio.src = newSrc;
    }
  }

  getSrc(): string {
    return this.soundSrc;
  }
}
