export interface InfoCardTraining {
  training_id: number;
  training_title: string;
  training_description: string;
  round_id: number;
  round_number: number;
  duration_seconds: number;
  rest_seconds: number;
  repetitions: number;
}

export interface InfoCardProps {
  result: InfoCardTraining;
  lastUsed?: string;
  timesUsed?: number;
}
