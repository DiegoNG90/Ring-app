'use client';

import { StatusDialog } from '@/components/ui/status-dialog';

export const CREATION_ERROR_TITLE = 'No pudimos crear tu rutina';
export const CREATION_ERROR_DESCRIPTION =
  'Ha ocurrido un error y no hemos podido crear tu rutina.';

interface CreationErrorDialogProps {
  open: boolean;
  detail?: string | null;
  onDismiss: () => void;
}

export function CreationErrorDialog({
  open,
  detail = null,
  onDismiss,
}: CreationErrorDialogProps) {
  return (
    <StatusDialog
      open={open}
      variant="error"
      title={CREATION_ERROR_TITLE}
      description={CREATION_ERROR_DESCRIPTION}
      detail={detail}
      actionLabel="Entendido"
      onAction={onDismiss}
      testId="creation-error-dialog"
    />
  );
}
