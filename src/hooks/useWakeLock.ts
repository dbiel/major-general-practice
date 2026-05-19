import { useEffect } from "react";

export function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        // Wake Lock API isn't supported everywhere — fail silently.
        const nav = navigator as unknown as { wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinel> } };
        if (!nav.wakeLock) return;
        lock = await nav.wakeLock.request("screen");
      } catch {
        // user hasn't interacted yet, or feature unsupported — ignore
      }
    };

    void acquire();

    const onVisibility = () => {
      if (document.visibilityState === "visible" && !lock && !cancelled) void acquire();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      lock?.release().catch(() => {});
    };
  }, []);
}

type WakeLockSentinel = { release: () => Promise<void> };
