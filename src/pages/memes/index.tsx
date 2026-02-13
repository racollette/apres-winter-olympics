import Metatags from "~/components/MetaTags";
import Header from "~/components/Header";
import { api } from "~/utils/api";
import Image from "next/image";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useUser } from "~/hooks/useUser";
import { useState } from "react";
import { useToast } from "~/@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { useItems } from "~/hooks/useItems";
import { OLYMPICS_ENDED } from "~/utils/constants";

export default function Memes() {
  const { toast } = useToast();

  const [castVoteLoading, setCastVoteLoading] = useState(false);
  const [removeVoteLoading, setRemoveVoteLoading] = useState(false);

  const { user } = useUser();
  const { dinos } = useItems();
  const { status: sessionStatus } = useSession();
  const { data: memes } = api.memes.getAllMemes.useQuery();
  const { data: memeVoter, refetch } = api.memes.getMemeVoter.useQuery({
    userId: user?.id ?? "none",
  });

  const memes2 = memes?.concat(memes).concat(memes).concat(memes).concat(memes);

  const utils = api.useContext();
  const castVote = api.memes.castVote.useMutation({
    onSettled() {
      // Sync with server once mutation has settled
      utils.memes.getAllMemes.invalidate();
      setTimeout(() => {
        toast({
          title: "Vote cast!",
        });
        setCastVoteLoading(false);
        refetch();
      }, 1000);
    },
  });

  const handleCastVote = (memeId: string) => {
    if (castVoteLoading || removeVoteLoading) {
      return;
    }

    if (OLYMPICS_ENDED) {
      toast({
        title: "Voting has ended!",
      });
      return;
    }

    if (sessionStatus === "unauthenticated") {
      toast({
        title: "Sign in first!",
      });
      return;
    }

    if (!dinos || dinos.length === 0) {
      toast({
        title: "Sorry, you need to own a Clayno to vote. 😔",
      });
      return;
    }

    if (memeVoter && memeVoter.votesCast >= 3) {
      toast({
        title: "No votes remaining!",
      });
      return;
    }

    if (memeVoter?.votesCast === null) {
      toast({
        title: "Could not retrieve voter status",
        description: "Please try again",
        variant: "destructive",
      });
      return;
    }

    if (user) {
      try {
        setCastVoteLoading(true);
        castVote.mutate({ userId: user.id, memeId });
      } catch (error) {
        console.error("Error casting vote:", error);
        toast({
          title: "An error occurred while casting your vote.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Must be signed in to vote!",
        variant: "destructive",
      });
    }
  };

  const removeVote = api.memes.removeVote.useMutation({
    onSettled() {
      // Sync with server once mutation has settled
      utils.memes.getAllMemes.invalidate();
      setTimeout(() => {
        toast({
          title: "Vote removed!",
        });
        setRemoveVoteLoading(false);
        refetch();
      }, 1000);
    },
  });

  const handleRemoveVote = (memeId: string) => {
    if (castVoteLoading || removeVoteLoading) {
      return;
    }

    if (OLYMPICS_ENDED) {
      toast({
        title: "Voting has ended!",
      });
      return;
    }

    if (memeVoter?.votesCast === null) {
      toast({
        title: "Could not retrieve voter status",
        description: "Please try again",
        variant: "destructive",
      });
      return;
    }

    if (user) {
      try {
        setRemoveVoteLoading(true);
        removeVote.mutateAsync({ userId: user.id, memeId });
        // toast({
        //   title: "Vote removed!",
        // });
      } catch (error) {
        console.error("Error removing vote:", error);
        toast({
          title: "An error occurred while removing your vote.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Must be signed in to vote!",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Metatags
        title="Apres Winter Olympics"
        description="2024 Apres Winter Olympics. Sponsored by Apres Mountain Lodge and Clayno.club"
      />
      <Header />
      <main className="text-white">
        <div className="flex flex-col items-center justify-center gap-4 p-1 pb-16 md:p-4">
          <section className="flex w-full flex-col items-center justify-center gap-2 rounded-xl bg-blue-950 p-4">
            <h1 className="pt-2 font-clayno text-2xl font-extrabold md:text-3xl">
              Meme Contest Voting
            </h1>
            <div className="flex w-full flex-col items-center justify-center gap-2">
              <p className="text-md font-semibold">
                Vote for your top 3 favorite memes!
              </p>
              <p className="text-xs italic">
                (Must hold an OG or Saga Clayno to participate)
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {memes?.map((meme) => {
                const isVoted = memeVoter?.votes?.some(
                  (vote) => vote.id === meme.id
                );

                return (
                  <div key={meme.id} className="relative flex items-end">
                    <Image
                      src={meme.url}
                      alt={`Meme ${meme.id}`}
                      // className="object-contain"
                      width={500}
                      height={500}
                    />
                    {!isVoted ? (
                      <ArrowUpCircle
                        size={45}
                        color="#097a1c"
                        className="absolute bottom-3 right-3 cursor-pointer rounded-full bg-emerald-400 hover:scale-125"
                        onClick={() => handleCastVote(meme.id)}
                      />
                    ) : (
                      <ArrowDownCircle
                        size={45}
                        color="#69120c"
                        className="absolute bottom-3 right-3 cursor-pointer rounded-full bg-red-400 hover:scale-125"
                        onClick={() => handleRemoveVote(meme.id)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
