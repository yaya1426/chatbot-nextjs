# Egyptian-Arabic Chatbot (Next.js + SovereignEG)

A simple chatbot that replies in natural Egyptian Arabic, streamed token by token. It shows which model answered and what each reply cost in EGP. The default model, `SovereignEG/Qwen3.8-27B-FP8`, is hosted in Egypt ("الداتا جوه مصر").

Built with Next.js (App Router), TypeScript and the official `openai` SDK pointed at SovereignEG's OpenAI-compatible API.

## Setup

1. Install Node.js 20 or newer.
2. Clone and install:
   ```bash
   git clone <this-repo-url>
   cd chatbot-nextjs
   npm install
   ```
3. Get an API key from [SovereignEG](https://sovereigneg.com), then create your env file:
   ```bash
   cp .env.example .env.local
   ```
   and set `SOVEREIGNEG_API_KEY=` in `.env.local`. This file is git-ignored; never commit it.
4. Run it:
   ```bash
   npm run dev
   ```
   and open [http://localhost:3000](http://localhost:3000).

## How it works

- `src/app/api/chat/route.ts` is the only place that talks to SovereignEG. The API key stays on the server and never reaches the browser.
- `src/lib/models.ts` is the model allow-list with per-model EGP prices. Add a model by adding a row there.
- `opencode.json` configures SovereignEG as a provider for [OpenCode](https://opencode.ai), which was used to build this app. It contains no key; OpenCode asks for it separately.

See `AGENTS.md` for the full plan and rules.
