'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import { cn } from '@/lib/helpers/tailwind-styles';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  onRequestClose?: () => void;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  onRequestClose,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = () => {
    if (onRequestClose) {
      onRequestClose();
      return;
    }

    onOpenChange(false);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
      onClose={() => onOpenChange(false)}
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
      className={cn(
        'fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-zinc-900 p-0 text-zinc-100 shadow-xl',
        'backdrop:bg-black/70 open:backdrop:backdrop-blur-[2px]',
        'sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[90vh] sm:w-[calc(100%-2rem)] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-zinc-700',
        className,
      )}
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-zinc-800 px-4 py-4 sm:px-6">
          <h2 id="modal-title" className="text-lg font-semibold text-zinc-100">
            {title}
          </h2>
          {description && (
            <p id="modal-description" className="mt-1 text-sm text-zinc-400">
              {description}
            </p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">{children}</div>
      </div>
    </dialog>
  );
}
