'use client';

import { OptionPills } from '@/components/training/CreateRoutine/components/OptionPills';
import {
  formatRoundLabel,
  getRoutineTypeDefinition,
  type RoutineType,
} from '@/lib/routines/routine-types';

interface RoundsStepProps {
  trainingType: RoutineType;
  value: number | null;
  onChange: (value: number) => void;
}

export function RoundsStep({ trainingType, value, onChange }: RoundsStepProps) {
  const definition = getRoutineTypeDefinition(trainingType);
  const options = definition.roundsOptions;

  return (
    <OptionPills
      label="Cantidad de rounds"
      name="rounds"
      options={options}
      value={value}
      onChange={onChange}
      formatOption={formatRoundLabel}
    />
  );
}

export function isRoundsStepValid(value: number | null): boolean {
  return value !== null;
}
