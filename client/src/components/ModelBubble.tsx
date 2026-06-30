import type { DebateMessage, ModelConfig } from '../types'
import { formatBold } from '../utils/format'

interface Props {
  message: DebateMessage
  model: ModelConfig | undefined
  isActive?: boolean
}

export function ModelBubble({ message, model, isActive }: Props) {
  const color = model?.color ?? '#71717a'

  return (
    <div className={`flex gap-3 py-3 px-4 ${isActive ? 'bg-zinc-800/30' : ''}`}>
      <div
        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white mt-0.5"
        style={{ backgroundColor: color }}
      >
        {message.modelName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium" style={{ color }}>
            {message.modelName}
          </span>
          <span className="text-xs text-zinc-500">
            Round {message.round}
          </span>
          {isActive && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              thinking
            </span>
          )}
        </div>
        <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
          {formatBold(message.content)}
        </div>
      </div>
    </div>
  )
}
