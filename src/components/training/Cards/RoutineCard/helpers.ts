import type { RoutineSegment, SegmentStepLabel } from './interfaces';

/** Round1 → (descanso?)* → Round2 → … Solo inserta descansos si hay segundos de descanso. */
export function buildRoutineSegments(
  totalRounds: number,
  restSeconds: number,
): RoutineSegment[] {
  const segments: RoutineSegment[] = [];
  const hasRest = restSeconds > 0;

  for (let i = 1; i <= totalRounds; i++) {
    segments.push({ type: 'round', round: i });
    if (hasRest && i < totalRounds) {
      segments.push({ type: 'rest', round: i });
    }
  }

  return segments;
}

export function getSegmentStepLabel(
  segment: RoutineSegment,
  cycleNumber?: number,
): SegmentStepLabel {
  if (segment.type === 'rest') {
    return {
      text: 'Descanso',
      colorClass: 'text-orange-400',
    };
  }
  if (cycleNumber != null) {
    return {
      text: `Ciclo ${cycleNumber}`,
      colorClass: 'text-emerald-400',
    };
  }
  return {
    text: `Round ${segment.round}`,
    colorClass: 'text-emerald-400',
  };
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
