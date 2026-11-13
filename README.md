# Gerenciador de Tarefas — Next.js 16 + tRPC

Aplicação simples de gerenciamento de tarefas que mantém os dados **em memória** e expõe o backend via **tRPC**, consumido por uma interface **Next.js 16 (App Router)** com listagem renderizada no servidor (SSR).

## Stack

- **Next.js 16.4** (App Router, Turbopack) + **React 19.3** + **TypeScript 6** (strict)
- **tRPC v11** (`@trpc/server`, `@trpc/client`, `@trpc/react-query`)
- **TanStack Query v5**
- **Zod v4** para validação
- **ESLint 10** (flat config do `eslint-config-next`)
- CSS puro (global), sem biblioteca de UI

## Como rodar

Requisitos: Node.js 20.9+ e npm.

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http:/localhost:3000) — a raiz redireciona para
`/tasks`.

Outros scripts:

```bash
npm run build      # build de produção
npm run start      # sobe o build de produção
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

## Como funciona

### Fluxo de dados

```
Server Component (/tasks) ──createCaller()──▶ appRouter.task.list()
        │                                              │
        │ initialData                                  ▼
        ▼                                      store em memória
Client Component (TaskList) ──tRPC/HTTP──▶ /api/trpc ──▶ mesmo store
```

- A listagem é um **Server Component**: chama o router tRPC diretamente (`createCaller`) e envia a primeira página como `initialData`. Assim o HTML já chega com as tarefas (SSR), sem um fetch HTTP extra no servidor.
- As interações (excluir, criar, editar) acontecem em **Client Components**, que usam os hooks do tRPC/React Query e chamam `/api/trpc`.
- O store vive em `globalThis`, então Server Components e Route Handlers compartilham a mesma lista (e os dados sobrevivem ao HMR em desenvolvimento).

### Estrutura

```
src/
├── app/
│   ├── layout.tsx                  # Providers tRPC + React Query
│   ├── page.tsx                    # redirect → /tasks
│   ├── tasks/
│   │   ├── page.tsx                # listagem com SSR
│   │   ├── new/page.tsx            # criação
│   │   └── [id]/edit/page.tsx      # edição (404 se não existir)
│   └── api/trpc/[trpc]/route.ts    # handler HTTP do tRPC
├── components/
│   ├── alert.tsx                   # feedback de sucesso/erro
│   ├── task-form.tsx               # formulário de criação/edição
│   └── task-list.tsx               # listagem + exclusão + infinite scroll
├── lib/
│   ├── format.ts                   # formatação de data (timezone fixo)
│   └── task-schema.ts              # schemas Zod e tipos do domínio
├── server/
│   ├── trpc.ts                     # initTRPC, contexto e errorFormatter
│   ├── errors.ts                   # erros de domínio (TRPCError)
│   ├── router.ts                   # appRouter
│   ├── routers/task.ts             # procedures de tarefas
│   └── store/
│       ├── seed.ts                 # dados fictícios iniciais
│       └── tasks.ts                # store em memória
└── trpc/
    ├── react.tsx                   # client React + provider
    └── server.ts                   # caller para Server Components
```

## API tRPC

| Procedure | Tipo | Entrada | Saída |
|---|---|---|---|
| `task.list` | query | `{ cursor?: number; limit?: number }` | `{ items: Task[]; nextCursor: number \| null }` |
| `task.byId` | query | `{ id: string }` | `Task` |
| `task.create` | mutation | `{ titulo: string; descricao?: string }` | `Task` |
| `task.update` | mutation | `{ id: string; titulo?: string; descricao?: string }` | `Task` |
| `task.delete` | mutation | `{ id: string }` | `{ id: string }` |

Modelo:

```ts
type Task = {
  id: string;            // UUID gerado automaticamente
  titulo: string;        // obrigatório, até 120 caracteres
  descricao?: string;    // opcional, até 1000 caracteres
  dataCriacao: string;   // ISO 8601
};
```

### Validação e erros

- Título vazio ou só com espaços → `BAD_REQUEST` com a mensagem `"Título é obrigatório"` (validado também no formulário).
- `task.byId`, `task.update` e `task.delete` com id inexistente → `NOT_FOUND` com
`"Tarefa não encontrada"`, centralizado na factory `taskNotFoundError()` em
`src/server/errors.ts`.
- O `errorFormatter` do tRPC transforma a primeira issue do Zod em uma mensagem legível, que o frontend exibe diretamente ao usuário.

## Decisões principais

1. **SSR via server caller (`createCaller`)** — evita montar uma URL absoluta e um round-trip HTTP no servidor; a primeira página já vai no HTML.
2. **Store em `globalThis`** — no Next.js, Server Components e Route Handlers podem ser empacotados separadamente; um array em escopo de módulo poderia divergir entre os dois. O `globalThis` garante uma única fonte de verdade.
3. **`force-dynamic` na listagem e na edição** — os dados mudam em memória a cada mutation; sem isso o Next poderia servir uma versão estática gerada no build.
4. **`dataCriacao` como ISO string** — dispensa transformer/superjson e mantém o mesmo tipo no SSR e no client.
5. **Paginação por offset desde o início** — `task.list` já retorna `nextCursor`, o que atende à listagem e ao bônus de infinite scroll sem duplicar endpoint.
6. **Formatação de data com timezone fixo** (`America/Sao_Paulo`) — evita divergência entre servidor e navegador na hidratação.
7. **Nomes do domínio em português** (`titulo`, `descricao`, `dataCriacao`) — seguem a especificação do desafio; o restante do código está em inglês.
