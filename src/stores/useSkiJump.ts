import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

type GamePhase = "ready" | "charging" | "flying" | "landed";

type SkiJumpState = {
  phase: GamePhase;
  power: number;
  distance: number;
  landingAngle: number;
  score: number;
  bestScore: number;

  startCharging: () => void;
  updatePower: (delta: number) => void;
  launch: () => void;
  land: (distance: number, angle: number) => void;
  restart: () => void;
};

export const useSkiJump = create(
  subscribeWithSelector<SkiJumpState>((set, get) => ({
    phase: "ready",
    power: 0,
    distance: 0,
    landingAngle: 0,
    score: 0,
    bestScore: 0,

    startCharging: () => {
      set((state) => {
        if (state.phase === "ready") {
          return { phase: "charging", power: 0 };
        }
        return {};
      });
    },

    updatePower: (delta: number) => {
      set((state) => {
        if (state.phase === "charging") {
          const newPower = Math.min(100, state.power + delta * 50);
          return { power: newPower };
        }
        return {};
      });
    },

    launch: () => {
      set((state) => {
        if (state.phase === "charging") {
          return { phase: "flying" };
        }
        return {};
      });
    },

    land: (distance: number, angle: number) => {
      const landingBonus = Math.max(0, 1 - Math.abs(angle) / 45);
      const score = Math.round(distance * (1 + landingBonus * 0.5) * 10) / 10;

      set((state) => ({
        phase: "landed",
        distance,
        landingAngle: angle,
        score,
        bestScore: Math.max(state.bestScore, score),
      }));
    },

    restart: () => {
      set({
        phase: "ready",
        power: 0,
        distance: 0,
        landingAngle: 0,
        score: 0,
      });
    },
  }))
);
