/**
 * Generates a short percussive click buffer.
 * downbeat=true → higher pitch + slightly louder.
 */
export function makeClickBuffer(ctx: AudioContext, downbeat: boolean): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const durationSec = 0.05;
  const length = Math.floor(sampleRate * durationSec);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  const freq = downbeat ? 1500 : 1000;
  const amp = downbeat ? 0.9 : 0.6;
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-30 * t); // exponential decay
    data[i] = amp * env * Math.sin(2 * Math.PI * freq * t);
  }
  return buffer;
}
