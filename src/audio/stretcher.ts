import { SimpleFilter, SoundTouch, WebAudioBufferSource } from "soundtouchjs";

/**
 * Wraps a decoded AudioBuffer in a SoundTouchJS pipeline so we can play
 * arbitrary [startSec, endSec] slices at a target tempo with pitch preserved.
 *
 * Usage:
 *   const stretcher = new VocalStretcher(ctx, buffer);
 *   stretcher.setStretchRatio(targetBpm / originalBpm);
 *   stretcher.scheduleSegment(ctx.currentTime + 0.1, startSec, endSec);
 */
export class VocalStretcher {
  private readonly ctx: AudioContext;
  private readonly buffer: AudioBuffer;
  private ratio = 1;
  private current?: AudioBufferSourceNode;

  constructor(ctx: AudioContext, buffer: AudioBuffer) {
    this.ctx = ctx;
    this.buffer = buffer;
  }

  setStretchRatio(ratio: number) {
    // ratio > 1 → faster than original; < 1 → slower
    this.ratio = ratio;
  }

  /**
   * Renders the slice [startSec, endSec] of the source buffer at the current
   * stretch ratio into a new AudioBuffer, then schedules it to start at `whenSec`.
   * Returns approximate output duration in seconds.
   */
  scheduleSegment(whenSec: number, startSec: number, endSec: number): number {
    const sliceBuf = sliceAudioBuffer(this.ctx, this.buffer, startSec, endSec);
    const rendered = stretchBuffer(this.ctx, sliceBuf, this.ratio);
    const src = this.ctx.createBufferSource();
    src.buffer = rendered;
    src.connect(this.ctx.destination);
    src.start(whenSec);
    this.current = src;
    return rendered.duration;
  }

  stop() {
    try { this.current?.stop(); } catch { /* already stopped */ }
    this.current = undefined;
  }
}

function sliceAudioBuffer(ctx: AudioContext, src: AudioBuffer, startSec: number, endSec: number): AudioBuffer {
  const sr = src.sampleRate;
  const startFrame = Math.floor(startSec * sr);
  const endFrame = Math.min(Math.floor(endSec * sr), src.length);
  const length = endFrame - startFrame;
  const out = ctx.createBuffer(src.numberOfChannels, length, sr);
  for (let ch = 0; ch < src.numberOfChannels; ch++) {
    const input = src.getChannelData(ch);
    const output = out.getChannelData(ch);
    for (let i = 0; i < length; i++) output[i] = input[startFrame + i];
  }
  return out;
}

function stretchBuffer(ctx: AudioContext, src: AudioBuffer, ratio: number): AudioBuffer {
  // 1 / ratio because SoundTouch's "tempo" 2.0 means "play 2x as fast",
  // which corresponds to outputDuration = inputDuration / 2.
  const st = new SoundTouch();
  st.tempo = 1 / ratio;
  const source = new WebAudioBufferSource(src);
  const filter = new SimpleFilter(source, st);
  const outLength = Math.ceil(src.length / (1 / ratio));
  const out = ctx.createBuffer(src.numberOfChannels, outLength, src.sampleRate);
  const samples = new Float32Array(outLength * 2); // interleaved L/R for stereo
  const framesExtracted = filter.extract(samples, outLength);
  const left = out.getChannelData(0);
  for (let i = 0; i < framesExtracted; i++) left[i] = samples[i * 2];
  if (out.numberOfChannels > 1) {
    const right = out.getChannelData(1);
    for (let i = 0; i < framesExtracted; i++) right[i] = samples[i * 2 + 1];
  }
  return out;
}
