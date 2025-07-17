export function playSound({
  soundSrc,
  volume,
}: {
  soundSrc?: string;
  volume?: number;
}) {
  const safeSoundSrc = soundSrc || '/sounds/boxing-bell.ogg';
  const audio = new Audio(safeSoundSrc);
  audio.play().catch(console.error);
  audio.volume = volume || 0.5;
}
