import { getTrainingHref as buildTrainingHref } from '@/lib/utils/strings';

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getTrainingHref(
  trainingId: number,
  trainingTitle: string,
): string {
  return buildTrainingHref(trainingId, trainingTitle);
}
