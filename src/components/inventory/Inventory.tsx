import { useEffect, useState } from "react";
import Layout from "~/components/Layout";
import { api } from "~/utils/api";
import Item from "./Item";
import { sortByRarity, type Character } from "~/utils/inventory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/@/components/ui/select";
import Link from "next/link";
import Image from "next/image";
import { sortByAttribute } from "~/utils/inventory";
import { useFetchUserWallets } from "~/hooks/useFetchUserWallets";
import { groupByColor, groupByEdition, groupBySymbol } from "~/utils/inventory";
import MetaTags from "~/components/MetaTags";
import { HiExternalLink, HiReply } from "react-icons/hi";
import { shortAccount } from "~/utils/addresses";
import { getQueryString } from "~/utils/routes";
import { useSession } from "next-auth/react";
import { useWallet } from "@solana/wallet-adapter-react";

const Inventory = ({ username }: { username: string | null }) => {
  const { data: session } = useSession();
  const { publicKey } = useWallet();

  const account = username ?? session?.user.name ?? publicKey?.toString();

  const { wallets } = useFetchUserWallets(account);

  const [originalSpecies, setOriginalSpecies] = useState<Character[]>([]);
  const [sagaSpecies, setSagaSpecies] = useState<Character[]>([]);

  // const favoriteDomain = getFavoriteDomain(wallets)

  const { data: holders, isLoading } = api.inventory.getUserItems.useQuery({
    wallets: wallets,
  });

  let dinos = holders?.[0]?.mints;
  let clay = holders?.[0]?.clay;
  let claymakers = holders?.[0]?.claymakers;
  let consumables = holders?.[0]?.consumables;

  if (holders) {
    for (let i = 1; i < holders.length; i++) {
      if (holders[i] && holders?.[i]?.mints) {
        dinos = dinos?.concat(holders?.[i]?.mints ?? []);
        claymakers = claymakers?.concat(holders?.[i]?.claymakers ?? []);
        clay = clay?.concat(holders?.[i]?.clay ?? []);
        consumables = consumables?.concat(holders?.[i]?.consumables ?? []);
      }
    }
  }

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

  const handleSort = (attribute: string) => {
    if (attribute === "rarity") {
      setOriginalSpecies(sortByRarity(originalSpecies));
      setSagaSpecies(sortByRarity(sagaSpecies));
    }

    const originalSorted = sortByAttribute([...originalSpecies], attribute);
    setOriginalSpecies(originalSorted);

    const sagaSorted = sortByAttribute([...sagaSpecies], attribute);
    setSagaSpecies(sagaSorted);
  };

  return (
    <>
      <section className="flex flex-col items-center justify-center gap-y-8 text-white md:container md:p-2">
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-row justify-between">
            <div className="font-clayno text-lg md:text-2xl">
              Claynosaurz {`(${originalSpecies?.length})`}
            </div>
            <div>
              <Select onValueChange={(v) => handleSort(v)}>
                <SelectTrigger className="w-[100px] font-clayno text-sm md:w-[180px]">
                  <SelectValue placeholder="Rarity" />
                </SelectTrigger>
                <SelectContent className=" font-clayno text-sm">
                  <SelectItem value="rarity">Rarity</SelectItem>
                  <SelectItem value="species">Species</SelectItem>
                  <SelectItem value="skin">Skin</SelectItem>
                  <SelectItem value="color">Color</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mb-8 flex flex-row flex-wrap gap-2">
            {originalSpecies?.map((dino: any) => (
              <div key={dino.mint}>
                <Item item={dino} type={"dino"} />
              </div>
            ))}
          </div>
          <div className="font-clayno text-lg md:text-2xl">
            Call of Saga {`(${sagaSpecies?.length})`}
          </div>
          <div className="mb-8 flex flex-row flex-wrap gap-2">
            {sagaSpecies?.map((dino: any) => (
              <div key={dino.mint}>
                <Item item={dino} type={"dino"} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Inventory;
