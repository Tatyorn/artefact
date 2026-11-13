import type { Task } from "@/lib/task-schema";
import { SEED_DATA } from "@/server/store/seed";

type TaskStore = {
  tasks: Task[];
};

const globalStore = globalThis as typeof globalThis & {
  __taskStore?: TaskStore;
};

function createSeedTasks(): Task[] {
  const now = Date.now();

  return SEED_DATA.map((seed, index) => ({
    id: crypto.randomUUID(),
    titulo: seed.titulo,
    descricao: seed.descricao,
    dataCriacao: new Date(now - index * 60_000).toISOString(),
  }));
}

function getStore(): TaskStore {
  if (!globalStore.__taskStore) {
    globalStore.__taskStore = { tasks: createSeedTasks() };
  }

  return globalStore.__taskStore;
}

function sortByNewest(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => b.dataCriacao.localeCompare(a.dataCriacao));
}

export const taskStore = {
  list({ cursor = 0, limit = 10 }: { cursor?: number; limit?: number }) {
    const sorted = sortByNewest(getStore().tasks);
    const items = sorted.slice(cursor, cursor + limit);
    const nextCursor = cursor + limit < sorted.length ? cursor + limit : null;

    return { items, nextCursor };
  },

  findById(id: string): Task | undefined {
    return getStore().tasks.find((task) => task.id === id);
  },

  create(input: { titulo: string; descricao?: string }): Task {
    const task: Task = {
      id: crypto.randomUUID(),
      titulo: input.titulo,
      descricao: input.descricao?.trim() || undefined,
      dataCriacao: new Date().toISOString(),
    };

    getStore().tasks.push(task);

    return task;
  },

  update(
    id: string,
    input: { titulo?: string; descricao?: string },
  ): Task | undefined {
    const task = getStore().tasks.find((item) => item.id === id);

    if (!task) {
      return undefined;
    }

    if (input.titulo !== undefined) {
      task.titulo = input.titulo;
    }

    if (input.descricao !== undefined) {
      task.descricao = input.descricao.trim() || undefined;
    }

    return task;
  },

  delete(id: string): boolean {
    const store = getStore();
    const index = store.tasks.findIndex((task) => task.id === id);

    if (index === -1) {
      return false;
    }

    store.tasks.splice(index, 1);

    return true;
  },
};
