import Link from "next/link";
import Metatags from "~/components/MetaTags";
import Image from "next/image";
import { useUser } from "~/hooks/useUser";
import { extractProfileFromUser } from "~/utils/wallet";
import Header from "~/components/Header";
import { api } from "~/utils/api";
import { EventResults } from "~/components/leaderboard/EventResults";

export default function Leaderboard() {
  const { user } = useUser();

  const { data: events, isLoading } = api.leaderboard.getAllEvents.useQuery({
    competitionId: 1,
  });

  return (
    <>
      <Metatags
        title="Apres Winter Olympics"
        description="2024 Apres Winter Olympics. Sponsored by Apres Mountain Lodge and Clayno.club"
      />
      <Header />
      <main className="text-white">
        <div className="flex flex-col items-center justify-center gap-4 p-1 pb-16 md:gap-12 md:p-4">
          <section className="flex w-full flex-col items-center justify-center gap-4 rounded-xl bg-blue-950 p-4 md:w-3/4 md:gap-8">
            <h1 className="pt-2 font-clayno text-2xl font-extrabold md:text-3xl">
              Event Leaderboards
            </h1>
            <div className="flex w-full flex-col items-center  justify-center gap-4 rounded-lg bg-purple-900 p-2 md:w-[650px] md:p-6">
              <h2 className="font-clayno text-xl font-extrabold">
                #1: Apres Ski Games
              </h2>
              {events?.map((event) => (
                <div className="w-full">
                  <EventResults key={event.competitionId} event={event} />
                </div>
              ))}
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-4 rounded-lg bg-purple-900 p-2 md:w-[650px] md:p-4">
              <h2 className="font-clayno text-xl font-extrabold">
                #2: Meme Contest
              </h2>
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-4 rounded-lg bg-purple-900 p-2 md:w-[650px] md:p-4">
              <h2 className="font-clayno text-xl font-extrabold">
                #3: Snowfall Prediction
              </h2>
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-4 rounded-lg bg-purple-900 p-2 md:w-[650px] md:p-4">
              <h2 className="font-clayno text-xl font-extrabold">
                #4: Scavenger Hunt
              </h2>
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-4 rounded-lg bg-purple-900 p-2 md:w-[650px] md:p-4">
              <h2 className="font-clayno text-xl font-extrabold">
                #5: Degen Trivia
              </h2>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
