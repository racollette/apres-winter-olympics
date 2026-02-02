import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { type Character } from "~/utils/inventory";

type State = {
  blocksCount: number;
  blocksSeed: number;
  startTime: number;
  endTime: number;
  phase: string;
  countdown: number;
  gatesActivated: number;
  passedGateIndices: Set<number>;
  userId: string;
  dino: Character | null;
  velocity: number;
  distanceFromCenter: number;
  startCountdown: () => void;
  start: () => void;
  restart: () => void;
  end: () => void;
  gateActivated: (gateIndex: number) => void;
  playerInformation: (userId: string, dino: Character | null) => void;
  setSpeed: (velocity: number) => void;
  setDistance: (distanceFromCenter: number) => void;
  reset: () => void;
};

export default create(
  subscribeWithSelector(
    (
      set: (
        partial: Partial<State> | ((state: State) => Partial<State>),
        replace?: boolean
      ) => void,
      get: () => State
    ) => {
      return {
        blocksCount: 10,
        blocksSeed: 0,

        /**
         * Time
         */
        startTime: 0,
        endTime: 0,

        /**
         * Phases
         */
        phase: "ready",
        countdown: 0,

        /**
         * Actions
         */
        gatesActivated: 0,
        passedGateIndices: new Set<number>(),

        // Results
        distanceFromCenter: 0,

        // Player information
        userId: "",
        dino: {} as Character | null,
        velocity: 0,

        playerInformation: (userId: string, dino: Character | null) => {
          set((state) => ({ ...state, userId, dino }));
        },

        setSpeed: (velocity: number) => {
          set((state) => ({ ...state, velocity }));
        },

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
              set({ phase: "playing", startTime: Date.now(), countdown: 0 });
            }
          }, 1000);
        },

        start: () => {
          set((state) => {
            if (state.phase === "ready")
              return { phase: "playing", startTime: Date.now() };

            return {};
          });
        },

        gateActivated: (gateIndex: number) => {
          set((state) => {
            const newSet = new Set(state.passedGateIndices);
            newSet.add(gateIndex);
            return {
              gatesActivated: state.gatesActivated + 1,
              passedGateIndices: newSet,
            };
          });
        },

        setDistance: (distanceFromCenter: number) => {
          set((state) => ({ ...state, distanceFromCenter }));
        },

        restart: () => {
          set((state) => {
            if (state.phase === "playing" || state.phase === "ended" || state.phase === "countdown")
              return {
                phase: "ready",
                blocksSeed: Math.random(),
                gatesActivated: 0,
                passedGateIndices: new Set<number>(),
                countdown: 0,
              };

            return {};
          });
        },

        end: () => {
          set((state) => {
            if (state.phase === "playing")
              return { phase: "ended", endTime: Date.now() };

            return {};
          });
        },

        reset: () => {
          set({
            blocksCount: 10,
            blocksSeed: 0,
            startTime: 0,
            endTime: 0,
            phase: "ready",
            countdown: 0,
            gatesActivated: 0,
            passedGateIndices: new Set<number>(),
            userId: "",
            dino: null,
            velocity: 0,
            distanceFromCenter: 0,
          });
        },
      };
    }
  )
);
