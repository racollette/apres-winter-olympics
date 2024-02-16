import {
  type Result,
  type Event,
  type Dino,
  type User,
  type Discord,
  type Twitter,
  type Telegram,
  type Wallet,
} from "@prisma/client";
import Image from "next/image";
import { truncateAccount } from "~/utils/addresses";
import { extractProfileFromUser } from "~/utils/wallet";
import { handleUserPFPDoesNotExist } from "~/utils/images";

type EventResultsProps = {
  event: Event & {
    results: (Result & {
      dino: Dino | null;
      user: User & {
        discord: Discord | null;
        twitter: Twitter | null;
        telegram: Telegram | null;
        wallets: Wallet[];
      };
    })[];
  };
};

export const EventResults = ({ event }: EventResultsProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-purple-900 p-6 font-clayno">
      <div className="text-xl font-extrabold">{event.name}</div>
      <table className="w-full table-auto border-separate border-spacing-2">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Rank</th>
            <th className="px-4 py-2 text-left">Player</th>
            <th className="px-4 py-2 text-left">Clayno</th>
            <th className="px-4 py-2 text-left">{event.scoringType}</th>
          </tr>
        </thead>
        <tbody>
          {event.results.map((result, idx) => {
            const { username, userPFP, userHandle } = extractProfileFromUser(
              result.user
            );
            return (
              <tr key={result.id}>
                <td className="px-4">
                  <div className="max-w-xs">{idx + 1}</div>
                </td>
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <Image
                      src={
                        userPFP ??
                        `https://ui-avatars.com/api/?name=${result.user.defaultAddress}&background=random`
                      }
                      alt={username as string}
                      width={32}
                      height={32}
                      className="rounded-full"
                      onError={handleUserPFPDoesNotExist}
                    />
                    <div className="max-w-xs">
                      {" "}
                      {userHandle
                        ? userHandle
                        : truncateAccount(result.user.defaultAddress)}
                    </div>
                  </div>
                </td>
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <Image
                      src={`https://prod-image-cdn.tensor.trade/images/slug=claynosaurz/400x400/freeze=false/${result?.dino?.gif}`}
                      alt={result?.dino?.name as string}
                      width={50}
                      height={50}
                      className="rounded-xl"
                    />
                    {/* <div className="max-w-xs">
                      {result?.dino?.name.split(" ")[1]}
                    </div> */}
                  </div>
                </td>
                <td className="px-4">
                  <div className="max-w-xs">{result.score.toFixed(2)}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
