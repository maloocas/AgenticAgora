import { useState } from 'react'
import type { ModelConfig } from '../types'

interface Props {
  models: ModelConfig[]
  onStart: (topic: string, selectedIds: string[]) => void
}

export function TopicInput({ models, onStart }: Props) {
  const [topic, setTopic] = useState('')
  const debaters = models.filter((m) => m.role !== 'judge')
  const judge = models.find((m) => m.role === 'judge')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(debaters.map((m) => m.id))
  )

  const toggleModel = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleStart = () => {
    const trimmed = topic.trim()
    if (!trimmed) return
    const selected = Array.from(selectedIds)
    if (selected.length < 2) return
    onStart(trimmed, selected)
  }

  const canStart = topic.trim().length > 0 && selectedIds.size >= 2

  if (debaters.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-xl font-semibold mb-2">No debaters configured</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Add LLM models in the Models panel. You need at least two debaters to start a debate.
          </p>
          <p className="text-xs text-zinc-500">
            Click &ldquo;Models&rdquo; in the top bar to configure. Set a model&rsquo;s role to &ldquo;Judge&rdquo; to add a verdict at the end.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <h2 className="text-xl font-semibold mb-6 text-center">
          What should they debate?
        </h2>

        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && canStart) {
              e.preventDefault()
              handleStart()
            }
          }}
          placeholder="e.g. Is free will an illusion? What is the nature of consciousness? Does AI have moral worth?"
          rows={3}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 resize-none"
          autoFocus
        />

        <div className="flex flex-wrap gap-2 my-4">
          {debaters.map((m) => (
            <button
              key={m.id}
              onClick={() => toggleModel(m.id)}
              className="text-xs px-3 py-1.5 rounded-full border transition-colors"
              style={{
                borderColor: selectedIds.has(m.id) ? m.color : '#3f3f46',
                backgroundColor: selectedIds.has(m.id) ? m.color + '20' : 'transparent',
                color: selectedIds.has(m.id) ? m.color : '#71717a',
              }}
            >
              {m.name}
            </button>
          ))}
        </div>

        {judge && (
          <p className="text-xs text-zinc-500 text-center mb-4">
            Judge: <span style={{ color: judge.color }}>{judge.name}</span>
          </p>
        )}

        <button
          onClick={handleStart}
          disabled={!canStart}
          className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          Start Debate
        </button>
      </div>
    </div>
  )
}
