import axios from 'axios'
import { Apartment, ReviewSummary } from '../types'
import { withRetry } from './http'

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'openai/gpt-oss-20b'
/** gpt-oss spends part of this budget on reasoning before the JSON answer. */
const MAX_COMPLETION_TOKENS = 1024

const SYSTEM_PROMPT =
  'You summarize apartment reviews for a renter. Reply with a JSON object only, shaped as ' +
  '{"pros": string[], "cons": string[], "personalizedNote": string}. ' +
  'Use short English phrases taken from the reviews. personalizedNote is one sentence relating the reviews to the renter priorities.'

type ChatCompletionResponse = {
  choices: { message: { content: string | null } }[]
}

/** Process-lifetime cache keyed by apartment and priorities, so each summary is generated once. */
const summaryCache = new Map<string, ReviewSummary>()

/** Summary of one apartment's reviews; null when GROQ_API_KEY is not configured. */
export async function summarizeApartmentReviews(apt: Apartment, priorities: string[]): Promise<ReviewSummary | null> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    console.warn('review summary skipped', { reason: 'GROQ_API_KEY is not set', apartmentId: apt.id })
    return null
  }
  const cacheKey = `${apt.id}|${priorities.join('|')}`
  const cached = summaryCache.get(cacheKey)
  if (cached) return cached
  const summary = await requestSummary(fetchRawReviews(apt), priorities, apiKey)
  summaryCache.set(cacheKey, summary)
  return summary
}

function fetchRawReviews(_apt: Apartment): string[] {
  // TODO: fetch real reviews from Google Places / Yelp (Phase 5)
  return ['Loved the staff response time.', 'Some street noise on weekends.']
}

async function requestSummary(reviews: string[], priorities: string[], apiKey: string): Promise<ReviewSummary> {
  const body = {
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Renter priorities (most important first): ${priorities.join(', ') || 'none'}\nReviews:\n${reviews.map((r) => `- ${r}`).join('\n')}` }
    ],
    response_format: { type: 'json_object' },
    reasoning_effort: 'low',
    max_completion_tokens: MAX_COMPLETION_TOKENS
  }
  const data = await withRetry('groq review summary', { model: GROQ_MODEL, reviews: reviews.length }, async () => {
    const res = await axios.post<ChatCompletionResponse>(GROQ_CHAT_URL, body, { headers: { Authorization: `Bearer ${apiKey}` } })
    return res.data
  })
  const content = data.choices[0]?.message.content ?? ''
  return parseSummary(content)
}

/** Parses the model's JSON answer; throws with the raw content when the shape is wrong. */
function parseSummary(content: string): ReviewSummary {
  let parsed: { pros?: string[]; cons?: string[]; personalizedNote?: string }
  try {
    parsed = JSON.parse(content)
  } catch (err) {
    throw new Error(`Groq review summary is not valid JSON: ${err instanceof Error ? err.message : String(err)} content=${content}`)
  }
  const isStringList = (v: string[] | undefined): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string')
  if (!isStringList(parsed.pros) || !isStringList(parsed.cons) || typeof parsed.personalizedNote !== 'string') {
    throw new Error(`Groq review summary has the wrong shape: content=${content}`)
  }
  return { pros: parsed.pros, cons: parsed.cons, personalizedNote: parsed.personalizedNote }
}
