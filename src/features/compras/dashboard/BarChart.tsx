export interface BarDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarDatum[];
  /** Tailwind text color class used for the bars, e.g. 'text-primary-500'. */
  color?: string;
  /** Max value for the axis; auto-derived when omitted. */
  max?: number;
  /** Optional value formatter (e.g. currency). Defaults to the raw number. */
  formatValue?: (value: number) => string;
}

/**
 * Lightweight horizontal bar chart. No external library — just flexbox bars
 * whose width is a percentage of the max. The bars use currentColor so they
 * theme correctly in dark mode.
 */
export function BarChart({ data, color = 'text-primary-500', max, formatValue }: BarChartProps) {
  const maxValue = max ?? Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-surface-400 dark:text-surface-500">
        Sem dados para exibir.
      </p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {data.map((d) => {
        const pct = Math.round((d.value / maxValue) * 100);
        return (
          <li key={d.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="truncate pr-2 text-surface-600 dark:text-surface-300">
                {d.label}
              </span>
              <span className="font-medium text-surface-900 dark:text-surface-100">
                {formatValue ? formatValue(d.value) : d.value}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
              <div
                className={`h-full rounded-full ${color} bg-current transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
