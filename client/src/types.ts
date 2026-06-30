export type Provider = 'anthropic' | 'openai' | 'openrouter' | 'ollama'

export interface ModelConfig {
  id: string
  name: string
  provider: Provider
  model: string
  apiKey: string
  baseUrl?: string
  color: string
}

export interface DebateMessage {
  id: string
  modelId: string
  modelName: string
  content: string
  round: number
  timestamp: number
}

export type DebateStatus = 'idle' | 'running' | 'paused' | 'complete'

export interface DebateState {
  topic: string
  models: ModelConfig[]
  messages: DebateMessage[]
  round: number
  status: DebateStatus
  error: string | null
}

export interface GlobalSettings {
  provider: Provider
  model: string
  apiKey: string
  baseUrl: string
}
