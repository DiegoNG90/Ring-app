'use client';

import { useState, useTransition, type MouseEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteTrainingAction } from '@/actions/training-actions';
import InfoCardDeleteButton from './components/InfoCardDeleteButton/InfoCardDeleteButton';
import InfoCardHeader from './components/InfoCardHeader/InfoCardHeader';
import InfoCardStats from './components/InfoCardStats/InfoCardStats';
import InfoCardUsageMeta from './components/InfoCardUsageMeta/InfoCardUsageMeta';
import { getTrainingHref } from './helpers';
import type { InfoCardProps } from './interfaces';

export default function InfoCard({
  result,
  lastUsed = '2024-01-15',
  timesUsed = 12,
}: InfoCardProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const trainingHref = getTrainingHref(
    result.training_id,
    result.training_title,
  );

  const handleDeleteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setError(null);
    setDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    startTransition(async () => {
      const response = await deleteTrainingAction(result.training_id);

      if (!response.success) {
        setError(response.error ?? 'No se pudo eliminar la rutina');
        return;
      }

      setDialogOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <Card className="relative w-full min-w-[360px] max-w-sm mx-auto border-l-4 border-l-blue-500 bg-zinc-950/80 hover:shadow-md transition-shadow duration-200">
        <InfoCardDeleteButton
          trainingTitle={result.training_title}
          onClick={handleDeleteClick}
        />

        <Link href={trainingHref} className="block cursor-pointer">
          <InfoCardHeader
            title={result.training_title}
            description={result.training_description}
          />

          <CardContent className="pt-0">
            <InfoCardStats
              roundNumber={result.round_number}
              durationSeconds={result.duration_seconds}
            />
            <InfoCardUsageMeta timesUsed={timesUsed} lastUsed={lastUsed} />
          </CardContent>
        </Link>
      </Card>

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setError(null);
        }}
        title="¿Eliminar rutina?"
        description={`Se eliminará "${result.training_title}" y todos sus rounds. Esta acción no se puede deshacer.`}
        error={error}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        isLoading={isPending}
      />
    </>
  );
}

export type { InfoCardProps } from './interfaces';
