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
import { extractProfileFromUser } from "~/utils/wallet";

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
    <div>
      <div>{event.name}</div>
      <table className="w-full table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">Username</th>
            <th className="px-4 py-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {event.results.map((result) => {
            const { username } = extractProfileFromUser(result.user);
            return (
              <tr key={result.id}>
                <td className="flex items-center gap-4">
                  <Image
                    src={`https://prod-image-cdn.tensor.trade/images/slug=claynosaurz/400x400/freeze=false/${result?.dino?.pfp}`}
                    alt={username as string}
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <div>{username}</div>
                </td>
                <td>{result.score}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
