import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

type Provider = 'anthropic' | 'openai' | 'openrouter' | 'ollama' | 'deepseek' | 'mimo' | 'glm'

const sanitizeHeader = (v: string) => v.replace(/[^\x20-\x7E]/g, '')

interface ChatRequest {
  provider: Provider
  model: string
  apiKey: string
  messages: { role: string; content: string }[]
  temperature?: number
  maxTokens?: number
  baseUrl?: string
}

async function callAnthropic(req: ChatRequest): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': sanitizeHeader(req.apiKey),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: req.model,
      max_tokens: req.maxTokens ?? 2048,
      system: req.messages.find((m) => m.role === 'system')?.content,
      messages: req.messages.filter((m) => m.role !== 'system').map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic error ${res.status}: ${err}`)
  }

  const data = await res.json() as any
  return data.content[0].text
}

async function callOpenAI(req: ChatRequest): Promise<string> {
  const baseUrl = req.baseUrl || 'https://api.openai.com/v1'
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sanitizeHeader(req.apiKey)}`,
    },
    body: JSON.stringify({
      model: req.model,
      messages: req.messages,
      temperature: req.temperature ?? 0.7,
      max_tokens: req.maxTokens ?? 2048,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI error ${res.status}: ${err}`)
  }

  const data = await res.json() as any
  const content = data.choices?.[0]?.message?.content
  if (!content || !content.trim()) {
    console.error('Empty response:', JSON.stringify(data).slice(0, 500))
    throw new Error('Provider returned empty response')
  }
  return content
}

async function callOpenRouter(req: ChatRequest): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sanitizeHeader(req.apiKey)}`,
    },
    body: JSON.stringify({
      model: req.model,
      messages: req.messages,
      temperature: req.temperature ?? 0.7,
      max_tokens: req.maxTokens ?? 2048,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${err}`)
  }

  const data = await res.json() as any
  return data.choices[0].message.content
}

async function callOllama(req: ChatRequest): Promise<string> {
  const baseUrl = req.baseUrl || 'http://localhost:11434'
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: req.model,
      messages: req.messages,
      options: {
        temperature: req.temperature ?? 0.7,
      },
      stream: false,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Ollama error ${res.status}: ${err}`)
  }

  const data = await res.json() as any
  return data.message.content
}

async function callDeepSeek(req: ChatRequest): Promise<string> {
  try {
    return await callOpenAI({ ...req, baseUrl: req.baseUrl || 'https://api.deepseek.com/v1' })
  } catch (err: any) {
    throw new Error(`DeepSeek: ${err.message}`)
  }
}

async function callMimo(req: ChatRequest): Promise<string> {
  try {
    return await callOpenAI({ ...req, baseUrl: req.baseUrl || 'https://api.xiaomi.com/v1' })
  } catch (err: any) {
    throw new Error(`Mimo: ${err.message}`)
  }
}

async function callGLM(req: ChatRequest): Promise<string> {
  try {
    return await callOpenAI({ ...req, baseUrl: req.baseUrl || 'https://open.bigmodel.cn/api/paas/v4' })
  } catch (err: any) {
    throw new Error(`GLM: ${err.message}`)
  }
}

const PROVIDERS: Record<Provider, (req: ChatRequest) => Promise<string>> = {
  anthropic: callAnthropic,
  openai: callOpenAI,
  openrouter: callOpenRouter,
  ollama: callOllama,
  deepseek: callDeepSeek,
  mimo: callMimo,
  glm: callGLM,
}

app.post('/api/chat', async (req, res) => {
  try {
    const body = req.body as ChatRequest

    if (!body.provider || !PROVIDERS[body.provider]) {
      res.status(400).json({ error: `Unknown provider: ${body.provider}` })
      return
    }

    if (!body.apiKey && body.provider !== 'ollama') {
      res.status(400).json({ error: 'API key required' })
      return
    }

    console.log(`[${body.provider}] calling ${body.model}...`)
    const content = await PROVIDERS[body.provider](body)
    res.json({ content })
  } catch (err: any) {
    const message = err?.message || err?.toString() || 'Unknown server error'
    console.error('Chat error:', message, err?.cause || '')
    res.status(500).json({ error: message })
  }
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`AgenticAgora server running on http://localhost:${PORT}`)
})
