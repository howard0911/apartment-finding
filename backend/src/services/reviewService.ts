import { Apartment, UserPreferences } from '../types'
import axios from 'axios'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function enrichWithReviews(apartments: Apartment[], prefs: UserPreferences): Promise<Apartment[]> {
  return Promise.all(
    apartments.map(async (apt) => {
      try {
        const rawReviews = await fetchRawReviews(apt)
        const summary = await summarizeReviews(rawReviews, prefs)
        return { ...apt, reviewSummary: summary }
      } catch {
        return {
          ...apt,
          reviewSummary: {
            pros: ['管理回應快 (mock)', '公共空間乾淨 (mock)'],
            cons: ['週末街道較吵 (mock)'],
            personalizedNote: '根據你的優先順序提供的預設摘要（API 待串）。'
          }
        }
      }
    })
  )
}

async function fetchRawReviews(_apt: Apartment) {
  // TODO: 串接 Google Places / Yelp Reviews，回傳原始評論文本/分數
  return ['Loved the staff response time.', 'Some street noise on weekends.']
}

async function summarizeReviews(reviews: string[], prefs: UserPreferences) {
  const prompt = `總結以下公寓評論，列出優點/缺點，並根據使用者優先順序(${prefs.priorities.join(',')})給一句個人化建議：\n${reviews.join('\n')}`
  if (GROQ_API_KEY) {
    return llmCall('groq', prompt)
  }
  if (OPENAI_API_KEY) {
    return llmCall('openai', prompt)
  }
  return {
    pros: ['管理友善 (mock)'],
    cons: ['周遭偶有噪音 (mock)'],
    personalizedNote: 'LLM 金鑰未設置，使用預設摘要。'
  }
}

async function llmCall(provider: 'groq' | 'openai', prompt: string) {
  try {
    if (provider === 'groq') {
      const { data } = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        { model: 'mixtral-8x7b-32768', messages: [{ role: 'user', content: prompt }] },
        { headers: { Authorization: `Bearer ${GROQ_API_KEY}` } }
      )
      const text = data?.choices?.[0]?.message?.content || ''
      return parseLLMText(text)
    }
    const { data } = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      { model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }] },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
    )
    const text = data?.choices?.[0]?.message?.content || ''
    return parseLLMText(text)
  } catch {
    return {
      pros: ['總結失敗 (fallback)'],
      cons: [],
      personalizedNote: 'LLM 呼叫失敗，請稍後重試。'
    }
  }
}

function parseLLMText(text: string) {
  const pros = []
  const cons = []
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  for (const line of lines) {
    if (/pros?:/i.test(line)) continue
    if (/cons?:/i.test(line)) continue
    if (line.startsWith('-') || line.startsWith('•')) {
      if (line.toLowerCase().includes('缺') || line.toLowerCase().includes('con')) cons.push(line.replace(/^[-•]\s*/, ''))
      else pros.push(line.replace(/^[-•]\s*/, ''))
    }
  }
  return {
    pros: pros.length ? pros : ['位置方便 (LLM 解析 fallback)'],
    cons: cons.length ? cons : ['需注意噪音 (LLM 解析 fallback)'],
    personalizedNote: '由 LLM 摘要生成（可調整提示詞與格式）。'
  }
}
