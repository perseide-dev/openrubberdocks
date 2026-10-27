// src/core/components/ui/types/radio.types.ts

export type RadioPlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  streamUrl: string;
  bitrate: string;
  format: string;
  description: string;
}

export interface CliampRadioState {
  currentStation: RadioStation;
  playbackState: RadioPlaybackState;
  volume: number;
  isMuted: boolean;
  elapsedSeconds: number;
  isCompact: boolean;
  isTuiOpen: boolean;
}

export interface CliampRadioProps {
  defaultStationId?: string;
  className?: string;
}

export interface CliampSpectrumCanvasProps {
  isPlaying: boolean;
  height?: number;
  barCount?: number;
}
