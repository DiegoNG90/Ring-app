import { z } from 'zod';

import { ROUTINE_TYPE_DEFINITIONS } from '@/lib/routines/routine-types';

const CONTROL_CHARS_REGEX = /\p{C}/u;
const ZERO_WIDTH_REGEX = /[\u200B-\u200D\uFEFF\u2060\u202A-\u202E\u061C]/u;
const ROUTINE_NAME_REGEX = /^[\p{L}\p{N}][\p{L}\p{N} :-]*[\p{L}\p{N}]$/u;

export const ROUTINE_NAME_ERRORS = {
  required: 'El nombre es obligatorio',
  min: 'El nombre debe tener al menos 3 caracteres',
  max: 'El nombre no puede superar los 80 caracteres',
  invalidChars:
    'Solo se permiten letras, números, espacios, guiones (-) y dos puntos (:)',
  doubleSpace: 'Solo se permite un espacio entre palabras',
} as const;

export function normalizeRoutineName(raw: string): string {
  return raw
    .normalize('NFC')
    .replace(CONTROL_CHARS_REGEX, '')
    .replace(ZERO_WIDTH_REGEX, '')
    .trim()
    .replace(/\s+/g, ' ');
}

function validateRoutineName(value: string, ctx: z.RefinementCtx): string {
  const normalized = normalizeRoutineName(value);

  if (!normalized) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: ROUTINE_NAME_ERRORS.required,
    });
    return normalized;
  }

  if (normalized.length < 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: ROUTINE_NAME_ERRORS.min,
    });
  }

  if (normalized.length > 80) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: ROUTINE_NAME_ERRORS.max,
    });
  }

  if (/\s{2,}/.test(value.replace(CONTROL_CHARS_REGEX, '').replace(ZERO_WIDTH_REGEX, ''))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: ROUTINE_NAME_ERRORS.doubleSpace,
    });
  }

  if (!ROUTINE_NAME_REGEX.test(normalized)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: ROUTINE_NAME_ERRORS.invalidChars,
    });
  }

  return normalized;
}

export const routineNameSchema = z
  .string()
  .superRefine((value, ctx) => {
    validateRoutineName(value, ctx);
  })
  .transform((value) => normalizeRoutineName(value));

function literalUnion<T extends readonly number[]>(
  values: T,
  message: string,
) {
  return z.union(
    values.map((value) => z.literal(value)) as [
      z.ZodLiteral<T[number]>,
      z.ZodLiteral<T[number]>,
      ...z.ZodLiteral<T[number]>[],
    ],
    { errorMap: () => ({ message }) },
  );
}

const hiitDefinition = ROUTINE_TYPE_DEFINITIONS.HIIT;
const hiitExtendedDefinition = ROUTINE_TYPE_DEFINITIONS.HIIT_EXTENDED;
const sparring2Definition = ROUTINE_TYPE_DEFINITIONS.SPARRING_2;
const sparring3Definition = ROUTINE_TYPE_DEFINITIONS.SPARRING_3;

export const createRoutineSchema = z.discriminatedUnion('trainingType', [
  z.object({
    name: routineNameSchema,
    trainingType: z.literal('HIIT'),
    segmentDuration: literalUnion(
      hiitDefinition.segmentDurationOptions!,
      'Duración de segmento inválida',
    ),
    restDuration: literalUnion(
      hiitDefinition.restDurationOptions!,
      'Duración de descanso inválida',
    ),
    rounds: literalUnion(hiitDefinition.roundsOptions, 'Cantidad de rounds inválida'),
  }),
  z.object({
    name: routineNameSchema,
    trainingType: z.literal('HIIT_EXTENDED'),
    segmentDuration: literalUnion(
      hiitExtendedDefinition.segmentDurationOptions!,
      'Duración de segmento inválida',
    ),
    restDuration: literalUnion(
      hiitExtendedDefinition.restDurationOptions!,
      'Duración de descanso inválida',
    ),
    rounds: literalUnion(
      hiitExtendedDefinition.roundsOptions,
      'Cantidad de rounds inválida',
    ),
  }),
  z.object({
    name: routineNameSchema,
    trainingType: z.literal('SPARRING_2'),
    rounds: literalUnion(
      sparring2Definition.roundsOptions,
      'Cantidad de rounds inválida',
    ),
  }),
  z.object({
    name: routineNameSchema,
    trainingType: z.literal('SPARRING_3'),
    rounds: literalUnion(
      sparring3Definition.roundsOptions,
      'Cantidad de rounds inválida',
    ),
  }),
]);

export type CreateRoutineInput = z.infer<typeof createRoutineSchema>;

export function validateRoutineNameField(value: string): string | null {
  const result = routineNameSchema.safeParse(value);
  if (result.success) {
    return null;
  }

  return result.error.issues[0]?.message ?? ROUTINE_NAME_ERRORS.invalidChars;
}
