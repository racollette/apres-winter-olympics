import { z } from "zod";
import { prisma } from "../../db";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const memeRouter = createTRPCRouter({
  getAllMemes: publicProcedure.query(async ({ input }) => {
    const memes = await prisma.meme.findMany({});

    return memes;
  }),

  getMemeVoter: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const memeVoter = await prisma.memeVoter.findUnique({
        where: {
          userId: input.userId,
        },
        select: {
          id: true,
          votesCast: true,
          votes: {
            select: {
              id: true,
            },
          },
        },
      });

      return memeVoter;
    }),

  castVote: protectedProcedure
    .input(z.object({ userId: z.string(), memeId: z.string() }))
    .mutation(async ({ input }) => {
      let voter = await prisma.memeVoter.findUnique({
        where: {
          userId: input.userId,
        },
      });

      if (voter) {
        if (voter.votesCast >= 3) {
          return new Error("You have already cast 3 votes");
        }

        voter = await prisma.memeVoter.update({
          where: {
            userId: input.userId,
          },
          data: {
            votesCast: {
              increment: 1,
            },
            votes: {
              connect: {
                id: input.memeId,
              },
            },
          },
        });
      } else {
        voter = await prisma.memeVoter.create({
          data: {
            userId: input.userId,
            votesCast: 1,
            totalVotes: 3,
            votes: {
              connect: {
                id: input.memeId,
              },
            },
          },
        });
      }
    }),

  removeVote: protectedProcedure
    .input(z.object({ userId: z.string(), memeId: z.string() }))
    .mutation(async ({ input }) => {
      const voter = await prisma.memeVoter.findUnique({
        where: {
          userId: input.userId,
        },
      });

      if (voter && voter.votesCast <= 1) {
        await prisma.memeVoter.delete({
          where: {
            userId: input.userId,
          },
        });
      } else {
        await prisma.memeVoter.update({
          where: {
            userId: input.userId,
          },
          data: {
            votesCast: {
              decrement: 1,
            },
            votes: {
              disconnect: {
                id: input.memeId,
              },
            },
          },
        });
      }
    }),

  // createVoter: protectedProcedure
  //   .input(z.object({ userId: z.string(), wallets: z.array(z.string()) }))
  //   .mutation(async ({ ctx, input }) => {
  //     // Create a new user in the database
  //     try {
  //       const checkHolderStatus = await ctx.prisma.holder.findFirst({
  //         where: {
  //           owner: {
  //             in: input.wallets,
  //           },
  //         },
  //       });

  //       const dinosOwned = checkHolderStatus?.amount || 0;
  //       const votesToIssue = dinosOwned > 0 ? 20 : 0;
  //       const createdVoter = await ctx.prisma.voter.create({
  //         data: {
  //           votesAvailable: votesToIssue,
  //           votesCast: 0,
  //           userId: input.userId,
  //           votesIssued: votesToIssue > 0,
  //         },
  //       });
  //       return createdVoter;
  //     } catch (error) {
  //       throw new Error("Failed to create voter");
  //     }

  //     // return userResponseSchema.parse(createdUser);
  //   }),

  // issueVotes: protectedProcedure
  //   .input(z.object({ userId: z.string(), wallets: z.array(z.string()) }))
  //   .mutation(async ({ ctx, input }) => {
  //     // Create a new user in the database
  //     try {
  //       const checkHolderStatus = await ctx.prisma.holder.findFirst({
  //         where: {
  //           owner: {
  //             in: input.wallets,
  //           },
  //         },
  //       });

  //       const dinosOwned = checkHolderStatus?.amount || 0;
  //       const votesToIssue = dinosOwned > 0 ? 20 : 0;
  //       const issueVotes = await ctx.prisma.voter.update({
  //         where: {
  //           userId: input.userId,
  //         },
  //         data: {
  //           votesAvailable: votesToIssue,
  //           votesIssued: votesToIssue > 0,
  //         },
  //       });
  //       return issueVotes;
  //     } catch (error) {
  //       throw new Error("Failed to issue votes");
  //     }

  //     // return userResponseSchema.parse(createdUser);
  //   }),

  // getVoterInfo: protectedProcedure
  //   .input(z.object({ userId: z.string() }))
  //   .query(({ ctx, input }) => {
  //     return ctx.prisma.voter.findUnique({
  //       where: {
  //         userId: input.userId,
  //       },
  //       include: {
  //         votes: true,
  //       },
  //     });
  //   }),

  // castVote: protectedProcedure
  //   .input(z.object({ userId: z.string(), herdId: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     const existingVotes = await ctx.prisma.voter.findUnique({
  //       where: {
  //         userId: input.userId,
  //       },
  //     });

  //     const votesAvailable = existingVotes && existingVotes?.votesAvailable > 0;

  //     if (votesAvailable) {
  //       return await ctx.prisma.voter.update({
  //         where: {
  //           userId: input.userId,
  //         },
  //         data: {
  //           votes: {
  //             connect: { id: input.herdId },
  //           },
  //           votesAvailable: {
  //             decrement: 1,
  //           },
  //           votesCast: {
  //             increment: 1,
  //           },
  //         },
  //       });
  //     }
  //   }),

  // removeVote: protectedProcedure
  //   .input(z.object({ userId: z.string(), herdId: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     const existingVotes = await ctx.prisma.voter.findUnique({
  //       where: {
  //         userId: input.userId,
  //       },
  //     });

  //     const votesCast = existingVotes && existingVotes?.votesCast > 0;

  //     if (votesCast) {
  //       return await ctx.prisma.voter.update({
  //         where: {
  //           userId: input.userId,
  //         },
  //         data: {
  //           votes: {
  //             disconnect: { id: input.herdId },
  //           },
  //           votesAvailable: {
  //             increment: 1,
  //           },
  //           votesCast: {
  //             decrement: 1,
  //           },
  //         },
  //       });
  //     }
  //   }),
});
