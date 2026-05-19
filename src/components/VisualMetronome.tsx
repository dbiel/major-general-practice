import { useEffect, useState } from "react";

type Props = { engineBeatSubscribe: (cb: (downbeat: boolean) => void) => void };

export function VisualMetronome({ engineBeatSubscribe }: Props) {
  const [active, setActive] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    engineBeatSubscribe((d) => {
      setDown(d);
      setActive(true);
      const t = setTimeout(() => setActive(false), 80);
      return () => clearTimeout(t);
    });
  }, [engineBeatSubscribe]);

  const color = down ? "bg-red-500" : "bg-white";
  const opacity = active ? "opacity-100" : "opacity-20";
  return <div className={`fixed right-6 top-6 h-6 w-6 rounded-full ${color} ${opacity} transition-opacity`} />;
}
