import Link from "next/link";

import { TaskForm } from "@/components/task-form";

export default function NewTaskPage() {
  return (
    <main className="container narrow">
      <header className="page-header">
        <div>
          <h1>Nova tarefa</h1>
          <p className="muted">Preencha os dados abaixo para criar uma tarefa.</p>
        </div>
        <Link href="/tasks" className="button secondary">
          Voltar
        </Link>
      </header>

      <TaskForm />
    </main>
  );
}
