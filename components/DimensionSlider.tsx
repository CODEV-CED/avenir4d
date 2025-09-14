// components/DimensionSlider.tsx

type DimensionSliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  pulse?: boolean;
};

const DimensionSlider = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  pulse = false,
}: DimensionSliderProps) => (
  <div className={`mb-4 ${pulse ? 'ny-pulse' : ''}`}>
    <label className="mb-1 block font-medium">
      {label}: {Math.round(value * 100)}%
    </label>
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

export default DimensionSlider;
