import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Zap } from 'lucide-react';

interface InfoCardHeaderProps {
  title: string;
  description: string;
}

export default function InfoCardHeader({
  title,
  description,
}: InfoCardHeaderProps) {
  return (
    <CardHeader className="pb-3 pr-12">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg font-bold line-clamp-1 text-white">
            {title}
          </CardTitle>
          <CardDescription className="text-sm text-gray-200 mt-1 line-clamp-2">
            {description}
          </CardDescription>
        </div>
        <Zap className="h-5 w-5 shrink-0 text-blue-500" aria-hidden />
      </div>
    </CardHeader>
  );
}
