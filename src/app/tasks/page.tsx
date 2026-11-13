import Link from "next/link";

import { TaskList } from "@/components/task-list";
import { createCaller } from "@/trpc/server";

// The store is in memory and changes on every mutation, so the list must be
// rendered per request instead of being cached at build time.
export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const caller = await createCaller();
  const initialData = await caller.task.list({ limit: 10 });

  return (
    <main className="container">
      <header className="page-header">
        <div>
          <h1>Tarefas</h1>
          <p className="muted">
            Lista pré-carregada no servidor (SSR) e atualizada via tRPC.
          </p>
        </div>
        <Link href="/tasks/new" className="button">
          Nova tarefa
        </Link>
      </header>

      <TaskList initialData={initialData} />
    </main>
  );
}
