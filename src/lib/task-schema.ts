import { z } from "zod";

/**
 * Domain fields follow the challenge specification (`titulo`, `descricao`,
 * `dataCriacao`). Everything else in the codebase stays in English.
 */
export const taskIdSchema = z.string().min(1, "ID é obrigatório");

export const taskListInputSchema = z.object({
  cursor: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).max(50).default(10),
});

export const taskCreateInputSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, "Título é obrigatório")
    .max(120, "Título deve ter no máximo 120 caracteres"),
  descricao: z
    .string()
    .trim()
    .max(1000, "Descrição deve ter no máximo 1000 caracteres")
    .optional(),
});

export const taskUpdateInputSchema = z
  .object({
    id: taskIdSchema,
    titulo: z
      .string()
      .trim()
      .min(1, "Título é obrigatório")
      .max(120, "Título deve ter no máximo 120 caracteres")
      .optional(),
    descricao: z
      .string()
      .trim()
      .max(1000, "Descrição deve ter no máximo 1000 caracteres")
      .optional(),
  })
  .refine(
    (data) => data.titulo !== undefined || data.descricao !== undefined,
    { message: "Informe ao menos um campo para atualizar" },
  );

export const taskIdInputSchema = z.object({ id: taskIdSchema });

export type Task = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: string;
};

export type TaskListInput = z.input<typeof taskListInputSchema>;
export type TaskListOutput = {
  items: Task[];
  nextCursor: number | null;
};
export type TaskCreateInput = z.input<typeof taskCreateInputSchema>;
export type TaskUpdateInput = z.input<typeof taskUpdateInputSchema>;
