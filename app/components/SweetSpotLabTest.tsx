// components/SweetSpotLabStep.tsx
import { useEffect } from 'react';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';
import type { Dimension } from '@/store/useSweetSpotStore';
import DimensionSlider from '@/components/DimensionSlider';

const SweetSpotLabStep = () => {
  const {
    convergences,
    sweetSpotScore,
    isLoading,
    sliderValues,
    setSliderValue,
    fetchConvergences,
  } = useSweetSpotStore();

  useEffect(() => {
    fetchConvergences(); // calcul initial
  }, []);

  const isEureka = sweetSpotScore > 0.7;

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-bold">🎯 Votre Sweet Spot Lab</h2>

      <div className="mb-6 rounded bg-gray-100 p-4">
        <h3 className="mb-3 font-semibold">🧭 Ajustez vos priorités :</h3>
        {(['passions', 'talents', 'utilite', 'viabilite'] as Dimension[]).map((key) => (
          <DimensionSlider
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            value={sliderValues[key]}
            onChange={(val: number) => setSliderValue(key, val)}
            min={key === 'viabilite' ? 0.15 : 0}
          />
        ))}
      </div>

      {isLoading ? (
        <p>🔄 Analyse en cours...</p>
      ) : (
        <div className="mt-4">
          <h3 className="font-semibold">🔎 Convergences détectées :</h3>
          <ul className="mt-2 list-disc pl-6">
            {convergences.map((c, i) => (
              <li key={i}>
                <strong>{c.keyword}</strong> (Présent dans : {c.matchedDimensions.join(', ')}) –
                Score {Math.round(c.strength * 100)}%
              </li>
            ))}
          </ul>

          <div className="mt-4 text-lg">
            ✅ <strong>Sweet Spot Score :</strong> {Math.round(sweetSpotScore * 100)}%
          </div>

          {isEureka && (
            <div className="mt-4 animate-pulse rounded bg-yellow-100 p-4 text-center">
              ✨ <strong>Moment Eureka :</strong> vous avez une convergence puissante !
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SweetSpotLabStep;
