export interface FilterOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface FilterBarProps<T extends string> {
  options: FilterOption<T>[];
  active: T;
  onChange: (value: T) => void;
}

export function FilterBar<T extends string>({ options, active, onChange }: FilterBarProps<T>) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {options.map((opt) => {
        const isActive = opt.value === active;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo/40 ${
              isActive ? 'bg-indigo text-white' : 'bg-surface-2 text-ink-muted hover:text-ink border border-border-soft'
            }`}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className={isActive ? 'text-white/80' : 'text-ink-faint'}>{opt.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
