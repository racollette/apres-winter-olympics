import {
  type Discord,
  type Twitter,
  type Telegram,
  type Wallet,
} from "@prisma/client";

type UserWithSocials =
  | {
      discord: Discord | null;
      twitter: Twitter | null;
      telegram: Telegram | null;
      id: string;
      defaultAddress: string;
      wallets: Wallet[];
    }
  | undefined
  | null;

export const extractProfileFromUser = (user: UserWithSocials) => {
  const favoriteDomain = user?.wallets
    .map((wallet) => (wallet.favoriteDomain ? wallet.favoriteDomain : null))
    .filter((domain) => domain !== null)[0];

  const username = user?.twitter
    ? user.twitter.private === true
      ? user.twitter.global_name
      : user.twitter.username
    : user?.discord
    ? user.discord.username
    : user?.telegram && user.telegram.isActive
    ? user.telegram.private === true
      ? user.telegram.global_name
      : user.telegram.username
    : user?.defaultAddress ?? null;
  const userHandle = user?.twitter
    ? user.twitter.global_name
    : user?.discord
    ? user.discord.global_name
    : user?.telegram && user.telegram.isActive
    ? user.telegram.global_name
    : null;
  const userPFP = user?.twitter
    ? user.twitter.image_url
    : user?.discord
    ? user.discord.image_url
    : user?.telegram && user.telegram.isActive
    ? user.telegram.image_url
    : null;

  return {
    userId: user?.id ?? null,
    username,
    userHandle,
    userPFP,
    favoriteDomain,
  };
};

export const getFavoriteDomain = (wallets: Wallet[]) => {
  const favoriteDomain = wallets
    .map((wallet) => (wallet.favoriteDomain ? wallet.favoriteDomain : null))
    .filter((domain) => domain !== null)[0];

  return favoriteDomain;
};
