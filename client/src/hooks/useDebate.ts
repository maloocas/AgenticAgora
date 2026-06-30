import { useCallback, useRef, useState } from 'react'
import { chat } from '../api/client'
import type { DebateMessage, DebateState, DebateStatus, ModelConfig } from '../types'

const DEBATE_ROUNDS = 3

function buildSystemPrompt(models: ModelConfig[], topic: string, round: number): string {
  const otherModels = models.map((m) => m.name).join(', ')

  if (round === 1) {
    return `You are participating in a philosophical debate. The other participants are: ${otherModels}. The topic is: "${topic}".

Express your authentic perspective on this topic. Build a substantive argument from your own reasoning. You are not roleplaying anyone — speak in your own voice as an AI. Be concise (2-3 paragraphs) but rigorous.`
  }

  if (round === 2) {
    return `You are in round 2 of a philosophical debate. The topic is: "${topic}". The other participants (${otherModels}) have already presented their opening arguments.

Read the debate so far carefully. Critique the other participants' positions where you disagree, acknowledge where they make strong points, and refine your own position. Be direct and engaging. Do not just repeat your first argument.`
  }

  return `You are in the final round of a philosophical debate. The topic is: "${topic}". 

Synthesize the debate so far. Identify the deepest points of agreement and the most fundamental disagreements. Push the discussion toward its philosophical core. Offer a concluding reflection that does justice to the complexity of the discussion.`
}

function buildMessages(
  modelId: string,
  models: ModelConfig[],
  topic: string,
  round: number,
  previousMessages: DebateMessage[]
): { role: string; content: string }[] {
  const model = models.find((m) => m.id === modelId)
  const systemPrompt = buildSystemPrompt(models, topic, round)

  const msgs: { role: string; content: string }[] = [{ role: 'system', content: systemPrompt }]

  if (round === 1) {
    msgs.push({ role: 'user', content: `Please present your opening argument on: "${topic}"` })
  } else {
    const debateText = previousMessages
      .map((m) => `[${m.modelName}]: ${m.content}`)
      .join('\n\n---\n\n')

    if (round === 2) {
      msgs.push({
        role: 'user',
        content: `Here is the debate so far:\n\n${debateText}\n\nPlease critique the other positions and refine your own.`,
      })
    } else {
      msgs.push({
        role: 'user',
        content: `Here is the full debate:\n\n${debateText}\n\nOffer your final synthesis and concluding reflection.`,
      })
    }
  }

  return msgs
}

let msgIdCounter = 0
function nextMsgId(): string {
  return `msg-${++msgIdCounter}`
}

export function useDebate() {
  const [state, setState] = useState<DebateState>({
    topic: '',
    models: [],
    messages: [],
    round: 0,
    status: 'idle',
    error: null,
  })

  const abortRef = useRef<AbortController | null>(null)
  const messagesRef = useRef<DebateMessage[]>([])

  const updateStatus = useCallback((status: DebateStatus, error: string | null = null) => {
    setState((prev) => ({ ...prev, status, error }))
  }, [])

  const addMessage = useCallback((msg: DebateMessage) => {
    messagesRef.current = [...messagesRef.current, msg]
    setState((prev) => ({ ...prev, messages: messagesRef.current }))
  }, [])

  const startDebate = useCallback(
    async (topic: string, models: ModelConfig[]) => {
      messagesRef.current = []
      setState({
        topic,
        models,
        messages: [],
        round: 1,
        status: 'running',
        error: null,
      })

      const controller = new AbortController()
      abortRef.current = controller

      try {
        for (let round = 1; round <= DEBATE_ROUNDS; round++) {
          setState((prev) => ({ ...prev, round }))

          for (const model of models) {
            if (controller.signal.aborted) return

            const messages = buildMessages(
              model.id,
              models,
              topic,
              round,
              messagesRef.current
            )

            try {
              const content = await chat({
                provider: model.provider,
                model: model.model,
                apiKey: model.apiKey,
                messages,
                temperature: 0.8,
                maxTokens: 2048,
                baseUrl: model.baseUrl,
              })

              if (controller.signal.aborted) return

              addMessage({
                id: nextMsgId(),
                modelId: model.id,
                modelName: model.name,
                content,
                round,
                timestamp: Date.now(),
              })
            } catch (err: any) {
              addMessage({
                id: nextMsgId(),
                modelId: model.id,
                modelName: model.name,
                content: `[Error: ${err.message}]`,
                round,
                timestamp: Date.now(),
              })
            }
          }
        }

        updateStatus('complete')
      } catch (err: any) {
        if (!controller.signal.aborted) {
          updateStatus('idle', err.message)
        }
      }
    },
    [addMessage, updateStatus]
  )

  const stopDebate = useCallback(() => {
    abortRef.current?.abort()
    updateStatus('idle')
  }, [updateStatus])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    messagesRef.current = []
    setState({
      topic: '',
      models: [],
      messages: [],
      round: 0,
      status: 'idle',
      error: null,
    })
  }, [])

  return { state, startDebate, stopDebate, reset }
}
