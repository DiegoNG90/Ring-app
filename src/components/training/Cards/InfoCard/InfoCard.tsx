'use client';

import { useState, useTransition, type JSX, type MouseEvent } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RotateCcw, Calendar, Zap, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { replaceBlankSpaceForHypen } from '@/lib/utils/strings';
import { deleteTrainingAction } from '@/actions/training-actions';

interface InfoCardProps {
  result: {
    training_id: number;
    training_title: string;
    training_description: string;
    round_id: number;
    round_number: number;
    duration_seconds: number;
    rest_seconds: number;
    repetitions: number;
  };
  lastUsed?: string;
  timesUsed?: number;
}

function InfoCard({
  result,
  lastUsed = '2024-01-15',
  timesUsed = 12,
}: InfoCardProps): JSX.Element {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const parsedTrainingTitle = replaceBlankSpaceForHypen(result.training_title);
  const trainingHref = `/training/${parsedTrainingTitle}-${result.training_id}`;

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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Eliminar rutina ${result.training_title}`}
          className="absolute top-2 right-2 z-10 size-8 text-zinc-400 hover:text-red-400 hover:bg-red-950/40"
          onClick={handleDeleteClick}
        >
          <Trash2 className="size-4" />
        </Button>

        <Link href={trainingHref} className="block cursor-pointer">
          <CardHeader className="pb-3 pr-12">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-bold line-clamp-1 text-white">
                  {result.training_title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-200 mt-1 line-clamp-2">
                  {result.training_description}
                </CardDescription>
              </div>
              <Zap className="h-5 w-5 shrink-0 text-blue-500" aria-hidden />
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Rounds</span>
                <span className="font-medium text-zinc-100">
                  {result.round_number}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Duración</span>
                <span className="font-medium text-zinc-100">
                  {Math.floor(result.duration_seconds / 60)}:
                  {(result.duration_seconds % 60).toString().padStart(2, '0')}
                </span>
              </div>

              <div className="pt-2 border-t border-zinc-700/60">
                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <div className="flex items-center gap-1">
                    <RotateCcw className="h-3 w-3" aria-hidden />
                    <span>Usado {timesUsed} veces</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" aria-hidden />
                    <span>{new Date(lastUsed).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
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

export default InfoCard;
