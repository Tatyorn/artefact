import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container narrow">
      <header className="page-header">
        <div>
          <h1>Tarefa não encontrada</h1>
          <p className="muted">
            A tarefa pode ter sido excluída ou o endereço está incorreto.
          </p>
        </div>
      </header>

      <Link href="/tasks" className="button">
        Voltar para a lista
      </Link>
    </main>
  );
}
