import { initTRPC } from "@trpc/server";
import { z, ZodError } from "zod";

export type Context = Record<string, never>;

export async function createTRPCContext(): Promise<Context> {
  return {};
}

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    const zodError = error.cause instanceof ZodError ? error.cause : null;
    const firstIssue = zodError?.issues[0];

    return {
      ...shape,
      message: firstIssue?.message ?? shape.message,
      data: {
        ...shape.data,
        zodError: zodError ? z.flattenError(zodError) : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
