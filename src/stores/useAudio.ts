import { create } from "zustand";

type AudioState = {
  initialized: boolean;
  muted: boolean;
  windAudio: HTMLAudioElement | null;
  carveAudio: HTMLAudioElement | null;
  gatePassAudio: HTMLAudioElement | null;
  gateMissAudio: HTMLAudioElement | null;

  init: () => void;
  cleanup: () => void;
  toggleMute: () => void;

  updateWind: (speedRatio: number) => void;
  playCarve: (intensity: number) => void;
  stopCarve: () => void;
  playGatePass: () => void;
  playGateMiss: () => void;
};

const AUDIO_PATHS = {
  wind: "/audio/wind-loop.mp3",
  carve: "/audio/carve.mp3",
  gatePass: "/audio/gate-pass.mp3",
  gateMiss: "/audio/gate-miss.mp3",
};

const createAudio = (src: string, loop = false): HTMLAudioElement | null => {
  if (typeof window === "undefined") return null;

  try {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.preload = "auto";
    return audio;
  } catch {
    console.warn(`Failed to create audio: ${src}`);
    return null;
  }
};

const useAudio = create<AudioState>((set, get) => ({
  initialized: false,
  muted: false,
  windAudio: null,
  carveAudio: null,
  gatePassAudio: null,
  gateMissAudio: null,

  init: () => {
    if (get().initialized) return;

    const windAudio = createAudio(AUDIO_PATHS.wind, true);
    const carveAudio = createAudio(AUDIO_PATHS.carve, true);
    const gatePassAudio = createAudio(AUDIO_PATHS.gatePass, false);
    const gateMissAudio = createAudio(AUDIO_PATHS.gateMiss, false);

    if (windAudio) {
      windAudio.volume = 0;
      windAudio.play().catch(() => {});
    }

    if (carveAudio) {
      carveAudio.volume = 0;
      carveAudio.play().catch(() => {});
    }

    set({
      initialized: true,
      windAudio,
      carveAudio,
      gatePassAudio,
      gateMissAudio,
    });
  },

  cleanup: () => {
    const state = get();
    state.windAudio?.pause();
    state.carveAudio?.pause();
    set({
      initialized: false,
      windAudio: null,
      carveAudio: null,
      gatePassAudio: null,
      gateMissAudio: null,
    });
  },

  toggleMute: () => {
    const muted = !get().muted;
    set({ muted });

    const state = get();
    if (state.windAudio) state.windAudio.muted = muted;
    if (state.carveAudio) state.carveAudio.muted = muted;
    if (state.gatePassAudio) state.gatePassAudio.muted = muted;
    if (state.gateMissAudio) state.gateMissAudio.muted = muted;
  },

  updateWind: (speedRatio: number) => {
    const { windAudio, muted } = get();
    if (!windAudio || muted) return;

    const volume = Math.min(speedRatio * 0.6, 0.5);
    const playbackRate = 0.8 + speedRatio * 0.4;

    windAudio.volume = volume;
    windAudio.playbackRate = playbackRate;
  },

  playCarve: (intensity: number) => {
    const { carveAudio, muted } = get();
    if (!carveAudio || muted) return;

    const volume = Math.min(intensity * 0.5, 0.4);
    carveAudio.volume = volume;
    carveAudio.playbackRate = 0.9 + intensity * 0.2;
  },

  stopCarve: () => {
    const { carveAudio } = get();
    if (carveAudio) {
      carveAudio.volume = 0;
    }
  },

  playGatePass: () => {
    const { gatePassAudio, muted } = get();
    if (!gatePassAudio || muted) return;

    gatePassAudio.currentTime = 0;
    gatePassAudio.volume = 0.5;
    gatePassAudio.play().catch(() => {});
  },

  playGateMiss: () => {
    const { gateMissAudio, muted } = get();
    if (!gateMissAudio || muted) return;

    gateMissAudio.currentTime = 0;
    gateMissAudio.volume = 0.4;
    gateMissAudio.play().catch(() => {});
  },
}));

export default useAudio;
