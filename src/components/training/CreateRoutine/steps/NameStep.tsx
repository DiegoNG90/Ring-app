'use client';

import { validateRoutineNameField } from '@/lib/validation/routine-schema';

interface NameStepProps {
  value: string;
  touched: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export function NameStep({ value, touched, onChange, onBlur }: NameStepProps) {
  const error = touched ? validateRoutineNameField(value) : null;

  return (
    <div className="space-y-3">
      <label htmlFor="routine-name" className="sr-only">
        Nombre de la rutina
      </label>
      <input
        id="routine-name"
        name="routine-name"
        type="text"
        value={value}
        maxLength={80}
        autoComplete="off"
        aria-describedby={error ? 'routine-name-error' : undefined}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-base text-zinc-100 outline-none ring-teal-500 focus:border-teal-400 focus:ring-2"
        placeholder="Ej: Rutina matutina"
      />
      {error && (
        <p id="routine-name-error" className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function isNameStepValid(value: string): boolean {
  return validateRoutineNameField(value) === null;
}
