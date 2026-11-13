import type { Apartment, PropertyVideo, ReviewSummary } from '../models/Apartment'
import type { ReviewSummaryRequest, ReviewSummaryResponse, SearchRequest, SearchResponse, VideosResponse } from '../../backend/src/types'

/** Calls the backend; in dev, Vite proxies /api to the backend on :4000. Throws with status and body on failure. */
async function requestJson<T>(method: 'GET' | 'POST', path: string, body: SearchRequest | ReviewSummaryRequest | null): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${method} ${path} failed: status=${res.status} body=${text}`)
  }
  return (await res.json()) as T
}

export async function searchApartments(request: SearchRequest): Promise<Apartment[]> {
  const data = await requestJson<SearchResponse>('POST', '/api/search', request)
  return data.results
}

export async function fetchApartmentVideos(apartmentId: string): Promise<PropertyVideo[]> {
  const data = await requestJson<VideosResponse>('GET', `/api/apartments/${encodeURIComponent(apartmentId)}/videos`, null)
  return data.videos
}

export async function fetchReviewSummary(apartmentId: string, priorities: string[]): Promise<ReviewSummary | null> {
  const data = await requestJson<ReviewSummaryResponse>('POST', `/api/apartments/${encodeURIComponent(apartmentId)}/review-summary`, { priorities })
  return data.summary
}
