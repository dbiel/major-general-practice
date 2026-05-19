import { clampBpm } from "../lib/bpm";

type Props = {
  bpm: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
};

export function BpmControl({ bpm, min, max, onChange }: Props) {
  const adjust = (delta: number) => onChange(clampBpm(bpm + delta, min, max));
  const Btn = ({ delta, label }: { delta: number; label: string }) => (
    <button
      type="button"
      onClick={() => adjust(delta)}
      aria-label={label}
      className="rounded-xl bg-neutral-800 px-4 py-3 text-xl font-semibold"
    >
      {label}
    </button>
  );
  return (
    <div className="flex items-center justify-center gap-2">
      <Btn delta={-10} label="-10 BPM" />
      <Btn delta={-5} label="-5 BPM" />
      <div className="min-w-[5rem] text-center text-5xl font-bold">{bpm}</div>
      <Btn delta={+5} label="+5 BPM" />
      <Btn delta={+10} label="+10 BPM" />
    </div>
  );
}
