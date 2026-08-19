'use client';

import { StatusDialog } from '@/components/ui/status-dialog';

export const CREATION_SUCCESS_TITLE = '¡Tu rutina ha sido creada!';
export const CREATION_SUCCESS_DESCRIPTION =
  'La estamos preparando y en breve te llevaremos allí.';

interface CreationSuccessDialogProps {
  open: boolean;
}

export function CreationSuccessDialog({ open }: CreationSuccessDialogProps) {
  return (
    <StatusDialog
      open={open}
      variant="success"
      title={CREATION_SUCCESS_TITLE}
      description={CREATION_SUCCESS_DESCRIPTION}
      dismissible={false}
      testId="creation-success-dialog"
    />
  );
}
