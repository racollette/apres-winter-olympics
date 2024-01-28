import { z } from "zod";
import { prisma } from "../../db";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

const createUserRequestSchema = z.object({
  address: z.string(),
});

const linkSocialProfileRequestSchema = z.object({
  id: z.string(),
  data: z.object({
    username: z.string(),
    global_name: z.string(),
    image_url: z.string(),
    id: z.string().optional(),
  }),
});

export const bindingRouter = createTRPCRouter({
  getUser: publicProcedure
    .input(z.object({ type: z.string(), id: z.string() }))
    .query(async ({ input }) => {
      if (input.type === "id") {
        const user = await prisma.user.findFirst({
          where: {
            id: input.id,
          },
          include: {
            discord: true,
            twitter: true,
            telegram: true,
            wallets: true,
          },
        });
        return user;
      }

      if (
        input.type === "discord" ||
        input.type === "twitter" ||
        input.type === "telegram"
      ) {
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              {
                discord: {
                  username: {
                    contains: input.id,
                  },
                },
              },
              {
                discord: {
                  global_name: {
                    contains: input.id,
                  },
                },
              },
              {
                twitter: {
                  username: {
                    contains: input.id,
                  },
                },
              },
              {
                twitter: {
                  global_name: {
                    contains: input.id,
                  },
                },
              },
              {
                telegram: {
                  username: {
                    contains: input.id,
                  },
                },
              },
              {
                telegram: {
                  global_name: {
                    contains: input.id,
                  },
                },
              },
            ],
          },
          include: {
            discord: true,
            twitter: true,
            telegram: true,
            wallets: true,
          },
        });

        if (user?.twitter?.private === true) {
          user.twitter.username = "hidden";
        }

        if (user?.telegram?.private === true) {
          user.telegram.username = "hidden";
          user.telegram.telegramId = "hidden";
        }

        return user;
      }

      // if (input.type === "twitter") {
      //   const user = await prisma.user.findFirst({
      //     where: {
      //       twitter: {
      //         global_name: input.id,
      //       },
      //     },
      //     include: {
      //       discord: true,
      //       twitter: true,
      //     },
      //   });
      //   return user;
      // }

      const user = await prisma.user.findFirst({
        where: {
          wallets: {
            some: {
              address: {
                contains: input.id,
              },
            },
          },
        },
        include: {
          discord: true,
          twitter: true,
          telegram: true,
          wallets: true,
        },
      });

      if (user?.twitter?.private === true) {
        user.twitter.username = "hidden";
      }

      if (user?.telegram?.private === true) {
        user.telegram.username = "hidden";
        user.telegram.telegramId = "hidden";
      }

      return user;
    }),

  getUsersByWalletAddresses: publicProcedure
    .input(z.object({ walletAddresses: z.array(z.string()) || z.undefined() }))
    .query(async ({ input }) => {
      if (input.walletAddresses === undefined) return;

      return prisma.user.findMany({
        where: {
          wallets: {
            some: {
              address: {
                in: input.walletAddresses,
              },
            },
          },
        },
        include: {
          wallets: true,
          discord: true,
          twitter: true,
          telegram: true,
        },
      });
    }),

  getAllUsers: publicProcedure.query(async ({}) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        defaultAddress: true,
        wallets: true,
        discord: true,
        twitter: true,
        telegram: true,
      },
    });

    const usersFiltered = users.map((user) => {
      if (user.twitter && user.twitter.private === true) {
        user.twitter.username = "hidden";
      }
      if (user.telegram && user.telegram.private === true) {
        user.telegram.username = "hidden";
        user.telegram.telegramId = "hidden";
      }
      return user;
    });

    return usersFiltered;
  }),
});
