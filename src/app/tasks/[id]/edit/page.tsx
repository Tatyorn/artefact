import { TRPCError } from "@trpc/server";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TaskForm } from "@/components/task-form";
import { createCaller } from "@/trpc/server";

export const dynamic = "force-dynamic";

type EditTaskPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params;
  const caller = await createCaller();

  let task;

  try {
    task = await caller.task.byId({ id });
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      notFound();
    }

    throw error;
  }

  return (
    <main className="container narrow">
      <header className="page-header">
        <div>
          <h1>Editar tarefa</h1>
          <p className="muted">Atualize os dados e salve as alterações.</p>
        </div>
        <Link href="/tasks" className="button secondary">
          Voltar
        </Link>
      </header>

      <TaskForm task={task} />
    </main>
  );
}
