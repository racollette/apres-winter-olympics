import { z } from "zod";
import { prisma } from "../../db";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

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
              score: "asc",
            },
          },
        },
      });

      return events;
    }),

  recordResult: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
        userId: z.string(),
        score: z.number(),
        dinoId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // await prisma.result.deleteMany({});
      const existingResult = await prisma.result.findFirst({
        where: {
          AND: [
            {
              eventId: input.eventId,
            },
            {
              userId: input.userId,
            },
          ],
        },
      });

      if (existingResult) {
        if (existingResult.score > input.score) {
          const updatedResult = await prisma.result.update({
            where: {
              id: existingResult.id,
            },
            data: {
              score: input.score,
              dinoId: input.dinoId,
            },
          });

          return updatedResult;
        }
        return;
      }

      const newResult = await prisma.result.create({
        data: {
          score: input.score,
          dinoId: input.dinoId,
          eventId: input.eventId,
          userId: input.userId,
        },
      });

      return newResult;
    }),
});
