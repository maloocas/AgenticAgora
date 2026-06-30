import type { DebateMessage, ModelConfig } from '../types'

interface Props {
  message: DebateMessage
  model: ModelConfig | undefined
}

export function ModelBubble({ message, model }: Props) {
  const color = model?.color ?? '#71717a'

  return (
    <div className="flex gap-3 py-3 px-4">
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
        </div>
        <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </div>
  )
}
