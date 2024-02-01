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
                <Inventory username={username} />
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
