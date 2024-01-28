import { useEffect, useState } from "react";
import Layout from "~/components/Layout";
import { api } from "~/utils/api";
import Item from "../../../components/inventory/Item";
import { sortByRarity, type Character } from "~/utils/sort";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/@/components/ui/select";
import Link from "next/link";
import Image from "next/image";
import { sortByAttribute } from "~/utils/sort";
import { useRouter } from "next/router";
import { useFetchUserWallets } from "~/hooks/useFetchUserWallets";
import { groupByColor, groupByEdition, groupBySymbol } from "~/utils/inventory";
import { HiRefresh } from "react-icons/hi";
import { zip } from "~/utils/zip";
import MetaTags from "~/components/MetaTags";
import { HiExternalLink, HiReply } from "react-icons/hi";
import { shortAccount } from "~/utils/addresses";
import { getQueryString } from "~/utils/routes";

const Inventory = () => {
  const router = useRouter();
  const { account } = router.query;

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
      <MetaTags title="Clayno.club | Inventory" />
      <Layout>
        <section className="flex flex-col items-center justify-center gap-y-8 md:container md:p-2">
          <div className="relative flex w-full flex-row items-center justify-center gap-2">
            <Link href={`/inventory`} className="absolute left-0 top-2">
              <HiReply size={30} />
            </Link>
            <div className="flex flex-col gap-2">
              <div className="font-clayno text-lg md:text-2xl">
                {account
                  ? account.length > 36
                    ? `${shortAccount(getQueryString(account))}'s Inventory`
                    : `${account}'s Inventory`
                  : `Inventory`}
              </div>
              <div className="flex flex-row items-center justify-center gap-4">
                <Link
                  href={`/profile/${account}`}
                  className="text-md flex flex-row items-center justify-center gap-1 font-clayno hover:scale-125"
                >
                  <HiExternalLink size={16} className="inline-block" />
                  Profile
                </Link>
                <Link
                  href={`https://tensor.trade/portfolio?wallet=${wallets[0]}`}
                  target="_blank"
                >
                  <Image
                    src="/icons/tensor.svg"
                    width={24}
                    height={24}
                    alt="Tensor"
                    className="hover:scale-125"
                  />
                </Link>
                <Link
                  href={`https://magiceden.io/u/${wallets[0]}`}
                  target="_blank"
                >
                  <Image
                    src="/icons/magic_eden.svg"
                    width={24}
                    height={24}
                    alt="Magic Eden"
                    className="hover:scale-125"
                  />
                </Link>
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col gap-4">
            <div className="flex flex-row justify-between">
              <div className="font-clayno text-lg text-white md:text-2xl">
                Claynosaurz {`(${originalSpecies?.length})`}
              </div>
              <div>
                <Select onValueChange={(v) => handleSort(v)}>
                  <SelectTrigger className="w-[100px] bg-black font-clayno text-sm text-white md:w-[180px]">
                    <SelectValue placeholder="Rarity" />
                  </SelectTrigger>
                  <SelectContent className="bg-black font-clayno text-sm text-white">
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
              {originalSpecies?.length > 1 && (
                <div className="flex h-28 w-28 flex-col items-center justify-center gap-2 rounded-md lg:h-40 lg:w-40">
                  <p className="font-clayno text-sm text-white md:text-lg">
                    Download All
                  </p>
                  <DownloadButton
                    data={originalSpecies}
                    type="gif"
                    backgroundColor={`bg-pink-500`}
                  />
                  <DownloadButton
                    data={originalSpecies}
                    type="pfp"
                    backgroundColor={`bg-cyan-600`}
                  />
                </div>
              )}
            </div>
            <div className="font-clayno text-lg text-white md:text-2xl">
              Call of Saga {`(${sagaSpecies?.length})`}
            </div>
            <div className="mb-8 flex flex-row flex-wrap gap-2">
              {sagaSpecies?.map((dino: any) => (
                <div key={dino.mint}>
                  <Item item={dino} type={"dino"} />
                </div>
              ))}
              {sagaSpecies?.length > 1 && (
                <div className="flex h-28 w-28 flex-col items-center justify-center gap-2 rounded-md lg:h-40 lg:w-40">
                  <p className="font-clayno text-sm text-white md:text-lg">
                    Download All
                  </p>
                  <DownloadButton
                    data={sagaSpecies}
                    type="gif"
                    backgroundColor={`bg-pink-500`}
                  />
                  <DownloadButton
                    data={sagaSpecies}
                    type="pfp"
                    backgroundColor={`bg-cyan-600`}
                  />
                </div>
              )}
            </div>
            <div className="font-clayno text-lg text-white md:text-2xl">
              Clay {`(${clay?.length})`}
            </div>
            <div className="mb-8 flex flex-row flex-wrap gap-2">
              {/* Grouping clays by color */}
              {clay && (
                <>
                  {Object.keys(groupByColor(clay)).map((color) => {
                    const firstClay = groupByColor(clay ?? [])[color][0];
                    const colorCount = groupByColor(clay ?? [])[color].length;
                    return (
                      <div
                        key={color}
                        className="relative flex flex-row flex-wrap gap-2"
                      >
                        <Item item={firstClay} type={"clay"} />
                        <p className="absolute left-2 top-2 font-clayno text-2xl text-white">
                          {colorCount}
                        </p>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
            <div className="font-clayno text-lg text-white md:text-2xl">
              Claymakers {`(${claymakers?.length})`}
            </div>
            <div className="mb-8 flex flex-row flex-wrap gap-2">
              {/* Grouping clays by color */}
              {claymakers && (
                <>
                  {Object.keys(groupByEdition(claymakers)).map((edition) => {
                    if (edition === "First" || edition === "Limited") {
                      const firstClaymaker = groupByEdition(claymakers ?? [])[
                        edition
                      ][0];
                      const editionCount = groupByEdition(claymakers ?? [])[
                        edition
                      ].length;
                      return (
                        <div
                          key={edition}
                          className="relative order-first flex flex-row flex-wrap gap-2"
                        >
                          <Item item={firstClaymaker} type={"claymaker"} />
                          <p className="absolute left-2 top-2 font-clayno text-2xl text-white">
                            {editionCount}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <>
                        {groupByEdition(claymakers ?? [])["Deluxe"].map(
                          (claymaker: any) => (
                            <div key={claymaker.mint} className="relative">
                              <Item item={claymaker} type={"claymaker"} />
                              <p className="absolute bottom-2 right-2 font-clayno text-xl text-white">
                                {claymaker.charges}/5
                              </p>
                            </div>
                          )
                        )}
                      </>
                    );
                  })}
                </>
              )}
            </div>
            <div className="font-clayno text-lg text-white md:text-2xl">
              Consumables {`(${consumables?.length})`}
            </div>
            <div className="mb-8 flex flex-row flex-wrap gap-2">
              {consumables && (
                <>
                  {Object.keys(groupBySymbol(consumables)).map((symbol) => {
                    if (symbol !== "ART") {
                      const firstConsumable = groupBySymbol(consumables ?? [])[
                        symbol
                      ][0];
                      const symbolCount = groupBySymbol(consumables ?? [])[
                        symbol
                      ].length;
                      return (
                        <div
                          key={symbol}
                          className="relative flex flex-row flex-wrap gap-2"
                        >
                          <Item item={firstConsumable} type={"consumable"} />
                          <p className="absolute left-2 top-2 font-clayno text-2xl text-white">
                            {symbolCount}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <>
                        {groupBySymbol(consumables ?? [])["ART"].map(
                          (artifact: any) => (
                            <div key={artifact.mint} className="relative">
                              <Item item={artifact} type={"consumable"} />
                            </div>
                          )
                        )}
                      </>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Inventory;

function DownloadButton({
  data,
  type,
  backgroundColor,
}: {
  data: Character[];
  type: string;
  backgroundColor: string;
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (items: Character[], type: string) => {
    setIsDownloading(true);
    await zip(items, type);
    setIsDownloading(false);
  };

  return (
    <button
      onClick={() => handleDownload(data, type)}
      className={`w-4/5 rounded-lg px-4 py-2 ${backgroundColor}`}
    >
      {}
      {isDownloading ? (
        <div className="flex flex-row items-center justify-center gap-1">
          <p className="font-clayno text-xs">Fetching</p>
          <HiRefresh size={16} className="ml-2 inline-block animate-spin" />
        </div>
      ) : (
        <div>
          <p className="font-clayno text-xs">{type}s</p>
        </div>
      )}
    </button>
  );
}
