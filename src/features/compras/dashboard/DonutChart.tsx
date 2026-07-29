import { useMemo } from 'react';

export interface DonutSlice {
  label: string;
  value: number;
  /** Tailwind text color class for the legend dot, e.g. 'text-primary-500'. */
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  /** Center label (big) and subtitle (small). */
  centerLabel?: string;
  centerSub?: string;
  size?: number;
}

/**
 * Lightweight SVG donut chart. No external library — just a few arcs. Each
 * slice is drawn as a stroked circle segment so the chart stays crisp at any
 * size and respects the dark theme via currentColor.
 */
export function DonutChart({ slices, centerLabel, centerSub, size = 160 }: DonutChartProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const stroke = 18;

  const segments = useMemo(() => {
    if (total === 0) return [];
    let offset = 0;
    return slices.map((s) => {
      const fraction = s.value / total;
      const dash = fraction * circumference;
      const seg = { ...s, dash, gap: circumference - dash, offset: -offset };
      offset += dash;
      return seg;
    });
  }, [slices, total, circumference]);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          {/* Track */}
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-surface-100 dark:stroke-surface-800"
          />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx="70" cy="70" r={radius}
              fill="none"
              strokeWidth={stroke}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={seg.offset}
              strokeLinecap="round"
              className={seg.color}
              stroke="currentColor"
            />
          ))}
        </svg>
        {(centerLabel || centerSub) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerLabel && (
              <span className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
                {centerLabel}
              </span>
            )}
            {centerSub && (
              <span className="text-xs text-surface-500 dark:text-surface-400">
                {centerSub}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 sm:flex-col sm:justify-center">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${s.color}`} />
            <span className="text-surface-600 dark:text-surface-300">{s.label}</span>
            <span className="font-medium text-surface-900 dark:text-surface-100">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
