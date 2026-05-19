import type { Phase } from "../controller/session";

export function PhasePill({ phase }: { phase: Phase }) {
  const colors = phase === "listen" ? "bg-yellow-500 text-black" : "bg-green-500 text-black";
  return (
    <span className={`rounded-full px-4 py-1 text-lg font-bold uppercase ${colors}`}>
      {phase}
    </span>
  );
}
