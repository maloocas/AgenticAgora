# AgenticAgora

Multi-agent AI debate platform. Configure different LLMs from different providers and have them debate any topic in a structured, multi-round format — then optionally let a designated judge model deliver a verdict.

## Quick Start

```bash
npm install
npm run dev
```

Starts the Express proxy server on **port 3001** and the Vite dev server on **port 5173**. Open [http://localhost:5173](http://localhost:5173).

## How It Works

1. **Configure models** — Open the Models panel (header) and add 2+ LLM configs. Each gets a provider, model ID, API key, and display color.
2. **Assign roles** — Each model can be a *debater* or a *judge*. At least 2 debaters are needed. A judge is optional — if assigned, it evaluates all rounds and delivers a verdict at the end.
3. **Enter a topic** — Type any question or proposition on the home screen.
4. **Watch the debate** — Runs across **10 rounds** of back-and-forth. Each round, every debater responds in turn. Responses appear in real-time as they arrive, color-coded per model.
5. **Judge verdict** — If a judge model is configured, the platform synthesises the full transcript and the judge delivers a structured evaluation with a winner.

All API keys and config are stored in **your browser's localStorage**. The Express server is a stateless proxy — it never stores your keys.

## Architecture

```
AgenticAgora/
├── client/                        # Vite + React 18 + TypeScript + TailwindCSS
│   └── src/
│       ├── api/client.ts          # API client — sends chat requests to the Express proxy
│       ├── hooks/useDebate.ts     # Debate orchestrator — rounds, prompts, abort, judge phase
│       ├── types.ts               # Shared TypeScript types (ModelConfig, DebateState, etc.)
│       └── components/
│           ├── TopicInput.tsx      # Topic entry and model selection
│           ├── DebateView.tsx      # Live debate feed with color-coded message bubbles
│           ├── DebateControls.tsx  # Start / stop / reset controls
│           ├── ModelBubble.tsx     # Individual model response bubble
│           ├── ModelConfigPanel.tsx# Modal for adding / editing / removing models
│           └── SettingsPanel.tsx   # Global default settings (provider, key, model)
├── server/                        # Express proxy (stateless)
│   └── src/index.ts               # Routes provider calls through provider-specific adapters
└── package.json                   # Root orchestration via concurrently
```

## Supported Providers

| Provider | Models (examples) | Endpoint |
|----------|-------------------|----------|
| **Anthropic** | Claude 3.5 Sonnet, Claude Opus | `api.anthropic.com` |
| **OpenAI** | GPT-4o, GPT-4o-mini, o1 | `api.openai.com` (or custom base URL) |
| **OpenRouter** | Any model via unified API | `openrouter.ai/api/v1` |
| **Ollama** | Any local model | `localhost:11434` (or custom) |
| **DeepSeek** | DeepSeek V3, R1 | `api.deepseek.com/v1` |
| **Mimo** | Xiaomi MiMo models | `api.xiaomi.com/v1` |
| **GLM** | Zhipu GLM-4 | `open.bigmodel.cn/api/paas/v4` |

Any OpenAI-compatible endpoint can be used by setting a custom **base URL** on the model config.

## Debate Format

- **10 rounds** — Each debater responds every round, building on their previous arguments.
- **20-second timeout** per turn — models that don't respond in time are skipped with a timeout notice.
- **Judge model** (optional) — A separate model evaluates the full transcript on debating technique, persuasiveness, and rhetorical skill, then delivers a verdict.
- **Error resilience** — Individual turn failures are surfaced inline without aborting the entire debate.

## Development

```bash
npm run dev          # Start both server (3001) and client (5173)
npm run dev:server   # Start just the Express proxy
npm run dev:client   # Start just the Vite dev server
```

## Build

```bash
npm run build        # Builds the client for production (output: client/dist/)
npm run start        # Runs the Express server in production mode
```

## Privacy

The Express proxy forwards your API key and messages directly to the LLM provider — **nothing is logged or stored server-side**. All configuration lives in your browser and never leaves your machine except as forwarded API calls.
