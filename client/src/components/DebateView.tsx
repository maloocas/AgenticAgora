import { useEffect, useRef } from 'react'
import type { DebateState } from '../types'
import { ModelBubble } from './ModelBubble'
import { DebateControls } from './DebateControls'

interface Props {
  state: DebateState
  onStop: () => void
  onReset: () => void
}

export function DebateView({ state, onStop, onReset }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages])

  const getModel = (modelId: string) =>
    state.models.find((m) => m.id === modelId)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 shrink-0">
        <h2 className="text-sm font-medium text-zinc-400">Topic</h2>
        <p className="text-base text-zinc-100 mt-0.5">{state.topic}</p>
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {state.models.map((m) => (
            <span
              key={m.id}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: m.color + '20',
                color: m.color,
              }}
            >
              {m.name}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {state.messages.length === 0 && state.status === 'running' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block w-6 h-6 border-2 border-zinc-600 border-t-emerald-400 rounded-full animate-spin mb-3" />
              <p className="text-sm text-zinc-500">The debate is starting...</p>
            </div>
          </div>
        )}

        {state.messages.map((msg) => (
          <ModelBubble
            key={msg.id}
            message={msg}
            model={getModel(msg.modelId)}
          />
        ))}

        {state.status === 'running' && state.messages.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="w-5 h-5 border-2 border-zinc-600 border-t-emerald-400 rounded-full animate-spin" />
            <span className="text-sm text-zinc-500">Next response...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <DebateControls
        status={state.status}
        round={state.round}
        onStop={onStop}
        onReset={onReset}
      />
    </div>
  )
}
