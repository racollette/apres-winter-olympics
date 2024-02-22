import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import Item from "./Item";
import { sortByRarity, type Character } from "~/utils/inventory";
import { sortByAttribute } from "~/utils/inventory";
import { useFetchUserWallets } from "~/hooks/useFetchUserWallets";
import { useSession } from "next-auth/react";
import { useWallet } from "@solana/wallet-adapter-react";
import useGame from "~/stores/useGame";
import { useItems } from "~/hooks/useItems";

const Inventory = ({
  username,
  userId,
}: {
  username: string | null;
  userId: string;
}) => {
  const { dinos, isLoading } = useItems();

  const [originalSpecies, setOriginalSpecies] = useState<Character[]>([]);
  const [sagaSpecies, setSagaSpecies] = useState<Character[]>([]);
  const [selected, setSelected] = useState<Character | null>(null);

  useEffect(() => {
    const originalSpecies = dinos?.filter(
      (dino) =>
        dino?.attributes?.species !== "Spino" &&
        dino?.attributes?.species !== "Para"
    );

    setOriginalSpecies(originalSpecies ?? []);

    const sagaSpecies = dinos?.filter(
      (dino) =>
        dino?.attributes?.species === "Spino" ||
        dino?.attributes?.species === "Para"
    );
    setSagaSpecies(sagaSpecies ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // const handleSort = (attribute: string) => {
  //   if (attribute === "rarity") {
  //     setOriginalSpecies(sortByRarity(originalSpecies));
  //     setSagaSpecies(sortByRarity(sagaSpecies));
  //   }

  //   const originalSorted = sortByAttribute([...originalSpecies], attribute);
  //   setOriginalSpecies(originalSorted);

  //   const sagaSorted = sortByAttribute([...sagaSpecies], attribute);
  //   setSagaSpecies(sagaSorted);
  // };

  const playerInformation = useGame((state) => state.playerInformation);

  useEffect(() => {
    if (selected) {
      playerInformation(userId, selected);
    }
  }, [selected, userId]);

  return (
    <>
      <section className="flex flex-col items-center justify-center gap-y-8 text-white md:container md:p-2">
        <div className="hidden md:block">
          <div className="flex w-full flex-col gap-4">
            <div className="flex flex-row justify-between">
              <div className="font-clayno text-lg md:text-2xl">
                Claynosaurz {`(${originalSpecies?.length})`}
              </div>
            </div>
            <div className="mb-8 flex flex-row flex-wrap gap-2">
              {originalSpecies?.map((dino: Character) => (
                <div
                  key={dino.mint}
                  onClick={() => setSelected(dino)}
                  className={`overflow-clip rounded-xl border-4 ${
                    selected === dino ? `border-sky-400` : `border-transparent`
                  }`}
                >
                  <Item item={dino} type={"dino"} />
                </div>
              ))}
            </div>
            <div className="font-clayno text-lg md:text-2xl">
              Call of Saga {`(${sagaSpecies?.length})`}
            </div>
            <div className="font-semibold italic text-white">
              Note: 3D models for Sagas are not yet available, so you'll be
              provided with a default Rex for use in game. However, your Saga
              will still show up on the leaderboard.
            </div>
            <div className="mb-8 flex flex-row flex-wrap gap-2">
              {sagaSpecies?.map((dino: any) => (
                <div
                  key={dino.mint}
                  onClick={() => setSelected(dino)}
                  className={`overflow-clip rounded-xl border-4 ${
                    selected === dino ? `border-sky-400` : `border-transparent`
                  }`}
                >
                  <Item item={dino} type={"dino"} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Inventory;
