import { TRPCError } from "@trpc/server";

export function taskNotFoundError(): TRPCError {
  return new TRPCError({
    code: "NOT_FOUND",
    message: "Tarefa não encontrada",
  });
}
