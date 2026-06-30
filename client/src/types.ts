export type Provider = 'anthropic' | 'openai' | 'openrouter' | 'ollama' | 'deepseek' | 'mimo' | 'glm'

export interface ModelConfig {
  id: string
  name: string
  provider: Provider
  model: string
  apiKey: string
  baseUrl?: string
  color: string
  role: 'debater' | 'judge'
}

export interface DebateMessage {
  id: string
  modelId: string
  modelName: string
  content: string
  round: number
  timestamp: number
}

export type DebateStatus = 'idle' | 'running' | 'judging' | 'complete'

export interface DebateState {
  topic: string
  models: ModelConfig[]
  messages: DebateMessage[]
  round: number
  totalRounds: number
  status: DebateStatus
  error: string | null
  activeModelId: string | null
  verdict: string | null
  judgeName: string | null
}

export interface GlobalSettings {
  provider: Provider
  model: string
  apiKey: string
  baseUrl: string
}
