import Link from "next/link";
import Metatags from "~/components/MetaTags";
import Image from "next/image";
import { useUser } from "~/hooks/useUser";
import { extractProfileFromUser } from "~/utils/wallet";
import LoginModal from "~/components/LoginModal";
import Inventory from "~/components/inventory/Inventory";
import Header from "~/components/Header";

export default function Home() {
  const { user } = useUser();
  const { username } = extractProfileFromUser(user);

  return (
    <>
      <Metatags
        title="Apres Winter Olympics"
        description="2024 Claynosaurz Winter Olympics. Sponsored by Apres Mountain Lodge and Clayno.club"
      />
      <Header />
      <main className="text-white">
        <div className="flex flex-col items-center justify-center gap-12 p-4 pb-16">
          <section
            className="relative flex aspect-[2/1] w-3/4 flex-col items-center justify-center gap-4 rounded-xl px-4 py-12 md:flex-row md:gap-8"
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
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-purple-900 p-4">
              <h2 className="font-clayno text-4xl text-white">
                Apres Winter Olympics
              </h2>
            </div>
          </section>
          <section className="w-full md:w-3/4">
            <div className="flex w-full flex-col items-center gap-2 rounded-xl bg-purple-950 p-4">
              <h2 className="text-2xl font-extrabold">How to participate?</h2>
              <ul className="text-md flex flex-col gap-2 font-semibold">
                <li>1. Hold a Claynosaurz or Clayno Saga NFT.</li>
                <li>
                  {`2. If you haven't already`}, create an account on{" "}
                  <a
                    href="https://clayno.club"
                    target="_blank"
                    className="text-sky-500"
                  >
                    Clayno.club
                  </a>{" "}
                  and link your Solana wallet.
                </li>
                <li>
                  3. Sign in using your{" "}
                  <a
                    href="https://clayno.club"
                    target="_blank"
                    className="text-sky-500"
                  >
                    Clayno.club
                  </a>{" "}
                  credentials and select your Claynosaurz.
                </li>
                <li>
                  4. Compete in events for a chance to make it onto the podium!
                </li>
              </ul>
            </div>
          </section>
          <section className="flex w-1/2 cursor-pointer justify-center md:w-1/2">
            <Link
              href="/events"
              className="flex flex-col items-center gap-4 rounded-xl bg-sky-400 p-6 font-clayno text-4xl hover:animate-wiggle"
            >
              <Image
                src="/images/start.jpeg"
                width="300"
                height="300"
                alt="2024 Winter Olympics"
                className="rounded-lg hover:scale-105"
              />
              <div> {`Let's go`}</div>
            </Link>
          </section>
          <section className="flex w-full flex-col items-center justify-center rounded-xl bg-blue-950 p-4 pb-12 md:w-3/4">
            <div className="py-4 font-clayno text-2xl text-white">
              Hosted by
            </div>
            <div className="flex w-full flex-row items-center justify-center gap-8">
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
                className="relative aspect-[3/1] w-[600px] overflow-hidden hover:scale-105"
              >
                <Image
                  src="/images/claynoclub_banner.jpeg"
                  alt="Clayno.club"
                  fill
                  className="rounded-xl"
                ></Image>
                <div className="absolute left-5 top-5 rounded-lg bg-blue-950 px-4 py-2 font-clayno text-2xl text-white">
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
