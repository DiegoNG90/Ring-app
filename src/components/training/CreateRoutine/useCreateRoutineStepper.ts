'use client';

import { useMemo, useReducer } from 'react';

import {
  buildCreateRoutinePayload,
  getDefaultDraftForType,
  getStepsForType,
  type CreateRoutineStepId,
} from '@/components/training/CreateRoutine/helpers';
import type { RoutineType } from '@/lib/routines/routine-types';

export interface CreateRoutineDraft {
  name: string;
  nameTouched: boolean;
  trainingType: RoutineType | null;
  segmentDuration: number | null;
  restDuration: number | null;
  rounds: number | null;
}

interface CreateRoutineStepperState {
  stepIndex: number;
  draft: CreateRoutineDraft;
}

const initialDraft: CreateRoutineDraft = {
  name: '',
  nameTouched: false,
  trainingType: null,
  segmentDuration: null,
  restDuration: null,
  rounds: null,
};

type CreateRoutineAction =
  | { type: 'SET_NAME'; value: string }
  | { type: 'TOUCH_NAME' }
  | { type: 'SET_TRAINING_TYPE'; value: RoutineType }
  | { type: 'SET_SEGMENT_DURATION'; value: number }
  | { type: 'SET_REST_DURATION'; value: number }
  | { type: 'SET_ROUNDS'; value: number }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'RESET' };

function createInitialState(): CreateRoutineStepperState {
  return {
    stepIndex: 0,
    draft: initialDraft,
  };
}

function reducer(
  state: CreateRoutineStepperState,
  action: CreateRoutineAction,
): CreateRoutineStepperState {
  switch (action.type) {
    case 'SET_NAME':
      return {
        ...state,
        draft: { ...state.draft, name: action.value },
      };
    case 'TOUCH_NAME':
      return {
        ...state,
        draft: { ...state.draft, nameTouched: true },
      };
    case 'SET_TRAINING_TYPE': {
      const defaults = getDefaultDraftForType(action.value);
      return {
        ...state,
        draft: {
          ...state.draft,
          trainingType: action.value,
          segmentDuration: defaults.segmentDuration,
          restDuration: defaults.restDuration,
          rounds: defaults.rounds,
        },
      };
    }
    case 'SET_SEGMENT_DURATION':
      return {
        ...state,
        draft: { ...state.draft, segmentDuration: action.value },
      };
    case 'SET_REST_DURATION':
      return {
        ...state,
        draft: { ...state.draft, restDuration: action.value },
      };
    case 'SET_ROUNDS':
      return {
        ...state,
        draft: { ...state.draft, rounds: action.value },
      };
    case 'NEXT':
      return {
        ...state,
        stepIndex: state.stepIndex + 1,
      };
    case 'BACK':
      return {
        ...state,
        stepIndex: Math.max(0, state.stepIndex - 1),
      };
    case 'RESET':
      return createInitialState();
    default:
      return state;
  }
}

export function useCreateRoutineStepper() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  const steps = useMemo(
    () => getStepsForType(state.draft.trainingType),
    [state.draft.trainingType],
  );

  const currentStep = steps[state.stepIndex] ?? 'name';
  const totalSteps = steps.length;
  const isFirstStep = state.stepIndex === 0;
  const isLastStep = currentStep === 'confirm';

  const payload = useMemo(() => {
    if (!state.draft.trainingType) {
      return null;
    }

    return buildCreateRoutinePayload({
      name: state.draft.name,
      trainingType: state.draft.trainingType,
      segmentDuration: state.draft.segmentDuration,
      restDuration: state.draft.restDuration,
      rounds: state.draft.rounds,
    });
  }, [state.draft]);

  return {
    state,
    dispatch,
    steps,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    payload,
    reset: () => dispatch({ type: 'RESET' }),
    goNext: () => dispatch({ type: 'NEXT' }),
    goBack: () => dispatch({ type: 'BACK' }),
  };
}

export type { CreateRoutineStepId };
