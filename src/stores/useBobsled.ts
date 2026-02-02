import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

type GamePhase = "ready" | "pushing" | "racing" | "finished";

type BobsledState = {
  phase: GamePhase;
  pushPower: number;
  speed: number;
  lean: number;
  time: number;
  startTime: number;
  bestTime: number;
  trackProgress: number;

  startPushing: () => void;
  addPush: () => void;
  startRacing: () => void;
  setLean: (lean: number) => void;
  setSpeed: (speed: number) => void;
  updateProgress: (progress: number) => void;
  finish: (finalTime: number) => void;
  restart: () => void;
};

export const useBobsled = create(
  subscribeWithSelector<BobsledState>((set, get) => ({
    phase: "ready",
    pushPower: 0,
    speed: 0,
    lean: 0,
    time: 0,
    startTime: 0,
    bestTime: 0,
    trackProgress: 0,

    startPushing: () => {
      set({ phase: "pushing", pushPower: 0, startTime: Date.now() });
    },

    addPush: () => {
      set((state) => {
        if (state.phase === "pushing") {
          const newPower = Math.min(100, state.pushPower + 8);
          return { pushPower: newPower };
        }
        return {};
      });
    },

    startRacing: () => {
      set((state) => ({
        phase: "racing",
        speed: state.pushPower * 0.3,
      }));
    },

    setLean: (lean: number) => {
      set({ lean: Math.max(-1, Math.min(1, lean)) });
    },

    setSpeed: (speed: number) => {
      set({ speed: Math.max(0, speed) });
    },

    updateProgress: (progress: number) => {
      set({ trackProgress: progress });
    },

    finish: (finalTime: number) => {
      set((state) => ({
        phase: "finished",
        time: finalTime,
        bestTime:
          state.bestTime === 0
            ? finalTime
            : Math.min(state.bestTime, finalTime),
      }));
    },

    restart: () => {
      set({
        phase: "ready",
        pushPower: 0,
        speed: 0,
        lean: 0,
        time: 0,
        startTime: 0,
        trackProgress: 0,
      });
    },
  }))
);
