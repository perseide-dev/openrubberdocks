// src/core/global/hooks/useCliampRadio.ts
import { useState, useEffect, useCallback } from 'react';
import type { RadioStation, RadioPlaybackState } from '@components/ui/types/radio.types';
import {
  RADIO_STATIONS,
  DEFAULT_RADIO_VOLUME,
  CLIAMP_STORAGE_KEY,
} from '@utils-constants/radio.constants';

// Global singleton audio reference so streams persist seamlessly across any layout updates
let globalAudio: HTMLAudioElement | null = null;

function getOrCreateAudio(): HTMLAudioElement {
  if (typeof window === 'undefined') {
    return {} as HTMLAudioElement;
  }
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.preload = 'none';
    globalAudio.setAttribute('referrerpolicy', 'no-referrer');
  }
  return globalAudio;
}

export function useCliampRadio(defaultStationId?: string) {
  // Load saved preferences if available
  const [stationId, setStationId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(CLIAMP_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.stationId && RADIO_STATIONS.some((s) => s.id === parsed.stationId)) {
          return parsed.stationId;
        }
      }
    } catch {
      // Fallback
    }
    return defaultStationId || RADIO_STATIONS[0].id;
  });

  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(CLIAMP_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.volume === 'number') {
          return Math.max(0, Math.min(1, parsed.volume));
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_RADIO_VOLUME;
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackState, setPlaybackState] = useState<RadioPlaybackState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [isTuiOpen, setIsTuiOpen] = useState<boolean>(false);

  const currentStationIndex = Math.max(
    0,
    RADIO_STATIONS.findIndex((s) => s.id === stationId)
  );
  const currentStation = RADIO_STATIONS[currentStationIndex] || RADIO_STATIONS[0];

  // Sync volume with audio element
  useEffect(() => {
    const audio = getOrCreateAudio();
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Save prefs
  useEffect(() => {
    try {
      localStorage.setItem(
        CLIAMP_STORAGE_KEY,
        JSON.stringify({
          stationId,
          volume,
          isMuted,
          isCompact,
        })
      );
    } catch {
      // Ignore localStorage write error
    }
  }, [stationId, volume, isMuted, isCompact]);

  // Audio lifecycle listeners
  useEffect(() => {
    const audio = getOrCreateAudio();
    if (!audio) return;

    const handleWaiting = () => setPlaybackState('loading');
    const handlePlaying = () => setPlaybackState('playing');
    const handlePause = () => {
      // Only set to paused if not deliberately stopped
      setPlaybackState((prev) => (prev === 'loading' || prev === 'playing' ? 'paused' : prev));
    };
    const handleError = () => setPlaybackState('error');

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Elapsed timer when playing
  useEffect(() => {
    if (playbackState !== 'playing') return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [playbackState]);

  const playStation = useCallback(
    (station: RadioStation) => {
      const audio = getOrCreateAudio();
      setStationId(station.id);
      setPlaybackState('loading');
      setElapsedSeconds(0);

      audio.src = station.streamUrl;
      audio.load();
      audio
        .play()
        .then(() => {
          setPlaybackState('playing');
        })
        .catch(() => {
          setPlaybackState('error');
        });
    },
    []
  );

  const play = useCallback(() => {
    const audio = getOrCreateAudio();
    if (playbackState === 'paused' && audio.src) {
      audio
        .play()
        .then(() => setPlaybackState('playing'))
        .catch(() => setPlaybackState('error'));
    } else {
      playStation(currentStation);
    }
  }, [playbackState, currentStation, playStation]);

  const pause = useCallback(() => {
    const audio = getOrCreateAudio();
    audio.pause();
    setPlaybackState('paused');
  }, []);

  const stop = useCallback(() => {
    const audio = getOrCreateAudio();
    audio.pause();
    audio.src = '';
    setPlaybackState('idle');
    setElapsedSeconds(0);
  }, []);

  const togglePlay = useCallback(() => {
    if (playbackState === 'playing') {
      pause();
    } else {
      play();
    }
  }, [playbackState, pause, play]);

  const selectStation = useCallback(
    (station: RadioStation) => {
      if (station.id === currentStation.id && (playbackState === 'playing' || playbackState === 'loading')) {
        return;
      }
      playStation(station);
    },
    [currentStation.id, playbackState, playStation]
  );

  const nextStation = useCallback(() => {
    const nextIdx = (currentStationIndex + 1) % RADIO_STATIONS.length;
    const nextSt = RADIO_STATIONS[nextIdx];
    playStation(nextSt);
  }, [currentStationIndex, playStation]);

  const prevStation = useCallback(() => {
    const prevIdx = (currentStationIndex - 1 + RADIO_STATIONS.length) % RADIO_STATIONS.length;
    const prevSt = RADIO_STATIONS[prevIdx];
    playStation(prevSt);
  }, [currentStationIndex, playStation]);

  const setVolume = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolumeState(clamped);
    if (clamped > 0) {
      setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const toggleCompact = useCallback(() => {
    setIsCompact((prev) => !prev);
  }, []);

  const toggleTui = useCallback(() => {
    setIsTuiOpen((prev) => !prev);
  }, []);

  return {
    currentStation,
    playbackState,
    volume,
    isMuted,
    elapsedSeconds,
    isCompact,
    isTuiOpen,
    play,
    pause,
    stop,
    togglePlay,
    selectStation,
    nextStation,
    prevStation,
    setVolume,
    toggleMute,
    toggleCompact,
    toggleTui,
    stations: RADIO_STATIONS,
  };
}
