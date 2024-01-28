import { z } from "zod";
import { prisma } from "../../db";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const generalRouter = createTRPCRouter({
  getHolderDinos: protectedProcedure
    .input(z.object({ wallets: z.array(z.string()) }))
    .query(async ({ input }) => {
      return prisma.holder.findMany({
        where: {
          owner: {
            in: input.wallets,
          },
        },
        include: {
          mints: true,
        },
      });
    }),
});
