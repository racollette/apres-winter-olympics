import { createTRPCRouter } from "~/server/api/trpc";
import { bindingRouter } from "./routers/binding";
import { generalRouter } from "./routers/general";
import { inventoryRouter } from "./routers/inventory";
import { leaderboardRouter } from "./routers/leaderboard";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  binding: bindingRouter,
  general: generalRouter,
  inventory: inventoryRouter,
  leaderboard: leaderboardRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
