'use client';

import {
  ROUTINE_TYPE_DEFINITIONS,
  ROUTINE_TYPES,
  type RoutineType,
} from '@/lib/routines/routine-types';

interface TypeStepProps {
  value: RoutineType | null;
  onChange: (value: RoutineType) => void;
}

export function TypeStep({ value, onChange }: TypeStepProps) {
  return (
    <div className="space-y-3">
      <label htmlFor="routine-type" className="block text-sm font-medium text-zinc-200">
        Tipo de rutina
      </label>
      <select
        id="routine-type"
        name="routine-type"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value as RoutineType)}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-base text-zinc-100 outline-none ring-teal-500 focus:border-teal-400 focus:ring-2"
        aria-required="true"
      >
        <option value="" disabled>
          Seleccioná un tipo
        </option>
        {ROUTINE_TYPES.map((type) => (
          <option key={type} value={type}>
            {ROUTINE_TYPE_DEFINITIONS[type].label}
          </option>
        ))}
      </select>
      {value && (
        <p className="text-sm text-zinc-400">
          {ROUTINE_TYPE_DEFINITIONS[value].description}
        </p>
      )}
    </div>
  );
}

export function isTypeStepValid(value: RoutineType | null): value is RoutineType {
  return value !== null;
}
