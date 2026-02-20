'use client';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercent?: boolean;
  color?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md';
}

export default function ProgressBar({
  value,
  max,
  label,
  showPercent = true,
  color = 'primary',
  size = 'md',
}: ProgressBarProps) {
  const percent = Math.round((value / max) * 100);
  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
  };
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
  };

  return (
    <div>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs text-gray font-medium">{label}</span>}
          {showPercent && <span className="text-xs text-gray-light font-semibold">{percent}%</span>}
        </div>
      )}
      <div className={`w-full ${heightClasses[size]} bg-dark-lighter rounded-full overflow-hidden`}>
        <div
          className={`${heightClasses[size]} ${colorClasses[color]} rounded-full progress-bar`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
