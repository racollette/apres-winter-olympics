import Link from "next/link";
import Metatags from "~/components/MetaTags";
import Image from "next/image";
import { useUser } from "~/hooks/useUser";
import { extractProfileFromUser } from "~/utils/wallet";
import LoginModal from "~/components/LoginModal";
import Inventory from "~/components/inventory/Inventory";

export default function Home() {
  const { user } = useUser();
  const { username } = extractProfileFromUser(user);

  return (
    <>
      <Metatags
        title="Clayno Winter Olympics"
        description="2024 Claynosaurz Winter Olympics. Sponsored by Apres Mountain Lodge and Clayno.club"
      />
      <main className="bg-white text-black">
        <div className="flex flex-col gap-12 p-4 pb-16 md:container">
          <section className="flex flex-col items-center justify-center gap-4 rounded-xl px-4 py-12 md:flex-row md:gap-8">
            <div className="flex w-full flex-col gap-4">
              <div className="flex flex-row items-center gap-2">
                <h2 className="font-clayno text-3xl">Clayno Winter Olympics</h2>
              </div>
              <LoginModal />
              {user && <Inventory username={username} />}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
