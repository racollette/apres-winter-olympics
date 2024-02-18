import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

export const LoadingScreen = ({
  totalFiles = 100,
  started,
  startExperience,
}: {
  totalFiles: number;
  started: boolean;
  startExperience: () => void;
}) => {
  const [showExperience, setShowExperience] = useState(false);

  const { active, progress, errors, item, loaded, total } = useProgress();
  console.log("active", active);
  console.log("progress", progress);
  console.log("errors", errors);
  console.log("item", item);
  console.log("loaded", loaded);
  console.log("total", total);

  const loadingProgress = (loaded / totalFiles) * 100;

  useEffect(() => {
    if (loadingProgress >= 100) {
      startExperience();
      setTimeout(() => {
        setShowExperience(true);
      }, 6000);
    }
  }, [loadingProgress]);

  return (
    <div
      className={`duration-[2000ms] fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center  bg-gradient-to-br from-purple-800 to-sky-600 transition-opacity ${
        started && `opacity-0`
      } ${showExperience && `hidden`}`}
    >
      <div className="mx-8 flex w-full flex-col items-center justify-center gap-3 md:mx-0 md:gap-6">
        <div className="font-pangolin text-xl font-extrabold text-white md:text-3xl">
          Tuning skis...
        </div>
        <div className="relative flex h-[45px] w-full items-center justify-center overflow-clip rounded-xl border-4 border-fuchsia-700/80 p-4 md:w-1/3">
          <div
            className="absolute left-0 top-0 h-full bg-fuchsia-600"
            style={{
              width: `${loadingProgress.toFixed(0)}%`,
            }}
          />
          <div className="font-pangolin absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-extrabold text-white">
            {loadingProgress.toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
};
