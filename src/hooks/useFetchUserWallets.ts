import { type Wallet } from "@prisma/client";
import { api } from "~/utils/api";
import { getQueryString } from "~/utils/routes";

export const useFetchUserWallets = (account: string | string[] | undefined) => {
  const queryString = getQueryString(account);
  const isWallet = queryString && queryString.length > 32;

  const { data: user } = api.binding.getUser.useQuery({
    type: isWallet ? "wallet" : "twitter",
    id: queryString,
  });

  const wallets = isWallet
    ? [queryString]
    : user?.wallets.map((wallet: Wallet) => wallet.address) ?? [];

  return { wallets };
};
