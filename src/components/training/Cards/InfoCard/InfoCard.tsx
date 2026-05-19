'use client';

import { type JSX } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RotateCcw, Calendar, Zap } from 'lucide-react';
import Link from 'next/link';
import { replaceBlankSpaceForHypen } from '@/lib/utils/strings';

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
  const parsedTrainingTitle = replaceBlankSpaceForHypen(result.training_title);
  const trainingHref = `/training/${parsedTrainingTitle}-${result.training_id}`;

  return (
    <Card className="relative w-full min-w-[360px] max-w-sm mx-auto border-l-4 border-l-blue-500 bg-zinc-950/80 hover:shadow-md transition-shadow duration-200">
      <Link href={trainingHref} className="block cursor-pointer">
        <CardHeader className="pb-3">
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
  );
}

export default InfoCard;
