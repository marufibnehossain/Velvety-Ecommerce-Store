"use client";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
}

export default function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  className = "",
}: QuantityStepperProps) {
  return (
    <div
      className={`inline-flex items-center border border-border rounded-lg bg-bg ${className}`}
      role="group"
      aria-label="Quantity"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-10 h-10 flex items-center justify-center text-text hover:bg-sage-1 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-10 text-center font-sans text-sm font-medium text-text tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-10 h-10 flex items-center justify-center text-text hover:bg-sage-1 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
