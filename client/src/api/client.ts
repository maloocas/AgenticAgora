import type { Provider } from '../types'

interface ChatParams {
  provider: Provider
  model: string
  apiKey: string
  messages: { role: string; content: string }[]
  temperature?: number
  maxTokens?: number
  baseUrl?: string
  signal?: AbortSignal
}

export async function chat(params: ChatParams): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    signal: params.signal,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let errorMsg: string
    try {
      const err = JSON.parse(text)
      errorMsg = err.error || `HTTP ${res.status}`
    } catch {
      errorMsg = text || `HTTP ${res.status}`
    }
    throw new Error(errorMsg)
  }

  const data = await res.json()
  return data.content
}
