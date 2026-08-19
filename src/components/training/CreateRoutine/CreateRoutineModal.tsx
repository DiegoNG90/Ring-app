'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createRoutineAction } from '@/actions/training-actions';
import {
  getStepTitle,
  SUCCESS_REDIRECT_DELAY_MS,
} from '@/components/training/CreateRoutine/helpers';
import { CreationErrorDialog } from '@/components/training/CreateRoutine/components/CreationErrorDialog';
import { CreationSuccessDialog } from '@/components/training/CreateRoutine/components/CreationSuccessDialog';
import { StepperHeader } from '@/components/training/CreateRoutine/components/StepperHeader';
import { ConfirmStep } from '@/components/training/CreateRoutine/steps/ConfirmStep';
import {
  isNameStepValid,
  NameStep,
} from '@/components/training/CreateRoutine/steps/NameStep';
import {
  isRestStepValid,
  RestStep,
} from '@/components/training/CreateRoutine/steps/RestStep';
import {
  isRoundsStepValid,
  RoundsStep,
} from '@/components/training/CreateRoutine/steps/RoundsStep';
import {
  isSegmentDurationStepValid,
  SegmentDurationStep,
} from '@/components/training/CreateRoutine/steps/SegmentDurationStep';
import {
  isTypeStepValid,
  TypeStep,
} from '@/components/training/CreateRoutine/steps/TypeStep';
import { useCreateRoutineStepper } from '@/components/training/CreateRoutine/useCreateRoutineStepper';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Modal } from '@/components/ui/modal';
import { createRoutineSchema } from '@/lib/validation/routine-schema';

interface CreateRoutineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRoutineModal({
  open,
  onOpenChange,
}: CreateRoutineModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const {
    state,
    dispatch,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    payload,
    reset,
    goNext,
    goBack,
  } = useCreateRoutineStepper();

  useEffect(() => {
    if (!pendingHref) {
      return;
    }

    const timer = setTimeout(() => {
      router.push(pendingHref);
    }, SUCCESS_REDIRECT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [pendingHref, router]);

  const closeModal = () => {
    onOpenChange(false);
    reset();
    setSubmitError(null);
    setShowDiscardConfirm(false);
  };

  const requestClose = () => {
    const hasDraft =
      state.draft.name.trim().length > 0 || state.draft.trainingType !== null;

    if (hasDraft) {
      setShowDiscardConfirm(true);
      return;
    }

    closeModal();
  };

  const handleDiscardConfirm = () => {
    setShowDiscardConfirm(false);
    closeModal();
  };

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 'name':
        return isNameStepValid(state.draft.name);
      case 'type':
        return isTypeStepValid(state.draft.trainingType);
      case 'segmentDuration':
        return (
          state.draft.trainingType !== null &&
          isSegmentDurationStepValid(state.draft.segmentDuration)
        );
      case 'restDuration':
        return (
          state.draft.trainingType !== null &&
          isRestStepValid(state.draft.restDuration)
        );
      case 'rounds':
        return (
          state.draft.trainingType !== null &&
          isRoundsStepValid(state.draft.rounds)
        );
      case 'confirm':
        return payload !== null && createRoutineSchema.safeParse(payload).success;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 'name') {
      dispatch({ type: 'TOUCH_NAME' });
      if (!isNameStepValid(state.draft.name)) {
        return;
      }
    }

    if (!isCurrentStepValid()) {
      return;
    }

    setSubmitError(null);
    goNext();
  };

  const handleSubmit = () => {
    if (!payload) {
      return;
    }

    setSubmitError(null);

    startTransition(async () => {
      const result = await createRoutineAction(payload);

      if (!result.success) {
        const detail =
          result.fieldErrors?.name ??
          result.fieldErrors?.trainingType ??
          result.error ??
          null;

        setSubmitError(detail);
        setShowErrorDialog(true);
        return;
      }

      onOpenChange(false);
      reset();
      setPendingHref(result.href);
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'name':
        return (
          <NameStep
            value={state.draft.name}
            touched={state.draft.nameTouched}
            onChange={(value) => dispatch({ type: 'SET_NAME', value })}
            onBlur={() => dispatch({ type: 'TOUCH_NAME' })}
          />
        );
      case 'type':
        return (
          <TypeStep
            value={state.draft.trainingType}
            onChange={(value) => dispatch({ type: 'SET_TRAINING_TYPE', value })}
          />
        );
      case 'segmentDuration':
        return state.draft.trainingType ? (
          <SegmentDurationStep
            trainingType={state.draft.trainingType}
            value={state.draft.segmentDuration}
            onChange={(value) =>
              dispatch({ type: 'SET_SEGMENT_DURATION', value })
            }
          />
        ) : null;
      case 'restDuration':
        return state.draft.trainingType ? (
          <RestStep
            trainingType={state.draft.trainingType}
            value={state.draft.restDuration}
            onChange={(value) => dispatch({ type: 'SET_REST_DURATION', value })}
          />
        ) : null;
      case 'rounds':
        return state.draft.trainingType ? (
          <RoundsStep
            trainingType={state.draft.trainingType}
            value={state.draft.rounds}
            onChange={(value) => dispatch({ type: 'SET_ROUNDS', value })}
          />
        ) : null;
      case 'confirm':
        return payload ? <ConfirmStep payload={payload} /> : null;
      default:
        return null;
    }
  };

  return (
    <>
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title="Nueva rutina"
        description="Completá los pasos para crear tu rutina personalizada."
        onRequestClose={requestClose}
      >
        <StepperHeader
          currentStepNumber={state.stepIndex + 1}
          totalSteps={totalSteps}
          title={getStepTitle(currentStep)}
          showBack={!isFirstStep && !isPending}
          onBack={goBack}
        />

        {renderStep()}

        {submitError && (
          <p className="mt-4 text-sm text-red-400" role="alert">
            {submitError}
          </p>
        )}

        <div className="sticky bottom-0 mt-6 flex flex-col gap-2 border-t border-zinc-800 bg-zinc-900 pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="border-zinc-600 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:text-zinc-50"
            onClick={requestClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          {isLastStep ? (
            <Button
              type="button"
              className="bg-teal-500 text-white hover:bg-teal-400"
              onClick={handleSubmit}
              disabled={isPending || !payload}
            >
              {isPending ? 'Guardando…' : 'Guardar rutina'}
            </Button>
          ) : (
            <Button
              type="button"
              className="bg-teal-500 text-white hover:bg-teal-400"
              onClick={handleNext}
              disabled={!isCurrentStepValid()}
            >
              Siguiente
            </Button>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
        title="¿Descartar la rutina?"
        description="Si cancelás ahora, se perderán los datos ingresados."
        confirmLabel="Descartar"
        cancelLabel="Seguir editando"
        onConfirm={handleDiscardConfirm}
      />

      <CreationSuccessDialog open={pendingHref !== null} />

      <CreationErrorDialog
        open={showErrorDialog}
        detail={submitError}
        onDismiss={() => setShowErrorDialog(false)}
      />
    </>
  );
}
