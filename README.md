# Major-General Practice

PWA for memorizing "I Am the Very Model of a Modern Major-General" via a cumulative-snowball drill paced by a metronome.

## Stack
React + Vite + TypeScript + Tailwind, Web Audio + SoundTouchJS, Firebase (Auth + Firestore + Hosting), `vite-plugin-pwa`.

## Dev
```bash
cp .env.example .env.local   # fill with your Firebase web config
npm install
npm run dev
```
The chunk-marker tool is at `/marker` in dev mode.

## Build + Deploy
```bash
npm run build
firebase deploy
```

Before first deploy, replace `REPLACE_WITH_FIREBASE_PROJECT_ID` in `.firebaserc` with your Firebase project ID.

## Test
```bash
npm run test           # unit + component (vitest)
npm run test:e2e       # playwright happy path
```

## Spec
Design: `docs/superpowers/specs/2026-05-19-major-general-practice-app-design.md` (in parent docs tree).
Plan: `docs/superpowers/plans/2026-05-19-major-general-practice-app.md` (in parent docs tree).

## Manual test plan
See `docs/manual-test-checklist.md`.
