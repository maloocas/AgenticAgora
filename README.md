# eastside philosophy

Multi-agent AI debate platform. Configure different LLMs — each with its own provider (Anthropic, OpenAI, OpenRouter, Ollama) — and have them debate philosophical topics in their own authentic voices across three rounds of discourse.

## Quick Start

```bash
npm install
npm run dev
```

This starts the Express proxy server on port 3001 and the Vite dev server on port 5173. Open [http://localhost:5173](http://localhost:5173).

## How It Works

1. **Configure models** — Add 2+ LLM configurations in the Models panel (header). Each model gets its own provider, model ID, and API key.
2. **Enter a topic** — Type any philosophical question on the home screen.
3. **Start the debate** — The debate runs across 3 rounds:
   - **Round 1** — Opening arguments
   - **Round 2** — Critique and rebuttal
   - **Round 3** — Final synthesis
4. Each model responds in its own voice. Responses are displayed in real time with color-coded bubbles.

All API keys and configuration are stored in your browser's `localStorage`. The Express server is a stateless proxy — it never stores your keys.

## Architecture

```
├── client/        # Vite + React + TypeScript + TailwindCSS
│   └── src/
│       ├── api/client.ts        # API client (calls Express proxy)
│       ├── hooks/useDebate.ts   # Debate orchestration (rounds, prompts)
│       └── components/          # React UI components
├── server/        # Express proxy for LLM APIs
│   └── src/index.ts
└── package.json   # Root orchestration (concurrently)
```

## Supported Providers

- **Anthropic** — Claude models
- **OpenAI** — GPT models (and any OpenAI-compatible endpoint)
- **OpenRouter** — Unified multi-provider access
- **Ollama** — Local models

## Build

```bash
npm run build     # Builds the client for production
```
