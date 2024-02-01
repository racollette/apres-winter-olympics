import Link from "next/link";
import Metatags from "~/components/MetaTags";
import Image from "next/image";
import { useUser } from "~/hooks/useUser";
import { extractProfileFromUser } from "~/utils/wallet";
import LoginModal from "~/components/LoginModal";
import Inventory from "~/components/inventory/Inventory";
import Header from "~/components/Header";
import useGame from "~/stores/useGame";
import { set } from "zod";
import { useEffect, useState } from "react";
import { type Dino } from "@prisma/client";

export default function Home() {
  const { user } = useUser();
  const { username } = extractProfileFromUser(user);
  const [selected, setSelected] = useState<Dino | null>(null);

  const userId = useGame((state) => state.userId);
  const dino = useGame((state) => state.dino);

  console.log(userId);
  console.log(dino);

  const [gameLink, setGameLink] = useState<string>("");

  useEffect(() => {
    setSelected(dino);
    if (dino?.attributes?.species && dino?.attributes?.mood && dino?.name) {
      const encodedSpecies = btoa(dino.attributes.species.toLowerCase());
      const encodedMood = btoa(dino.attributes.mood.toLowerCase());
      const encodedNumber = btoa(dino.name.split("#")[1]);
      setGameLink(
        `/slalom?species=${encodedSpecies}&mood=${encodedMood}&number=${encodedNumber}`
      );
    }
  }, [dino]);

  return (
    <>
      <Metatags
        title="Apres Winter Olympics"
        description="2024 Apres Claynosaurz Winter Olympics. Sponsored by Apres Mountain Lodge and Clayno.club"
      />
      <Header />
      <main
        className="text-white"
        // style={{
        //   background: `url('/textures/apres_triangles.png')`,
        //   backgroundSize: `100%`,
        // }}
      >
        <div className="flex flex-col items-center justify-center gap-12 p-4 pb-16">
          <section className="flex w-full flex-col items-center justify-center gap-8 rounded-xl bg-blue-950 p-4 md:w-3/4">
            {user ? (
              <div className="flex flex-col items-center justify-center gap-2 p-4">
                <div className="font-clayno text-3xl">Select your clayno!</div>
                {gameLink && (
                  <div className="mt-2 flex w-full justify-center">
                    <Link
                      href={gameLink}
                      className="w-full animate-pulse cursor-pointer justify-center rounded-lg bg-purple-800 px-4 py-2 text-center font-clayno text-2xl hover:scale-105"
                    >
                      <div className="flex flex-row items-center justify-center gap-2">
                        <Image
                          src={`https://prod-image-cdn.tensor.trade/images/slug=claynosaurz/400x400/freeze=false/${selected?.pfp}`}
                          alt={`${selected?.name}`}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        Ski!
                      </div>
                    </Link>
                  </div>
                )}

                <Inventory username={username} userId={user.id} />
              </div>
            ) : (
              <div className="flex w-full flex-col items-center justify-center gap-2 pb-6">
                <div className="py-4 font-clayno text-xl md:text-3xl">
                  Sign in to begin!
                </div>
                <div className="flex w-full flex-row justify-center gap-2">
                  <div className="relative aspect-[1/1] w-1/2 md:w-1/4">
                    <Image
                      src="/images/lodge.jpeg"
                      alt="The Lodge"
                      fill
                      className="rounded-lg"
                    />
                  </div>
                  <div className="relative w-1/2 md:w-1/4">
                    <Image
                      src="/images/relax.jpeg"
                      alt="Apres Ski"
                      fill
                      className="rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
