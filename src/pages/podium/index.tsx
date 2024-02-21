import Metatags from "~/components/MetaTags";
import Header from "~/components/Header";

export default function Podium() {
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
              Podium
            </h1>
            <div className="flex w-full flex-col items-center  justify-center gap-4 rounded-lg bg-purple-900 p-2 md:w-[650px] md:p-6">
              <p className="text-xs">
                The podium standing will be updated once the results of each
                event are finalized.
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
