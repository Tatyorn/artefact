"use client";

import type { inferRouterOutputs } from "@trpc/server";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Alert } from "@/components/alert";
import { formatDateTime } from "@/lib/format";
import type { AppRouter } from "@/server/router";
import { trpc } from "@/trpc/react";

type TaskListOutput = inferRouterOutputs<AppRouter>["task"]["list"];
type Feedback = { type: "success" | "error"; message: string };

export function TaskList({ initialData }: { initialData: TaskListOutput }) {
  const utils = trpc.useUtils();
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const listQuery = trpc.task.list.useInfiniteQuery(
    { limit: 10 },
    {
      // The first page is rendered by the Server Component (SSR).
      initialData: { pages: [initialData], pageParams: [undefined] },
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    },
  );

  const deleteMutation = trpc.task.delete.useMutation({
    onSuccess: async () => {
      setFeedback({ type: "success", message: "Tarefa excluída com sucesso." });
      await utils.task.list.invalidate();
    },
    onError: (error) => {
      setFeedback({ type: "error", message: error.message });
    },
  });

  const tasks = listQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = listQuery;

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;

    if (!node || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <section>
      {feedback ? (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      ) : null}

      {listQuery.isError ? (
        <Alert type="error" message={listQuery.error.message} />
      ) : null}

      {tasks.length === 0 ? (
        <p className="empty">
          Nenhuma tarefa cadastrada ainda. Crie a primeira em{" "}
          <Link href="/tasks/new">Nova tarefa</Link>.
        </p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => {
            const isDeleting =
              deleteMutation.isPending &&
              deleteMutation.variables?.id === task.id;

            return (
              <li key={task.id} className="task-card">
                <div className="task-content">
                  <h2>{task.titulo}</h2>
                  {task.descricao ? <p>{task.descricao}</p> : null}
                  <time dateTime={task.dataCriacao}>
                    Criada em {formatDateTime(task.dataCriacao)}
                  </time>
                </div>

                <div className="task-actions">
                  <Link
                    href={`/tasks/${task.id}/edit`}
                    className="button secondary"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    className="button danger"
                    disabled={isDeleting}
                    onClick={() => {
                      const confirmed = window.confirm(
                        `Excluir a tarefa "${task.titulo}"?`,
                      );

                      if (confirmed) {
                        deleteMutation.mutate({ id: task.id });
                      }
                    }}
                  >
                    {isDeleting ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div ref={sentinelRef} aria-hidden />

      {hasNextPage ? (
        <div className="load-more">
          <button
            type="button"
            className="button secondary"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
          </button>
        </div>
      ) : tasks.length > 0 ? (
        <p className="muted end">Fim da lista.</p>
      ) : null}
    </section>
  );
}
