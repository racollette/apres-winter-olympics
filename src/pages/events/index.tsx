import Metatags from "~/components/MetaTags";
import Header from "~/components/Header";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Metatags
        title="Apres Winter Olympics"
        description="2024 Apres Claynosaurz Winter Olympics. Sponsored by Apres Mountain Lodge and Clayno.club"
      />
      <Header />
      <main className="text-white">
        <div className="flex flex-col items-center justify-center gap-12 p-2 pb-16 md:p-4">
          <div className="flex w-full flex-col items-center justify-center gap-2 rounded-xl bg-blue-950 p-4 md:w-3/4">
            <h1 className="p-4 font-clayno text-4xl">Event Directory</h1>
            <div className="flex w-full flex-col items-center justify-center gap-2 md:gap-4 lg:w-3/4">
              <EventListing
                name="Overall"
                description="Each event contributes points to the overall competition leaderboard. The top 3 will make the podium!"
                prizes={[
                  "🥇 Gold: 1 Saga Clayno, 1 Claymaker, 4 Clay",
                  "🥈 Silver: 5 SOL, 3 Claymakers, 3 Clay",
                  "🥉 Bronze: 2 SOL, 2 Claymakers, 2 Clay",
                ]}
                links={[
                  { location: "Leaderboards", url: "/leaderboard" },
                  { location: "Podium", url: "/pdoium" },
                ]}
              ></EventListing>
              <EventListing
                number={1}
                name="Apres Ski Games"
                startDate="Monday Feb. 26th"
                endDate="Friday March 1st"
                description="Compete in a variety of mini-games with your clayno!"
                prizes={["Top scorer: 1 Claymaker, 2 Clay for each event"]}
              >
                <div className="mt-4 grid w-full grid-cols-2 items-center justify-between gap-4 md:grid-cols-4">
                  <Link
                    href="/slalom"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg bg-purple-950 p-2 hover:scale-105 hover:bg-cyan-500"
                  >
                    <div className="relative aspect-square w-full">
                      <Image
                        src="/images/slalom.png"
                        alt="Time Trial"
                        fill
                        className="rounded-md"
                      />
                    </div>
                    <p className="font-bold">Time Trial</p>
                  </Link>
                  <Link
                    href="/ski-jump"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg bg-purple-950 p-2 hover:scale-105 hover:bg-cyan-500"
                  >
                    <div className="relative aspect-square w-full">
                      <Image
                        src="/images/slalom.png"
                        alt="Ski Jump"
                        fill
                        className="rounded-md"
                      />
                    </div>
                    <p className="font-bold">Ski Jump</p>
                  </Link>
                  <Link
                    href="/bobsled"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg bg-purple-950 p-2 hover:scale-105 hover:bg-cyan-500"
                  >
                    <div className="relative aspect-square w-full">
                      <Image
                        src="/images/slalom.png"
                        alt="Bobsled"
                        fill
                        className="rounded-md"
                      />
                    </div>
                    <p className="font-bold">Bobsled</p>
                  </Link>
                  <Link
                    href="/delivery"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg bg-purple-950 p-2 hover:scale-105 hover:bg-cyan-500"
                  >
                    <div className="relative aspect-square w-full">
                      <Image
                        src="/images/delivery.png"
                        alt="Delivery"
                        fill
                        className="rounded-md"
                      />
                    </div>
                    <p className="font-bold">Delivery</p>
                  </Link>
                </div>
              </EventListing>
              <EventListing
                number={2}
                name="Meme Contest"
                startDate="Tuesday Feb. 27th"
                links={[
                  {
                    location: "Submissions",
                    url: "https://x.com/ApresMountLodge",
                  },
                  { location: "Voting", url: "/memes" },
                ]}
                prizes={["Top scorer: 2 Clay"]}
              ></EventListing>
              <EventListing
                number={3}
                name="Snowfall Prediction"
                startDate="Wednesday Feb. 28th"
                links={[
                  { location: "Guesses", url: "https://x.com/ApresMountLodge" },
                ]}
                prizes={["Top scorer: 2 Clay"]}
              ></EventListing>
              <EventListing
                number={4}
                name="Scavenger Hunt"
                startDate="Thursday Feb. 29th"
                links={[
                  {
                    location: "Submissions",
                    url: "https://x.com/ApresMountLodge",
                  },
                ]}
                prizes={["Top scorer: 2 Clay"]}
              ></EventListing>
              <EventListing
                number={5}
                name="Degen Trivia"
                startDate="Friday March 1st"
                links={[
                  {
                    location: "Submissions",
                    url: "https://x.com/ApresMountLodge",
                  },
                ]}
                prizes={["Top scorer: 2 Clay"]}
              ></EventListing>
            </div>
          </div>
          {/* <Select /> */}
        </div>
      </main>
    </>
  );
}

type Link = {
  location: string;
  url: string;
};

type EventListingProps = {
  number?: number;
  name: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  links?: Link[];
  prizes?: string[];
};

function EventListing({
  number,
  name,
  startDate,
  endDate,
  description,
  links,
  prizes,
  children, // Include children prop
}: EventListingProps & { children?: React.ReactNode }) {
  return (
    <div className="w-full rounded-lg bg-purple-900 p-2 md:p-4">
      <div className="text-center font-clayno text-lg md:text-2xl">
        {number && `#${number}:`} {name}
      </div>
      <div className="flex flex-col items-center justify-center gap-2 px-2 pb-2 md:px-4">
        <div className="text-sm">
          {startDate} {endDate && `- ${endDate}`}
        </div>
        {description && (
          <div className="text-md text-center">{description}</div>
        )}
        {links && (
          <div className="flex flex-row items-center justify-center gap-4 text-sm font-semibold">
            <div className="rounded-md bg-fuchsia-700 px-2 py-1 italic text-neutral-300">
              Links
            </div>
            {links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-500"
              >
                {link.location}
              </a>
            ))}
          </div>
        )}
        {prizes && (
          <div className="flex flex-col items-center justify-center gap-1">
            <h1 className="font-clayno font-bold">Prizes</h1>
            {prizes.map((prize, idx) => (
              <div
                key={idx}
                className="md:text-md text-center text-sm font-semibold"
              >
                {prize}
              </div>
            ))}
          </div>
        )}
        {/* Render children if provided */}
        {children}
      </div>
    </div>
  );
}
