import Metatags from "~/components/MetaTags";
import Header from "~/components/Header";
import { Canvas } from "@react-three/fiber";
import Experience from "~/components/podium/Experience";
import { Suspense, useState } from "react";
import { api } from "~/utils/api";
import { extractProfileFromUser } from "~/utils/wallet";
import Image from "next/image";
import { handleUserPFPDoesNotExist } from "~/utils/images";
import { truncateAccount } from "~/utils/addresses";
import { LoadingScreen } from "~/components/LoadingScreen";

export type Medalist = {
  model: string;
  number: string;
  handle: string | null;
};

export default function Podium() {
  const [start, setStart] = useState(false);
  const { data: events = [], isLoading } =
    api.leaderboard.getAllEvents.useQuery({
      competitionId: 1,
    });

  const userPointsMap = new Map();

  for (const event of events) {
    const top10 = event.results.slice(0, 10);

    let multiplier = 1;

    if (event.id === 1 || event.id === 2 || event.id === 3) {
      multiplier = 2;
    }

    for (const [index, result] of top10.entries()) {
      const points = (10 - index) * multiplier;
      const { userId, dinoId, dino, user } = result;

      // If the userId already exists in the map, add the points to the existing entry
      if (userPointsMap.has(userId)) {
        const existingEntry = userPointsMap.get(userId);
        userPointsMap.set(userId, {
          userId,
          points: existingEntry.points + points,
          dinoId,
          dino,
          user,
        });
      } else {
        // Otherwise, add a new entry to the map
        userPointsMap.set(userId, { userId, points, dinoId, dino, user });
      }
    }
  }

  const overallLeaderboard = Array.from(userPointsMap.values()).sort(
    (a, b) => b.points - a.points
  );

  const modelString = (index: number) =>
    `${overallLeaderboard[index]?.dino?.attributes?.species.toLowerCase()}-${
      overallLeaderboard[index]?.dino?.attributes.species === "Dactyl"
        ? "soar"
        : "idle"
    }-${overallLeaderboard[index]?.dino?.attributes?.mood.toLowerCase()}`;

  const modelNumber = (index: number) =>
    `${overallLeaderboard[index]?.dino?.name.split("#").slice(-1)}`;

  const goldMedal: Medalist = {
    model: modelString(0),
    number: modelNumber(0),
    handle: extractProfileFromUser(overallLeaderboard[0]?.user).userHandle,
  };

  const silverMedal: Medalist = {
    model: modelString(1),
    number: modelNumber(1),
    handle: extractProfileFromUser(overallLeaderboard[1]?.user).userHandle,
  };

  const bronzeMedal: Medalist = {
    model: modelString(2),
    number: modelNumber(2),
    handle: extractProfileFromUser(overallLeaderboard[2]?.user).userHandle,
  };

  return (
    <>
      <Metatags
        title="Apres Winter Olympics"
        description="2024 Apres Winter Olympics. Sponsored by Apres Mountain Lodge and Clayno.club"
      />
      <Header />
      <main className="text-white">
        <div className="flex flex-col items-center justify-center gap-4 p-1 pb-16 md:gap-12 md:p-4">
          <section className="flex w-full flex-col items-center justify-center gap-4 rounded-xl bg-blue-950 p-4 md:w-3/4">
            <h1 className="pt-2 font-clayno text-2xl font-extrabold md:text-3xl">
              Podium
            </h1>
            <p className="text-sm italic">
              The podium is updated in real time for the mini-games, and when
              the results are in for the other events.
            </p>
            <div className="flex h-[300px] w-full flex-col items-center justify-center gap-4 rounded-lg bg-purple-900 p-2 md:h-[600px] md:w-3/4 md:p-6">
              <Canvas className="cursor-grab rounded-lg">
                <color attach="background" args={["black"]} />
                <Suspense fallback={null}>
                  <Experience
                    gold={goldMedal}
                    silver={silverMedal}
                    bronze={bronzeMedal}
                  />
                </Suspense>
              </Canvas>
              {/* <LoadingScreen
                totalFiles={10}
                started={start}
                startExperience={() => setStart(true)}
              /> */}
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-4 overflow-x-scroll rounded-lg bg-purple-900 p-3 font-clayno text-xs md:w-3/4 md:overflow-auto md:p-6 md:text-sm">
              <div className="text-xl font-extrabold">Overall</div>
              <table className="table-auto border-separate border-spacing-1 md:border-spacing-2">
                <thead>
                  <tr>
                    <th className="items-center justify-center px-2 py-1 text-right md:px-4 md:py-2"></th>
                    <th className="px-2 py-1 text-left md:px-4 md:py-2">
                      Player
                    </th>
                    <th className="px-2 py-1 text-left md:px-4 md:py-2">
                      Clayno
                    </th>
                    <th className="whitespace-nowrap px-2 py-1 text-left md:px-4 md:py-2">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {overallLeaderboard.map((result, idx) => {
                    const { username, userPFP, userHandle } =
                      extractProfileFromUser(result.user);
                    return (
                      <tr key={result.id} className="align-middle">
                        <td className="pl-2 md:pl-4">
                          <div className="text-right">{idx + 1}</div>
                        </td>
                        <td className="px-2 md:px-4">
                          <div className="flex items-center gap-2 ">
                            <div className="relative h-6 w-6 md:h-10 md:w-10">
                              <Image
                                src={
                                  userPFP ??
                                  `https://ui-avatars.com/api/?name=${result.user.defaultAddress}&background=random`
                                }
                                alt={username as string}
                                fill
                                className="rounded-full"
                                onError={handleUserPFPDoesNotExist}
                              />
                            </div>
                            <div className="max-w-[75px] overflow-clip md:max-w-sm">
                              {userHandle
                                ? userHandle
                                : truncateAccount(result.user.defaultAddress)}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 md:px-4">
                          <div className="relative flex h-10 w-10 items-center gap-2 md:h-14 md:w-14">
                            <Image
                              src={`https://prod-image-cdn.tensor.trade/images/slug=claynosaurz/400x400/freeze=false/${result?.dino?.gif}`}
                              alt={result?.dino?.name as string}
                              fill
                              className="rounded-xl"
                            />
                            {/* <div className="max-w-xs">
                      {result?.dino?.name.split(" ")[1]}
                    </div> */}
                          </div>
                        </td>
                        <td className="px-2 md:px-4">
                          <div className="max-w-xs">{result.points}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
