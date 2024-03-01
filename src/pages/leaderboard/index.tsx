import Link from "next/link";
import Metatags from "~/components/MetaTags";
import Image from "next/image";
import { useUser } from "~/hooks/useUser";
import { extractProfileFromUser } from "~/utils/wallet";
import Header from "~/components/Header";
import { api } from "~/utils/api";
import { EventResults } from "~/components/leaderboard/EventResults";

export default function Leaderboard() {
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
          <section className="flex w-full flex-col items-center justify-center gap-4 rounded-xl bg-blue-950 p-4 md:w-3/4">
            <div className="flex w-full flex-col items-center justify-center gap-2 md:w-[600px]">
              <h1 className="pt-2 font-clayno text-2xl font-extrabold md:text-3xl">
                Event Leaderboards
              </h1>
              <p className="text-center">
                Each event contributes points to the{" "}
                <Link href="/podium" className="text-sky-500">
                  overall competition leaderboard
                </Link>
                . The top 3 will make the podium!
              </p>
              <p className="text-md mt-4 font-clayno font-bold underline">
                Scoring Critera
              </p>
              <p className="text-center">
                Points will be awarded to the top 10 finishers in each event (10
                for 1st, 9 for 2nd, etc.), but points are doubled for the Apres
                Ski Games (20 for 1st, 18 for 2nd, etc.).
              </p>
            </div>
            <div className="flex w-full flex-col items-center  justify-center gap-4 rounded-lg bg-purple-900 p-2 md:w-[650px] md:p-6">
              <h2 className="font-clayno text-xl font-extrabold">
                #1: Apres Ski Games
              </h2>
              {/* {events?.map((event) => (
                <div key={event.id} className="w-full">
                  <EventResults key={event.competitionId} event={event} />
                </div>
              ))} */}
              {events && events[0] && (
                <div className="w-full">
                  <EventResults event={events[0]} name={true} />
                </div>
              )}
              {events && events[1] && (
                <div className="w-full">
                  <EventResults event={events[1]} name={true} />
                </div>
              )}
              {events && events[2] && (
                <div className="w-full">
                  <EventResults event={events[2]} name={true} />
                </div>
              )}
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-4 rounded-lg bg-purple-900 p-2 md:w-[650px] md:p-4">
              <h2 className="font-clayno text-xl font-extrabold">
                #2: Meme Contest
              </h2>
              {events && events[3] && (
                <div className="w-full">
                  <EventResults event={events[3]} />
                </div>
              )}
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-4 rounded-lg bg-purple-900 p-2 md:w-[650px] md:p-4">
              <h2 className="font-clayno text-xl font-extrabold">
                #3: Snowfall Prediction
              </h2>
              {events && events[4] && (
                <div className="w-full">
                  <EventResults event={events[4]} />
                </div>
              )}
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-4 rounded-lg bg-purple-900 p-2 md:w-[650px] md:p-4">
              <h2 className="font-clayno text-xl font-extrabold">
                #4: Scavenger Hunt
              </h2>
              {events && events[5] && (
                <div className="w-full">
                  <EventResults event={events[5]} />
                </div>
              )}
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-4 rounded-lg bg-purple-900 p-2 md:w-[650px] md:p-4">
              <h2 className="font-clayno text-xl font-extrabold">
                #5: Degen Trivia
              </h2>
              {events && events[7] && (
                <div className="w-full">
                  <EventResults event={events[7]} />
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
