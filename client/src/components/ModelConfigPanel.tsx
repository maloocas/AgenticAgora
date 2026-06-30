import { useState } from 'react'
import type { GlobalSettings, ModelConfig, Provider } from '../types'

interface Props {
  models: ModelConfig[]
  defaultSettings: GlobalSettings
  nextColor: () => string
  onAdd: (model: ModelConfig) => void
  onRemove: (id: string) => void
  onClose: () => void
}

const PROVIDERS: { value: Provider; label: string }[] = [
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'ollama', label: 'Ollama' },
]

function emptyModel(defaults: GlobalSettings, color: string): ModelConfig {
  return {
    id: crypto.randomUUID(),
    name: '',
    provider: defaults.provider,
    model: defaults.model,
    apiKey: defaults.apiKey,
    baseUrl: defaults.baseUrl || undefined,
    color,
  }
}

function ModelForm({
  model,
  onChange,
  onSave,
  onRemove,
  isNew,
}: {
  model: ModelConfig
  onChange: (m: ModelConfig) => void
  onSave: () => void
  onRemove?: () => void
  isNew: boolean
}) {
  const canSave = model.name.trim().length > 0 && model.model.trim().length > 0

  return (
    <div className="border border-zinc-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={model.color}
          onChange={(e) => onChange({ ...model, color: e.target.value })}
          className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
        />
        <input
          type="text"
          value={model.name}
          onChange={(e) => onChange({ ...model, name: e.target.value })}
          placeholder="Display name (e.g. Claude, GPT-4)"
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
          autoFocus={isNew}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-zinc-500 mb-0.5">Provider</label>
          <select
            value={model.provider}
            onChange={(e) => onChange({ ...model, provider: e.target.value as Provider })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
          >
            {PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-0.5">Model ID</label>
          <input
            type="text"
            value={model.model}
            onChange={(e) => onChange({ ...model, model: e.target.value })}
            placeholder="gpt-4o"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-0.5">API Key</label>
        <input
          type="password"
          value={model.apiKey}
          onChange={(e) => onChange({ ...model, apiKey: e.target.value })}
          placeholder="sk-... (leave blank to use default)"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
        />
      </div>

      {model.provider !== 'anthropic' && (
        <div>
          <label className="block text-xs text-zinc-500 mb-0.5">
            Base URL <span className="text-zinc-600">(optional)</span>
          </label>
          <input
            type="text"
            value={model.baseUrl ?? ''}
            onChange={(e) => onChange({ ...model, baseUrl: e.target.value || undefined })}
            placeholder={model.provider === 'ollama' ? 'http://localhost:11434' : ''}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
          />
        </div>
      )}

      {isNew && (
        <button
          onClick={onSave}
          disabled={!canSave}
          className="w-full py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 transition-colors"
        >
          Add Model
        </button>
      )}
      {!isNew && onRemove && (
        <button
          onClick={onRemove}
          className="w-full py-1.5 rounded-md text-xs font-medium bg-red-900/30 hover:bg-red-900/50 text-red-400 transition-colors"
        >
          Remove
        </button>
      )}
    </div>
  )
}

export function ModelConfigPanel({ models, defaultSettings, nextColor, onAdd, onRemove, onClose }: Props) {
  const [newModel, setNewModel] = useState<ModelConfig | null>(null)

  const handleAddNew = () => {
    setNewModel(emptyModel(defaultSettings, nextColor()))
  }

  const handleSaveNew = () => {
    if (!newModel) return
    onAdd(newModel)
    setNewModel(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          <h2 className="text-base font-semibold">Model Configurations</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-lg leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {models.length === 0 && !newModel && (
            <p className="text-sm text-zinc-500 text-center py-8">
              No models yet. Add at least two models to start a debate.
            </p>
          )}

          {models.map((model) => (
            <ModelForm
              key={model.id}
              model={model}
              onChange={(m) => onAdd(m)}
              onSave={() => {}}
              onRemove={() => onRemove(model.id)}
              isNew={false}
            />
          ))}

          {newModel && (
            <ModelForm
              model={newModel}
              onChange={setNewModel}
              onSave={handleSaveNew}
              isNew={true}
            />
          )}
        </div>

        <div className="px-5 py-3 border-t border-zinc-800 shrink-0 flex gap-2">
          <button
            onClick={handleAddNew}
            disabled={!!newModel}
            className="flex-1 py-2 rounded-md text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 transition-colors"
          >
            + Add Model
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-md text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
