'use client';

import { useEffect, useRef } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/helpers/tailwind-styles';

export type StatusDialogVariant = 'success' | 'error';

interface StatusDialogProps {
  open: boolean;
  variant: StatusDialogVariant;
  title: string;
  description: string;
  detail?: string | null;
  actionLabel?: string;
  onAction?: () => void;
  dismissible?: boolean;
  testId?: string;
}

const VARIANT_STYLES: Record<
  StatusDialogVariant,
  { icon: typeof CheckCircle2; iconClass: string; ringClass: string }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-400',
    ringClass: 'bg-emerald-500/10 border-emerald-500/40',
  },
  error: {
    icon: XCircle,
    iconClass: 'text-red-400',
    ringClass: 'bg-red-500/10 border-red-500/40',
  },
};

export function StatusDialog({
  open,
  variant,
  title,
  description,
  detail = null,
  actionLabel,
  onAction,
  dismissible = true,
  testId = 'status-dialog',
}: StatusDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { icon: Icon, iconClass, ringClass } = VARIANT_STYLES[variant];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      data-testid={testId}
      data-variant={variant}
      aria-labelledby="status-dialog-title"
      aria-describedby="status-dialog-description"
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible && onAction) {
          onAction();
        }
      }}
      className={cn(
        'fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2',
        'rounded-2xl border border-zinc-700 bg-zinc-900 p-6 text-zinc-100 shadow-xl',
        'backdrop:bg-black/70 open:backdrop:backdrop-blur-[2px]',
      )}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <span
          data-testid={`status-dialog-icon-${variant}`}
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full border',
            ringClass,
          )}
        >
          <Icon className={cn('h-9 w-9', iconClass)} aria-hidden="true" />
        </span>

        <div className="space-y-2">
          <h2
            id="status-dialog-title"
            className="text-lg font-semibold text-zinc-100"
          >
            {title}
          </h2>
          <p id="status-dialog-description" className="text-sm text-zinc-300">
            {description}
          </p>
          {detail && (
            <p className="text-sm text-zinc-400" role="note">
              {detail}
            </p>
          )}
        </div>

        {actionLabel && onAction && (
          <Button
            type="button"
            className="w-full bg-zinc-100 text-zinc-900 hover:bg-white sm:w-auto"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </dialog>
  );
}
