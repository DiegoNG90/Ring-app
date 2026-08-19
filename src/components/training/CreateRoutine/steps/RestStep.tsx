'use client';

import { OptionPills } from '@/components/training/CreateRoutine/components/OptionPills';
import {
  formatDurationLabel,
  getRoutineTypeDefinition,
  type RoutineType,
} from '@/lib/routines/routine-types';

interface RestStepProps {
  trainingType: RoutineType;
  value: number | null;
  onChange: (value: number) => void;
}

export function RestStep({ trainingType, value, onChange }: RestStepProps) {
  const definition = getRoutineTypeDefinition(trainingType);
  const options = definition.restDurationOptions ?? [];

  return (
    <OptionPills
      label="Descanso entre lapsos"
      name="rest-duration"
      options={options}
      value={value}
      onChange={onChange}
      formatOption={formatDurationLabel}
    />
  );
}

export function isRestStepValid(value: number | null): boolean {
  return value !== null;
}
