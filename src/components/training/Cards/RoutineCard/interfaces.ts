export type SegmentType = 'round' | 'rest';

export interface RoutineSegment {
  type: SegmentType;
  round: number;
}

export interface SegmentStepLabel {
  text: string;
  colorClass: string;
}
