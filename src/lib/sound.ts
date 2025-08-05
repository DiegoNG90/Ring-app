export class Sound {
  private soundSrc: string;
  private volume: number;
  private audio: HTMLAudioElement;

  constructor(soundSrc?: string, volume?: number) {
    this.soundSrc = soundSrc || '/sounds/boxing-bell.ogg';
    this.volume = volume || 0.5;
    this.audio = new Audio(this.soundSrc);
    this.audio.volume = this.volume;
  }

  play(): Promise<void> {
    return this.audio.play().catch(console.error);
  }

  pause(): void {
    this.audio.pause();
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  setVolume(newVolume: number): void {
    this.volume = Math.max(0, Math.min(1, newVolume)); // Entre 0 y 1
    this.audio.volume = this.volume;
  }

  getVolume(): number {
    return this.volume;
  }

  setSrc(newSrc: string): void {
    this.soundSrc = newSrc;
    this.audio.src = newSrc;
  }

  getSrc(): string {
    return this.soundSrc;
  }
}
