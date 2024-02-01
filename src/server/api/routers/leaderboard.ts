import { z } from "zod";
import { prisma } from "../../db";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const leaderboardRouter = createTRPCRouter({
  getAllEvents: publicProcedure
    .input(z.object({ competitionId: z.number() }))
    .query(async ({ input }) => {
      const events = await prisma.event.findMany({
        where: {
          competitionId: input.competitionId,
        },
        include: {
          results: {
            include: {
              user: {
                include: {
                  discord: true,
                  twitter: true,
                  telegram: true,
                  wallets: true,
                },
              },
              dino: true,
            },
            orderBy: {
              score: "desc",
            },
          },
        },
      });

      return events;
    }),
});
