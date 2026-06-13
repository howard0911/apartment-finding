import axios from 'axios'
import { Apartment } from '../types'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

export async function enrichWithVideos(apartments: Apartment[]): Promise<Apartment[]> {
  if (!YOUTUBE_API_KEY) return apartments
  return Promise.all(
    apartments.map(async (apt) => {
      try {
        const videos = await searchYouTube(`${apt.name} ${apt.city} apartment tour`)
        return { ...apt, videos }
      } catch {
        return apt
      }
    })
  )
}

async function searchYouTube(query: string) {
  const url = 'https://www.googleapis.com/youtube/v3/search'
  const params = {
    key: YOUTUBE_API_KEY,
    part: 'snippet',
    q: query,
    maxResults: 2,
    type: 'video'
  }
  const { data } = await axios.get(url, { params })
  return (data.items || []).map((item: any) => ({
    platform: 'youtube' as const,
    title: item.snippet.title,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    thumbnailUrl: item.snippet.thumbnails?.default?.url
  }))
}
