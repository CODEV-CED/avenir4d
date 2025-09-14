'use client';
import { useState } from 'react';
import type { SJTQuestion, SJTResponse } from '@/types/sjt';
import { DIMENSION_COLORS } from '@/types/sjt';

interface QuestionCardProps {
  question: SJTQuestion;
  questionNumber: number;
  totalQuestions: number;
  onResponse: (response: SJTResponse) => void;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onResponse,
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(3);

  const handleSubmit = () => {
    if (!selectedOption) return;
    onResponse({ questionId: question.id, optionId: selectedOption, confidence });
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      {/* En-tête tags dimension */}
      <div className="mb-4 flex items-center gap-2">
        {question.dimensions.map((dim) => (
          <span
            key={dim}
            className={`rounded-full bg-${DIMENSION_COLORS[dim]}-100 px-2 py-1 text-xs text-${DIMENSION_COLORS[dim]}-700`}
          >
            {dim}
          </span>
        ))}
      </div>

      {/* Scénario */}
      <h3 className="mb-6 text-lg font-medium text-gray-900">{question.scenario}</h3>

      {/* Options */}
      <div className="mb-6 space-y-3">
        {question.options.map((option) => (
          <label
            key={option.id}
            data-testid={`sjt-option-${option.id}`}
            className={`block cursor-pointer rounded-lg border-2 p-4 transition-colors ${
              selectedOption === option.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              className="sr-only"
              type="radio"
              name={`question-${question.id}`}
              value={option.id}
              checked={selectedOption === option.id}
              onChange={(e) => setSelectedOption(e.target.value)}
            />
            <span className="text-gray-900">{option.text}</span>
          </label>
        ))}
      </div>

      {/* Confiance */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          À quel point es-tu sûr(e) de ton choix ?
        </label>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Pas sûr(e)</span>
          <input
            data-testid="sjt-confidence-slider"
            className="flex-1"
            type="range"
            min={1}
            max={5}
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
          />
          <span className="text-sm text-gray-500">Très sûr(e)</span>
        </div>
        <div className="mt-1 text-center">
          <span className="text-sm font-medium text-gray-900">{confidence}/5</span>
        </div>
      </div>

      {/* CTA */}
      <button
        data-testid="sjt-continue-btn"
        onClick={handleSubmit}
        disabled={!selectedOption}
        className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {questionNumber === totalQuestions ? 'Terminer' : 'Continuer'}
      </button>
    </div>
  );
}
