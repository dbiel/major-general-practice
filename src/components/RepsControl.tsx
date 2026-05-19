type Props = {
  reps: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
};

export function RepsControl({ reps, min = 3, max = 7, onChange }: Props) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        aria-label="-1 rep"
        disabled={reps <= min}
        onClick={() => onChange(reps - 1)}
        className="rounded-xl bg-neutral-800 px-4 py-3 text-xl disabled:opacity-40"
      >
        −
      </button>
      <div className="text-3xl font-bold">{reps} reps</div>
      <button
        type="button"
        aria-label="+1 rep"
        disabled={reps >= max}
        onClick={() => onChange(reps + 1)}
        className="rounded-xl bg-neutral-800 px-4 py-3 text-xl disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
