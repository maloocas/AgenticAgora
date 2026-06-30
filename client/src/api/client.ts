import type { Provider } from '../types'

interface ChatParams {
  provider: Provider
  model: string
  apiKey: string
  messages: { role: string; content: string }[]
  temperature?: number
  maxTokens?: number
  baseUrl?: string
}

export async function chat(params: ChatParams): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  const data = await res.json()
  return data.content
}
