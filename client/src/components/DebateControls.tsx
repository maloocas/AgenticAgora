import type { DebateStatus } from '../types'

interface Props {
  status: DebateStatus
  round: number
  onStop: () => void
  onReset: () => void
}

export function DebateControls({ status, round, onStop, onReset }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 shrink-0">
      <div className="text-sm text-zinc-400">
        {status === 'running' && (
          <span className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Round {round} of 3
          </span>
        )}
        {status === 'complete' && (
          <span className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-zinc-500" />
            Debate complete
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {status === 'running' && (
          <button
            onClick={onStop}
            className="text-sm px-4 py-1.5 rounded-md bg-red-900/40 hover:bg-red-900/60 text-red-300 transition-colors"
          >
            Stop
          </button>
        )}
        {status === 'complete' && (
          <button
            onClick={onReset}
            className="text-sm px-4 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            New Debate
          </button>
        )}
      </div>
    </div>
  )
}
