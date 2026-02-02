import { useEffect, useState, useRef } from "react";
import useGame from "../../stores/useGame";

const TOTAL_GATES = 50;

export default function MissFlash() {
  const [showFlash, setShowFlash] = useState(false);
  const prevGatesRef = useRef(0);
  const prevZRef = useRef(0);
  const gatesActivated = useGame((state) => state.gatesActivated);
  const phase = useGame((state) => state.phase);

  useEffect(() => {
    if (phase !== "playing") {
      prevGatesRef.current = 0;
      prevZRef.current = 0;
      return;
    }

    const expectedGates = gatesActivated;

    if (prevGatesRef.current > 0 && expectedGates === prevGatesRef.current) {
    }

    prevGatesRef.current = gatesActivated;
  }, [gatesActivated, phase]);

  useEffect(() => {
    const checkMissedGates = () => {
      const state = useGame.getState();
      if (state.phase !== "playing") return;

      const gateIndices = Array.from(state.passedGateIndices);
      const gatesPassed = gateIndices.length;
      const playerProgress = Math.max(...gateIndices, -1) + 1;

      if (playerProgress > gatesPassed + 1) {
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 300);
      }
    };

    const interval = setInterval(checkMissedGates, 100);
    return () => clearInterval(interval);
  }, []);

  if (!showFlash) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 animate-pulse bg-red-500/30" />
  );
}
