# Manual Test Checklist — Major-General Practice App

Run this checklist on the actual iPhone in the actual car (or simulated):

## First-time setup
- [ ] Visit hosting URL in iPhone Safari.
- [ ] Tap "Sign in with Google" → completes via Google popup.
- [ ] Land on `/setup`. Title "Modern Major-General" visible.
- [ ] Tap Share → Add to Home Screen. Confirm app installs.
- [ ] Open from home screen. Status bar correctly black, no browser chrome.

## Setup flow
- [ ] Tap couplet A. Tap couplet B. Both checked.
- [ ] Tap "Select all in Verse 1". All four couplets checked.
- [ ] Use BPM ±10 / ±5 buttons. BPM display updates. Clamped at 40 and 143.
- [ ] Reps stepper goes 3..7, clamped.
- [ ] "Start practice" disabled when zero chunks selected.

## Practice flow (parked, headphones)
- [ ] Tap "Start practice". 4-beat count-in clicks.
- [ ] First listen step: vocal plays (placeholder OK). Lyrics visible. Phase pill says LISTEN (yellow).
- [ ] Repeat step: only clicks audible. Pill says REPEAT (green). Same lyrics shown.
- [ ] Set 3 (AB): both couplets shown, lyrics auto-size smaller if needed.
- [ ] Tap ±10 BPM during practice. Visual flash on next step boundary; metronome pace changes.
- [ ] Pause: audio stops. Play: resumes from next step.
- [ ] Skip set: jumps to next set boundary. **Known v1 quirk:** skip may feel laggy because the in-flight step's timer doesn't cancel — audio goes silent immediately but the next set starts after the current step would have naturally ended. Acceptable for v1; can be tightened later.

## Driving conditions (Bluetooth)
- [ ] Bluetooth audio plays vocals + clicks to car speakers.
- [ ] Phone locked: audio continues if mediaSession is wired (Section 4 spec) — if not, screen stays on via wake lock.
- [ ] Adjust car volume separately from phone volume — both layers cooperate.

## PWA / offline
- [ ] Disable WiFi + cellular. Reload home-screen app. Cached content still loads.
- [ ] Practice screen works offline if audio file was cached (first visit must be online).

## Audio quality
- [ ] At 90 BPM (≈70% of 130): stretch artifacts acceptable.
- [ ] At 70 BPM: note if quality is too poor — if so, swap engine to Tone.js GrainPlayer.

## Known limitations (v1)
- 1×1 placeholder app icons (replace before sharing).
- Lock-screen media controls not wired (no `mediaSession` action handlers yet).
- React StrictMode in dev creates a transient extra `WebAudioEngine` that never initializes — harmless but visible in dev tools.
