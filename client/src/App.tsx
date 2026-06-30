import { useCallback, useEffect, useState } from 'react'
import type { GlobalSettings, ModelConfig } from './types'
import { useDebate } from './hooks/useDebate'
import { TopicInput } from './components/TopicInput'
import { DebateView } from './components/DebateView'
import { SettingsPanel } from './components/SettingsPanel'
import { ModelConfigPanel } from './components/ModelConfigPanel'

function loadSettings(): GlobalSettings {
  try {
    const raw = localStorage.getItem('eastside-settings')
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { provider: 'openai', model: 'gpt-4o', apiKey: '', baseUrl: '' }
}

function loadModels(): ModelConfig[] {
  try {
    const raw = localStorage.getItem('eastside-models')
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

const DEFAULT_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6',
  '#f43f5e', '#06b6d4', '#84cc16', '#ec4899',
]

function App() {
  const [settings, setSettings] = useState<GlobalSettings>(loadSettings)
  const [models, setModels] = useState<ModelConfig[]>(loadModels)
  const [showSettings, setShowSettings] = useState(false)
  const [showModelConfig, setShowModelConfig] = useState(false)
  const { state, startDebate, stopDebate, reset } = useDebate()

  useEffect(() => {
    localStorage.setItem('eastside-settings', JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    localStorage.setItem('eastside-models', JSON.stringify(models))
  }, [models])

  const addModel = useCallback((model: ModelConfig) => {
    setModels((prev) => {
      const exists = prev.find((m) => m.id === model.id)
      if (exists) return prev.map((m) => (m.id === model.id ? model : m))
      return [...prev, model]
    })
  }, [])

  const removeModel = useCallback((id: string) => {
    setModels((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const getNextColor = useCallback(() => {
    const used = models.length
    return DEFAULT_COLORS[used % DEFAULT_COLORS.length]
  }, [models])

  const handleStart = useCallback(
    (topic: string, selectedIds: string[]) => {
      const selected = models.filter((m) => selectedIds.includes(m.id))
      if (selected.length < 2) return
      startDebate(topic, selected)
    },
    [models, startDebate]
  )

  const isActive = state.status === 'running'

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between shrink-0">
        <h1 className="text-lg font-semibold tracking-tight">eastside philosophy</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModelConfig(true)}
            className="text-sm px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            Models ({models.length})
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="text-sm px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            Settings
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        {state.status === 'idle' && (
          <TopicInput
            models={models}
            onStart={handleStart}
          />
        )}

        {state.status !== 'idle' && (
          <DebateView
            state={state}
            onStop={stopDebate}
            onReset={reset}
          />
        )}
      </main>

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showModelConfig && (
        <ModelConfigPanel
          models={models}
          defaultSettings={settings}
          nextColor={getNextColor}
          onAdd={addModel}
          onRemove={removeModel}
          onClose={() => setShowModelConfig(false)}
        />
      )}
    </div>
  )
}

export default App
