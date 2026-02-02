import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { type Character } from "~/utils/inventory";

export type JumpPhase = "ready" | "countdown" | "inrun" | "flight" | "landed" | "results";

type JumpState = {
  phase: JumpPhase;
  countdown: number;

  // Tracking
  speed: number;
  maxSpeed: number;
  takeoffSpeed: number;
  distance: number;
  stylePoints: number;

  // Takeoff timing
  takeoffPosition: { x: number; y: number; z: number } | null;
  landingPosition: { x: number; y: number; z: number } | null;

  // Player info
  userId: string;
  dino: Character | null;

  // Actions
  startCountdown: () => void;
  startInrun: () => void;
  takeoff: (position: { x: number; y: number; z: number }, speed: number) => void;
  land: (position: { x: number; y: number; z: number }, stylePoints: number) => void;
  showResults: () => void;
  restart: () => void;
  setSpeed: (speed: number) => void;
  setPlayerInfo: (userId: string, dino: Character | null) => void;
};

const TAKEOFF_Z = -120; // Z position of takeoff lip

export const useJumpGame = create(
  subscribeWithSelector<JumpState>((set, get) => ({
    phase: "ready",
    countdown: 0,

    speed: 0,
    maxSpeed: 0,
    takeoffSpeed: 0,
    distance: 0,
    stylePoints: 0,

    takeoffPosition: null,
    landingPosition: null,

    userId: "",
    dino: null,

    startCountdown: () => {
      const state = get();
      if (state.phase !== "ready") return;

      let count = 3;
      set({ phase: "countdown", countdown: count });

      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          set({ countdown: count });
        } else {
          clearInterval(interval);
          set({ phase: "inrun", countdown: 0 });
        }
      }, 1000);
    },

    startInrun: () => {
      set({ phase: "inrun" });
    },

    takeoff: (position, speed) => {
      set({
        phase: "flight",
        takeoffPosition: position,
        takeoffSpeed: speed,
      });
    },

    land: (position, stylePoints) => {
      const state = get();
      if (!state.takeoffPosition) return;

      // Calculate distance from takeoff to landing
      const dx = position.x - state.takeoffPosition.x;
      const dz = position.z - state.takeoffPosition.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      set({
        phase: "landed",
        landingPosition: position,
        distance: Math.round(distance * 10) / 10,
        stylePoints,
      });

      // Auto-transition to results after delay
      setTimeout(() => {
        set({ phase: "results" });
      }, 2000);
    },

    showResults: () => {
      set({ phase: "results" });
    },

    restart: () => {
      set({
        phase: "ready",
        countdown: 0,
        speed: 0,
        maxSpeed: 0,
        takeoffSpeed: 0,
        distance: 0,
        stylePoints: 0,
        takeoffPosition: null,
        landingPosition: null,
      });
    },

    setSpeed: (speed) => {
      const state = get();
      set({
        speed,
        maxSpeed: Math.max(state.maxSpeed, speed),
      });
    },

    setPlayerInfo: (userId, dino) => {
      set({ userId, dino });
    },
  }))
);

export default useJumpGame;
