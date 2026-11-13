import {
  taskCreateInputSchema,
  taskIdInputSchema,
  taskListInputSchema,
  taskUpdateInputSchema,
} from "@/lib/task-schema";
import { taskNotFoundError } from "@/server/errors";
import { taskStore } from "@/server/store/tasks";
import { publicProcedure, router } from "@/server/trpc";

export const taskRouter = router({
  list: publicProcedure
    .input(taskListInputSchema)
    .query(({ input }) => taskStore.list(input)),

  byId: publicProcedure
    .input(taskIdInputSchema)
    .query(({ input }) => {
      const task = taskStore.findById(input.id);

      if (!task) {
        throw taskNotFoundError();
      }

      return task;
    }),

  create: publicProcedure
    .input(taskCreateInputSchema)
    .mutation(({ input }) => taskStore.create(input)),

  update: publicProcedure
    .input(taskUpdateInputSchema)
    .mutation(({ input }) => {
      const { id, ...changes } = input;
      const task = taskStore.update(id, changes);

      if (!task) {
        throw taskNotFoundError();
      }

      return task;
    }),

  delete: publicProcedure
    .input(taskIdInputSchema)
    .mutation(({ input }) => {
      const deleted = taskStore.delete(input.id);

      if (!deleted) {
        throw taskNotFoundError();
      }

      return { id: input.id };
    }),
});
