import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QualInputs } from '@/lib/sweetspot/types';

type State = {
  currentIndex: number;
  qcmAnswers: Record<string, string>;
  qualAnswers: QualInputs;
  updatedAt?: number;
};

type SetIndex = number | ((prev: number) => number);
type Actions = {
  setCurrentIndex: (next: SetIndex) => void;
  setQcmAnswer: (questionId: string, optionId: string) => void;
  setQualAnswer: (field: keyof QualInputs, value: string) => void;
  reset: () => void;
};

const initialQual: QualInputs = {
  dimancheMatin: '',
  algoPersonnel: '',
  talentReconnu: '',
  indignationMax: '',
};

export const useSJTProgressStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      currentIndex: 0,
      qcmAnswers: {},
      qualAnswers: initialQual,
      updatedAt: undefined,

      setCurrentIndex: (next) =>
        set((s) => ({
          currentIndex:
            typeof next === 'function' ? (next as (p: number) => number)(s.currentIndex) : next,
          updatedAt: Date.now(),
        })),

      setQcmAnswer: (questionId, optionId) =>
        set((s) => ({
          qcmAnswers: { ...s.qcmAnswers, [questionId]: optionId },
          updatedAt: Date.now(),
        })),

      setQualAnswer: (field, value) =>
        set((s) => ({
          qualAnswers: { ...s.qualAnswers, [field]: value },
          updatedAt: Date.now(),
        })),

      reset: () =>
        set({
          currentIndex: 0,
          qcmAnswers: {},
          qualAnswers: initialQual,
          updatedAt: undefined,
        }),
    }),
    { name: 'sjt-progress-v1' },
  ),
);
