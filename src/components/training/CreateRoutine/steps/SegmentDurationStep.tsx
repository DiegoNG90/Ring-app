'use client';

import { OptionPills } from '@/components/training/CreateRoutine/components/OptionPills';
import {
  formatDurationLabel,
  getRoutineTypeDefinition,
  type RoutineType,
} from '@/lib/routines/routine-types';

interface SegmentDurationStepProps {
  trainingType: RoutineType;
  value: number | null;
  onChange: (value: number) => void;
}

export function SegmentDurationStep({
  trainingType,
  value,
  onChange,
}: SegmentDurationStepProps) {
  const definition = getRoutineTypeDefinition(trainingType);
  const options = definition.segmentDurationOptions ?? [];

  return (
    <OptionPills
      label="Duración del segmento"
      name="segment-duration"
      options={options}
      value={value}
      onChange={onChange}
      formatOption={formatDurationLabel}
    />
  );
}

export function isSegmentDurationStepValid(value: number | null): boolean {
  return value !== null;
}
