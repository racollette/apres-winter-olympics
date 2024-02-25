import Link from "next/link";
import Metatags from "~/components/MetaTags";
import Image from "next/image";
import Header from "~/components/Header";
import { endDate } from "~/utils/constants";
import dynamic from "next/dynamic"; // Import dynamic from next/dynamic

const TimeRemaining = dynamic(() => import("~/components/TimeRemaining"), {
  ssr: false,
}); // Dynamically import TimeRemaining component

export default function Home() {
  return (
    <>
      <Metatags
        title="Apres Winter Olympics"
        description="2024 Claynosaurz Winter Olympics. Sponsored by Apres Mountain Lodge and Clayno.club"
      />
      <Header />
      <main className="text-white">
        <div className="flex flex-col items-center justify-center gap-6 p-4 pb-16 md:gap-12">
          <section
            className="relative flex aspect-[2/1] w-full flex-col items-center justify-center gap-4 rounded-xl px-4 py-12 md:w-3/4 md:flex-row md:gap-8"
            // style={{
            //   background: `url('/images/hero_banner.jpeg')`,
            //   backgroundSize: `contain`,
            // }}
          >
            <Image
              src="/images/hero_banner.jpeg"
              alt="Winter Olympics"
              fill
              className="rounded-xl"
            ></Image>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-purple-900 p-2 md:p-4">
              <h2 className="text-md whitespace-nowrap font-clayno text-white md:text-4xl">
                Apres Winter Olympics
              </h2>
            </div>
          </section>
          <section className="w-full md:w-3/4">
            <div className="flex w-full flex-col items-center gap-2 rounded-xl bg-purple-950 p-2 md:p-4">
              <h2 className="text-lg font-extrabold md:text-2xl">
                How to participate?
              </h2>
              <ul className="md:text-md flex flex-col gap-2 text-sm">
                <li>1. Hold a Claynosaurz or Call of Saga NFT.</li>
                <li>
                  {`2. If you haven't already`}, create an account on{" "}
                  <a
                    href="https://clayno.club"
                    target="_blank"
                    className="text-sky-500"
                  >
                    Clayno.club
                  </a>{" "}
                  using your Solana wallet and link your X account.
                </li>
                <li>
                  3. Sign in here using your{" "}
                  <a
                    href="https://clayno.club"
                    target="_blank"
                    className="text-sky-500"
                  >
                    Clayno.club
                  </a>{" "}
                  credentials.
                </li>
                <li>
                  4. Visit the events page to compete for a chance to make it
                  onto the podium!
                </li>
              </ul>
            </div>
          </section>

          <section className="flex w-full justify-center">
            <Link
              href="/events"
              className="flex w-full cursor-pointer flex-col items-center gap-4 rounded-xl bg-sky-400 p-6 font-clayno text-4xl hover:animate-wiggle md:w-fit"
            >
              <div className="flex  flex-col items-center justify-center gap-2">
                <h2 className="text-lg font-semibold">
                  Apres Winter Games ending in
                </h2>
                <div className="animate-pulse font-clayno text-2xl font-extrabold">
                  <TimeRemaining endDate={endDate} />
                </div>
              </div>
              <div className="relative aspect-square w-full md:w-[450px]">
                <Image
                  src="/images/start.jpeg"
                  fill
                  alt="2024 Winter Olympics"
                  className="rounded-lg hover:scale-105"
                />
              </div>
              <div> {`Let's go`}</div>
            </Link>
          </section>
          <section className="flex w-full flex-col items-center justify-center rounded-xl bg-blue-950 p-4 md:w-3/4">
            <div className="py-2 font-clayno text-xl text-white md:text-2xl">
              Hosted by
            </div>
            <div className="grid w-full grid-cols-1 items-center justify-center gap-4 p-4 lg:grid-cols-2 lg:gap-2">
              <Link
                href="https://x.com/ApresMountLodge"
                target="_blank"
                className="hover:scale-105"
              >
                <Image
                  src="/images/lodge_banner.jpeg"
                  alt="Apres Mountain Lodge"
                  width={600}
                  height={200}
                  className="rounded-xl"
                ></Image>
              </Link>
              <Link
                href="https://clayno.club"
                target="_blank"
                className="relative aspect-[3/1] w-full overflow-hidden hover:scale-105"
              >
                <Image
                  src="/images/claynoclub_banner.jpeg"
                  alt="Clayno.club"
                  fill
                  className="rounded-xl"
                ></Image>
                <div className="absolute left-5 top-5 rounded-lg bg-blue-950/75 p-1 font-clayno text-lg text-white md:px-4 md:py-2 md:text-2xl">
                  Clayno.club
                </div>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
