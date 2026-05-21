import type { MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface InfoCardDeleteButtonProps {
  trainingTitle: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

export default function InfoCardDeleteButton({
  trainingTitle,
  onClick,
}: InfoCardDeleteButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`Eliminar rutina ${trainingTitle}`}
      className="absolute top-2 right-2 z-10 size-8 text-zinc-400 hover:text-red-400 hover:bg-red-950/40"
      onClick={onClick}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
