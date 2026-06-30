import type { GlobalSettings, Provider } from '../types'

interface Props {
  settings: GlobalSettings
  onChange: (s: GlobalSettings) => void
  onClose: () => void
}

const PROVIDERS: { value: Provider; label: string }[] = [
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'ollama', label: 'Ollama' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'mimo', label: 'Xiaomi Mimo' },
  { value: 'glm', label: 'GLM (ZhipuAI)' },
]

const MODEL_PLACEHOLDERS: Record<Provider, string> = {
  anthropic: 'claude-sonnet-4-20250514',
  openai: 'gpt-4o',
  openrouter: 'gpt-4o',
  ollama: 'gpt-4o',
  deepseek: 'deepseek-chat',
  mimo: 'mimo',
  glm: 'glm-4-flash',
}

const BASE_URL_PLACEHOLDERS: Record<Provider, string> = {
  anthropic: '',
  openai: 'https://api.openai.com/v1',
  openrouter: '',
  ollama: 'http://localhost:11434',
  deepseek: 'https://api.deepseek.com/v1',
  mimo: 'https://api.xiaomi.com/v1',
  glm: 'https://open.bigmodel.cn/api/paas/v4',
}

export function SettingsPanel({ settings, onChange, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md mx-4 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">Default Settings</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-lg leading-none">&times;</button>
        </div>

        <p className="text-xs text-zinc-500 mb-4">
          These defaults are used when creating new model configurations. Each model can override these.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Provider</label>
            <select
              value={settings.provider}
              onChange={(e) => onChange({ ...settings, provider: e.target.value as Provider })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
            >
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Model</label>
            <input
              type="text"
              value={settings.model}
              onChange={(e) => onChange({ ...settings, model: e.target.value })}
              placeholder={MODEL_PLACEHOLDERS[settings.provider]}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">API Key</label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => onChange({ ...settings, apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Base URL <span className="text-zinc-600">(optional)</span>
            </label>
            <input
              type="text"
              value={settings.baseUrl}
              onChange={(e) => onChange({ ...settings, baseUrl: e.target.value })}
              placeholder={BASE_URL_PLACEHOLDERS[settings.provider]}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
