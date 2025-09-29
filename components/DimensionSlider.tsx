// components/DimensionSlider.tsx
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/UI/tooltip';
import { GAP } from '@/store/sliderConstraints';

type DimensionSliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  pulse?: boolean;
  bulletColorClass?: string; // tailwind bg-* class for the bullet
};

const DimensionSlider = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  pulse = false,
  bulletColorClass,
}: DimensionSliderProps) => {
  const gapPercent = Math.round(GAP * 100);
  const minPercent = Math.round(min * 100);
  const hint = `Ajustez ${label}. Écart max ${gapPercent} points avec les autres${min > 0 ? ` · Min ${minPercent}%` : ''}.`;

  return (
    <div className={`mb-4 ${pulse ? 'ny-pulse' : ''}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <label className="mb-1 block cursor-help font-medium">
            {bulletColorClass && (
              <span
                className={`mr-2 inline-block h-2 w-2 rounded-full align-middle ${bulletColorClass}`}
              />
            )}
            {label}: {Math.round(value * 100)}%
          </label>
        </TooltipTrigger>
        <TooltipContent>{hint}</TooltipContent>
      </Tooltip>
      <input
        type="range"
        min={min}
        max={max}
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
};

export default DimensionSlider;
