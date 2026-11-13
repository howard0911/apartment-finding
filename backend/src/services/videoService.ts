import axios from 'axios'
import { Apartment, PropertyVideo } from '../types'
import { withRetry } from './http'

const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search'
const MAX_RESULTS = 2

type YouTubeSearchResponse = {
  items: {
    id: { videoId: string }
    snippet: { title: string; thumbnails: { default: { url: string } } }
  }[]
}

/**
 * Process-lifetime cache by apartment id. Each YouTube search costs 100 of the
 * 10,000 daily quota units, so an apartment is searched at most once.
 */
const videoCache = new Map<string, PropertyVideo[]>()

/** Tour videos for one apartment; empty when YOUTUBE_API_KEY is not configured. */
export async function findApartmentVideos(apt: Apartment): Promise<PropertyVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    console.warn('video search skipped', { reason: 'YOUTUBE_API_KEY is not set', apartmentId: apt.id })
    return []
  }
  const cached = videoCache.get(apt.id)
  if (cached) return cached
  const videos = await searchYouTube(`${apt.title} ${apt.city} apartment tour`, apiKey)
  videoCache.set(apt.id, videos)
  return videos
}

async function searchYouTube(query: string, apiKey: string): Promise<PropertyVideo[]> {
  const params = { part: 'snippet', q: query, maxResults: MAX_RESULTS, type: 'video' }
  const data = await withRetry('youtube search', { query }, async () => {
    const res = await axios.get<YouTubeSearchResponse>(YOUTUBE_SEARCH_URL, { params: { ...params, key: apiKey } })
    return res.data
  })
  return data.items.map((item) => ({
    platform: 'youtube' as const,
    title: item.snippet.title,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    thumbnailUrl: item.snippet.thumbnails.default.url
  }))
}
