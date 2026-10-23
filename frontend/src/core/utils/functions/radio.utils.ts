// src/core/utils/functions/radio.utils.ts

/**
 * Formats a duration in seconds into MM:SS or HH:MM:SS format
 */
export function formatRadioTime(totalSeconds: number): string {
  if (totalSeconds <= 0 || !Number.isFinite(totalSeconds)) {
    return '00:00';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  if (hours > 0) {
    const paddedHours = String(hours).padStart(2, '0');
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${paddedMinutes}:${paddedSeconds}`;
}

const ASCII_BLOCKS = [' ', ' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

/**
 * Generates dynamic frequencies for a realistic equalizer visualization.
 * Uses overlapping sine/cosine waves and simulated beat peaks.
 */
export function generateSimulatedEqualizer(barCount: number, isPlaying: boolean, step: number): number[] {
  if (!isPlaying) {
    return new Array(barCount).fill(4);
  }

  const bars: number[] = [];
  const t = step * 0.16;

  for (let i = 0; i < barCount; i++) {
    const normalizedPos = i / barCount;
    // Spectrum curve: heavy bass on left, energetic mids, tapering highs
    const baseEnergy = normalizedPos < 0.25 ? 0.88 : normalizedPos < 0.65 ? 0.72 : 0.52;
    const wave1 = Math.sin(t * (1 + (i % 8) * 0.35) + i * 0.4);
    const wave2 = Math.cos(t * 0.8 + i * 0.25);
    const wave3 = Math.sin(t * 2.3 + i * 0.7);

    let amplitude = (wave1 * 0.4 + wave2 * 0.35 + wave3 * 0.25 + 1) / 2;
    amplitude *= baseEnergy;

    // Organic micro-fluctuations
    const jitter = (Math.sin(step * 3.7 + i * 5.3) + 1) * 0.08;
    const heightPercent = Math.max(8, Math.min(100, Math.round((amplitude + jitter) * 100)));

    bars.push(heightPercent);
  }

  return bars;
}

/**
 * Converts numeric bar values into an ASCII block visualizer string.
 */
export function getAsciiVisualizerString(bars: number[]): string {
  return bars
    .map((val) => {
      const idx = Math.min(ASCII_BLOCKS.length - 1, Math.floor((val / 100) * (ASCII_BLOCKS.length - 1)));
      return ASCII_BLOCKS[Math.max(0, idx)];
    })
    .join('');
}
