'use client';

import { ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/helpers/tailwind-styles';

interface StepperHeaderProps {
  currentStepNumber: number;
  totalSteps: number;
  title: string;
  onBack?: () => void;
  showBack: boolean;
}

export function StepperHeader({
  currentStepNumber,
  totalSteps,
  title,
  onBack,
  showBack,
}: StepperHeaderProps) {
  return (
    <div className="mb-6 space-y-3">
      <div
        className={cn(
          'flex items-center gap-3',
          showBack && onBack && 'justify-between',
        )}
      >
        {showBack && onBack ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2 px-2 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
            onClick={onBack}
          >
            <ChevronLeft className="size-4 shrink-0" aria-hidden="true" />
            Volver
          </Button>
        ) : null}
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-400">
          Paso {currentStepNumber} de {totalSteps}
        </p>
      </div>
      <h3 className="text-xl font-semibold text-zinc-100">{title}</h3>
    </div>
  );
}
