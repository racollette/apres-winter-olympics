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
  const { username } = extractProfileFromUser(user);

  const { data: events, isLoading } = api.leaderboard.getAllEvents.useQuery({
    competitionId: 1,
  });

  console.log(events);

  return (
    <>
      <Metatags
        title="Apres Winter Olympics"
        description="2024 Apres Winter Olympics. Sponsored by Apres Mountain Lodge and Clayno.club"
      />
      <Header />
      <main className="text-white">
        <div className="flex flex-col items-center justify-center gap-12 p-4 pb-16">
          <section className="flex w-full flex-col items-center justify-center gap-8 rounded-xl bg-blue-950 p-4 md:w-3/4">
            <h1 className="text-2xl font-bold">Events</h1>
            {events?.map((event) => (
              <EventResults key={event.competitionId} event={event} />
            ))}
          </section>
        </div>
      </main>
    </>
  );
}
