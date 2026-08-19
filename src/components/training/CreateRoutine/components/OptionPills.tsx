'use client';

import { cn } from '@/lib/helpers/tailwind-styles';

interface OptionPillsProps<T extends string | number> {
  label: string;
  options: readonly T[];
  value: T | null;
  onChange: (value: T) => void;
  formatOption?: (value: T) => string;
  name: string;
}

export function OptionPills<T extends string | number>({
  label,
  options,
  value,
  onChange,
  formatOption = (option) => String(option),
  name,
}: OptionPillsProps<T>) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-200">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => {
          const selected = value === option;
          const optionId = `${name}-${option}`;

          return (
            <button
              key={optionId}
              id={optionId}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option)}
              className={cn(
                'min-h-11 min-w-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                selected
                  ? 'border-teal-400 bg-teal-500 text-white'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-700',
              )}
            >
              {formatOption(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
