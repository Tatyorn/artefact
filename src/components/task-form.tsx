"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert } from "@/components/alert";
import type { Task } from "@/lib/task-schema";
import { trpc } from "@/trpc/react";

type Feedback = { type: "success" | "error"; message: string };

export function TaskForm({ task }: { task?: Task }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const isEditing = Boolean(task);

  const [titulo, setTitulo] = useState(task?.titulo ?? "");
  const [descricao, setDescricao] = useState(task?.descricao ?? "");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function handleSuccess() {
    await utils.task.list.invalidate();
    router.push("/tasks");
    router.refresh();
  }

  const createMutation = trpc.task.create.useMutation({
    onSuccess: handleSuccess,
    onError: (error) =>
      setFeedback({ type: "error", message: error.message }),
  });

  const updateMutation = trpc.task.update.useMutation({
    onSuccess: handleSuccess,
    onError: (error) =>
      setFeedback({ type: "error", message: error.message }),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = titulo.trim();

    if (!trimmedTitle) {
      setFieldError("Título é obrigatório.");
      return;
    }

    setFieldError(null);
    setFeedback(null);

    // Empty description is sent as "" so the backend can clear the field.
    const payload = { titulo: trimmedTitle, descricao: descricao.trim() };

    if (isEditing && task) {
      updateMutation.mutate({ id: task.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      {feedback ? (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      ) : null}

      <label className="field">
        <span>
          Título <strong aria-hidden>*</strong>
        </span>
        <input
          type="text"
          value={titulo}
          onChange={(event) => {
            setTitulo(event.target.value);
            if (fieldError) {
              setFieldError(null);
            }
          }}
          maxLength={120}
          placeholder="Ex.: Revisar proposta do cliente"
          aria-invalid={Boolean(fieldError)}
          aria-describedby={fieldError ? "titulo-error" : undefined}
        />
      </label>

      {fieldError ? (
        <p id="titulo-error" className="field-error" role="alert">
          {fieldError}
        </p>
      ) : null}

      <label className="field">
        <span>Descrição</span>
        <textarea
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          maxLength={1000}
          rows={5}
          placeholder="Detalhes opcionais sobre a tarefa"
        />
      </label>

      <div className="form-actions">
        <button
          type="submit"
          className="button"
          disabled={isPending || titulo.trim().length === 0}
        >
          {isPending
            ? "Salvando..."
            : isEditing
              ? "Salvar alterações"
              : "Criar tarefa"}
        </button>
        <button
          type="button"
          className="button secondary"
          disabled={isPending}
          onClick={() => router.push("/tasks")}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
