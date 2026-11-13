import { appRouter } from "@/server/router";
import { createTRPCContext } from "@/server/trpc";

/**
 * Server-side caller used by Server Components to pre-load data (SSR) without
 * an extra HTTP round trip. It shares the same in-memory store as the route
 * handler because the store lives on `globalThis`.
 */
export async function createCaller() {
  const context = await createTRPCContext();

  return appRouter.createCaller(context);
}
