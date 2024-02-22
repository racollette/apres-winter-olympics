import { useWallet } from "@solana/wallet-adapter-react";
import { useSession } from "next-auth/react";
import { useUser } from "./useUser";
import { useState } from "react";
import { useFetchUserWallets } from "./useFetchUserWallets";
import { Character } from "~/utils/inventory";
import { extractProfileFromUser } from "~/utils/wallet";
import { api } from "~/utils/api";

export const useItems = () => {
  const { publicKey } = useWallet();

  const { user } = useUser();
  const { username } = extractProfileFromUser(user);

  const { data: session } = useSession();
  const account = username ?? session?.user.name ?? publicKey?.toString();
  const { wallets } = useFetchUserWallets(account);

  const { data: holders, isLoading } = api.inventory.getUserItems.useQuery({
    wallets: wallets,
  });

  let dinos = holders?.[0]?.mints;
  // let clay = holders?.[0]?.clay;
  // let claymakers = holders?.[0]?.claymakers;
  // let consumables = holders?.[0]?.consumables;

  if (holders) {
    for (let i = 1; i < holders.length; i++) {
      if (holders[i] && holders?.[i]?.mints) {
        dinos = dinos?.concat(holders?.[i]?.mints ?? []);
        // claymakers = claymakers?.concat(holders?.[i]?.claymakers ?? []);
        // clay = clay?.concat(holders?.[i]?.clay ?? []);
        // consumables = consumables?.concat(holders?.[i]?.consumables ?? []);
      }
    }
  }

  return { dinos, isLoading };
};
