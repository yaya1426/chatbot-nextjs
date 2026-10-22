# AGENTS.md — Chatbot (Egyptian Arabic)

Plans and rules for anyone (human or agent) working in this repo. Read this before doing anything here.

## 1. Overview

A simple chatbot web app. The user types a message in Egyptian Arabic (or any language) and the app replies in natural Egyptian Arabic, streamed token by token. It shows which model answered and how much the message cost in EGP. That's it — no auth, no history storage beyond the current session.

## 2. Stack

- Next.js (App Router) + TypeScript
- Official OpenAI SDK (`openai` npm package), pointed at the SovereignEG-compatible endpoint
- No other runtime dependencies unless agreed (see §8)

## 3. Architecture

```
Browser ⇄ Next.js API route ⇄ SovereignEG API ⇄ model ⇄ streamed reply
```

- The browser is **stateless**: it renders messages and shows cost. All model interaction happens server-side.
- The API key lives **only on the server** (API route) and is never exposed to the client — no `NEXT_PUBLIC_` prefix, no key in client components, no key in error messages or logs.
- Replies are **streamed** (SSE-style) from the API route to the browser.

## 4. Provider

- **SovereignEG** — OpenAI-compatible.
- `baseURL`: `https://backend.sovereigneg.com/v1`
- API key: env variable `SOVEREIGNEG_API_KEY` (read in the API route only). No key in this repo, ever.

## 5. Models

- A **server-side allow-list** of models (single source of truth, e.g. `src/lib/models.ts`). The client only ever sees model IDs and labels from this list — it cannot send arbitrary model names.
- **Default model:** `SovereignEG/Qwen3.8-27B-FP8` (hosted in Egypt).
- The default model's UI label carries the badge **"الداتا جوه مصر"** to signal in-Egypt hosting.
- Adding a model = adding one row (id, label, optional badge, price table) to the allow-list.

## 6. Features

1. **Streaming responses** — tokens appear as they arrive.
2. **Model picker** — dropdown fed by the allow-list; user switches models per conversation.
3. **Per-message cost in EGP** — computed from the usage the API returns:
   `cost = prompt_tokens × price_per_input + completion_tokens × price_per_output`
   with a **per-model price table** (EGP per 1M tokens) in the allow-list. Show the cost under each assistant reply.

## 7. Error handling — clear, user-facing messages

| Error | Message (shown to user) |
|---|---|
| 401 (bad/missing key) | "Service credential is invalid — contact the admin." (never hint that a key exists in the request) |
| 402 (insufficient credits) | "Provider account has no credits. Contact the admin." |
| `model_not_found` | "Selected model is not available. Please pick another one." and fall back to the default picker |
| Other network/5xx | "Could not reach the service. Please try again." |

Errors surface as a message bubble in the chat, not as a broken page or a raw stack trace.

## 8. Rules for agents

1. **Never** hardcode API keys or credentials anywhere in the repo. **Never** print/log keys.
2. Secrets live **only** in `.env.local` (git-ignored). Document required vars in `.env.example`.
3. Keep components and files **small** — one concern per file.
4. **Ask before adding a new dependency.** Prefer the OpenAI SDK and Next.js built-ins.
5. Client components must not import anything server-only (env keys, SDK clients).
6. UI text is Egyptian Arabic; code, comments, and file names are English.
7. Don't build features not in §1/§5/§6 (no auth, no persistence, no plugins) without asking.

## 9. Build steps (ordered)

- [ ] 1. `npx create-next-app@latest . --ts --app` (in `chatbot-nextjs/`). `npm i openai`.
- [ ] 2. Create `.env.local` with `SOVEREIGNEG_API_KEY=...` and a git-ignored `.env.local`; add `.env.example` with only the variable name.
- [ ] 3. `src/lib/models.ts` — allow-list: default model `SovereignEG/Qwen3.8-27B-FP8` + label + "الداتا جوه مصر" badge + per-model EGP price table (per 1M input/output tokens).
- [ ] 4. `app/api/chat/route.ts` — POST, validate model against the allow-list, build the OpenAI client (`baseURL: https://backend.sovereigneg.com/v1`, key from env), stream chat completion back as a streamed response; include `usage` in the final chunk; map errors per §7.
- [ ] 5. UI: chat page with message list, input box, model picker; render streamed tokens; show model + "الداتا جوه مصر" badge + EGP cost under each assistant reply.
- [ ] 6. `npm run dev` → send a first message → verify streaming, correct Arabic reply, cost shown, and (by breaking the key/test model id) that §7 errors appear. Done.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
