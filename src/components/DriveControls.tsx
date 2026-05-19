import { BpmControl } from "./BpmControl";

type Props = {
  bpm: number;
  bpmMin: number;
  bpmMax: number;
  paused: boolean;
  onBpmChange: (n: number) => void;
  onTogglePause: () => void;
  onSkipSet: () => void;
};

export function DriveControls({ bpm, bpmMin, bpmMax, paused, onBpmChange, onTogglePause, onSkipSet }: Props) {
  return (
    <div className="space-y-3">
      <BpmControl bpm={bpm} min={bpmMin} max={bpmMax} onChange={onBpmChange} />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onTogglePause}
          className="flex-1 rounded-2xl bg-neutral-800 py-5 text-2xl font-bold"
        >
          {paused ? "Play" : "Pause"}
        </button>
        <button
          type="button"
          onClick={onSkipSet}
          className="flex-1 rounded-2xl bg-neutral-800 py-5 text-2xl font-bold"
        >
          Skip set
        </button>
      </div>
    </div>
  );
}
