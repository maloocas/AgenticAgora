import { useEffect, useRef } from 'react'
import type { DebateState } from '../types'
import { ModelBubble } from './ModelBubble'
import { DebateControls } from './DebateControls'
import { formatBold } from '../utils/format'

interface Props {
  state: DebateState
  onStop: () => void
  onReset: () => void
}

export function DebateView({ state, onStop, onReset }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages, state.verdict])

  const getModel = (modelId: string) =>
    state.models.find((m) => m.id === modelId)

  const isActive = state.status === 'running' || state.status === 'judging'

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-zinc-400">Topic</h2>
            <p className="text-base text-zinc-100 mt-0.5">{state.topic}</p>
          </div>
          {isActive && (
            <div className="text-right">
              <div className="text-xs text-zinc-500 mb-0.5">
                {state.status === 'judging' ? 'Verdict' : 'Round'}
              </div>
              <div className={`text-2xl font-mono tabular-nums ${state.status === 'judging' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {state.status === 'judging' ? '...' : state.round}
                {state.status !== 'judging' && (
                  <span className="text-zinc-600 text-base">/{state.totalRounds}</span>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {state.models.map((m) => (
            <span
              key={m.id}
              className={`text-xs px-2 py-0.5 rounded-full transition-all ${
                state.activeModelId === m.id ? 'ring-1 ring-white/50 scale-105' : ''
              } ${m.role === 'judge' ? 'border border-amber-500/30' : ''}`}
              style={{
                backgroundColor: m.color + '20',
                color: m.color,
              }}
            >
              {m.name}
              {m.role === 'judge' && (
                <span className="ml-1 opacity-60">&#9713;</span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {state.verdict && (
          <div className="mx-4 my-3 border border-amber-500/20 bg-amber-500/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-400 text-sm">&#9713;</span>
              <span className="text-sm font-medium text-amber-400">
                Verdict{state.judgeName ? ` — ${state.judgeName}` : ''}
              </span>
            </div>
            <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
              {formatBold(state.verdict)}
            </div>
          </div>
        )}

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
            isActive={state.activeModelId === msg.modelId}
          />
        ))}

        {state.status === 'judging' && (
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="w-5 h-5 border-2 border-zinc-600 border-t-amber-400 rounded-full animate-spin" />
            <span className="text-sm text-zinc-500">
              Judge is deliberating...
            </span>
          </div>
        )}

        {state.status === 'running' && state.messages.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="w-5 h-5 border-2 border-zinc-600 border-t-emerald-400 rounded-full animate-spin" />
            <span className="text-sm text-zinc-500">
              Waiting for {state.models.find(m => m.id === state.activeModelId)?.name ?? 'next'}...
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <DebateControls
        status={state.status}
        round={state.round}
        totalRounds={state.totalRounds}
        onStop={onStop}
        onReset={onReset}
      />
    </div>
  )
}
