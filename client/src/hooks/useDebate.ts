import { useCallback, useRef, useState } from 'react'
import { chat } from '../api/client'
import type { DebateMessage, DebateState, DebateStatus, ModelConfig } from '../types'

const TOTAL_ROUNDS = 10
const TURN_TIMEOUT = 20 * 1000

let msgIdCounter = 0
function nextMsgId(): string {
  return `msg-${++msgIdCounter}`
}

function buildPrompt(topic: string, ownTranscript: string[], turn: number): string {
  if (turn === 1) {
    return `What is your opinion on "${topic}"? Keep your answer under 100 words.`
  }

  const transcriptText = ownTranscript.join('\n\n')

  return `You are debating an opponent on "${topic}". Your goal is to WIN by defending your original stance with honest reasoning. Keep your response under 100 words.

Your arguments so far:
---
${transcriptText}
---

Strengthen your position. Counter anticipated arguments. Be persuasive and direct. Do not concede.`
}

function buildJudgePrompt(topic: string, debateMessages: DebateMessage[]): string {
  const transcript = debateMessages
    .map((m) => `[${m.modelName}, Round ${m.round}]: ${m.content}`)
    .join('\n\n---\n\n')

  return `You are a judge evaluating a debate on: "${topic}".

Below is the full debate transcript. Each debater argued their position over multiple rounds.

---
${transcript}
---

Judge the debate on debating technique, persuasiveness, and rhetorical skill — not on who is factually correct. A great debater can win even with the weaker position. Provide a SYNTHESIS of each debater's approach, then a clear VERDICT on who won and why. Keep the entire response under 300 words.`
}

export function useDebate() {
  const [state, setState] = useState<DebateState>({
    topic: '',
    models: [],
    messages: [],
    round: 0,
    totalRounds: TOTAL_ROUNDS,
    status: 'idle',
    error: null,
    activeModelId: null,
    verdict: null,
    judgeName: null,
  })

  const abortRef = useRef<AbortController | null>(null)
  const messagesRef = useRef<DebateMessage[]>([])
  const transcriptsRef = useRef<Record<string, string[]>>({})

  const addMessage = useCallback((msg: DebateMessage) => {
    messagesRef.current = [...messagesRef.current, msg]
    setState((prev) => ({ ...prev, messages: messagesRef.current }))
  }, [])

  const startDebate = useCallback(
    async (topic: string, models: ModelConfig[]) => {
      abortRef.current?.abort()

      messagesRef.current = []
      transcriptsRef.current = {}

      const controller = new AbortController()
      abortRef.current = controller

      const debaters = models.filter((m) => m.role !== 'judge')
      const judge = models.find((m) => m.role === 'judge') ?? null

      setState({
        topic,
        models,
        messages: [],
        round: 1,
        totalRounds: TOTAL_ROUNDS,
        status: 'running',
        error: null,
        activeModelId: null,
        verdict: null,
        judgeName: judge?.name ?? null,
      })

      try {
        for (let round = 1; round <= TOTAL_ROUNDS; round++) {
          if (controller.signal.aborted) break

          setState((prev) => ({ ...prev, round }))

          for (const model of debaters) {
            if (controller.signal.aborted) break

            const turnController = new AbortController()
            const timeoutId = setTimeout(() => turnController.abort(), TURN_TIMEOUT)

            const onAbort = () => turnController.abort()
            controller.signal.addEventListener('abort', onAbort, { once: true })

            setState((prev) => ({ ...prev, activeModelId: model.id }))

            const ownTranscript = transcriptsRef.current[model.id] || []
            const prompt = buildPrompt(topic, ownTranscript, round)

            try {
              const content = await chat({
                provider: model.provider,
                model: model.model,
                apiKey: model.apiKey,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.8,
                maxTokens: 200,
                baseUrl: model.baseUrl,
                signal: turnController.signal,
              })

              if (controller.signal.aborted) break

              if (!content || !content.trim()) {
                addMessage({
                  id: nextMsgId(),
                  modelId: model.id,
                  modelName: model.name,
                  content: '[Empty response from provider]',
                  round,
                  timestamp: Date.now(),
                })
              } else {
                if (!transcriptsRef.current[model.id]) {
                  transcriptsRef.current[model.id] = []
                }
                transcriptsRef.current[model.id].push(content)

                addMessage({
                  id: nextMsgId(),
                  modelId: model.id,
                  modelName: model.name,
                  content,
                  round,
                  timestamp: Date.now(),
                })
              }
            } catch (err: any) {
              if (controller.signal.aborted) break

              const isTimeout =
                err.name === 'AbortError' && turnController.signal.aborted

              addMessage({
                id: nextMsgId(),
                modelId: model.id,
                modelName: model.name,
                content: isTimeout
                  ? '[Timeout: no response within 20 seconds]'
                  : `[Error: ${err.message}]`,
                round,
                timestamp: Date.now(),
              })
            } finally {
              clearTimeout(timeoutId)
              controller.signal.removeEventListener('abort', onAbort)
              setState((prev) => ({ ...prev, activeModelId: null }))
            }
          }
        }

        if (controller.signal.aborted) return

        if (judge) {
          setState((prev) => ({ ...prev, status: 'judging' as DebateStatus, activeModelId: judge.id }))

          try {
            const judgePrompt = buildJudgePrompt(topic, messagesRef.current)

            const verdictContent = await chat({
              provider: judge.provider,
              model: judge.model,
              apiKey: judge.apiKey,
              messages: [{ role: 'user', content: judgePrompt }],
              temperature: 0.7,
              maxTokens: 600,
              baseUrl: judge.baseUrl,
            })

            if (!controller.signal.aborted) {
              setState((prev) => ({ ...prev, verdict: verdictContent }))
            }
          } catch (err: any) {
            if (!controller.signal.aborted) {
              setState((prev) => ({
                ...prev,
                verdict: `[Judge error: ${err.message}]`,
              }))
            }
          }
        }

        setState((prev) => ({
          ...prev,
          status: 'complete' as DebateStatus,
          activeModelId: null,
        }))
      } catch (err: any) {
        if (!controller.signal.aborted) {
          setState((prev) => ({
            ...prev,
            status: 'idle' as DebateStatus,
            error: err.message,
          }))
        }
      }
    },
    [addMessage]
  )

  const stopDebate = useCallback(() => {
    abortRef.current?.abort()
    setState((prev) => ({
      ...prev,
      status: 'idle',
      activeModelId: null,
    }))
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    messagesRef.current = []
    transcriptsRef.current = {}
    setState({
      topic: '',
      models: [],
      messages: [],
      round: 0,
      totalRounds: TOTAL_ROUNDS,
      status: 'idle',
      error: null,
      activeModelId: null,
      verdict: null,
      judgeName: null,
    })
  }, [])

  return { state, startDebate, stopDebate, reset }
}
