export type PropertyVideo = {
  id: string
  title: string
  description: string
  videoURL: string
  thumbnailURL: string
  duration: string
  source: 'YouTube' | 'Vimeo' | 'Instagram' | 'TikTok'
  apartmentId?: string
  tags: string[]
}

export async function searchPropertyVideos(query: string): Promise<PropertyVideo[]> {
  await new Promise((r) => setTimeout(r, 500))
  return generateSampleVideos(query)
}

function generateSampleVideos(query: string): PropertyVideo[] {
  return [
    {
      id: 'v1',
      title: `${query} - Full Property Tour`,
      description: 'Complete walkthrough',
      videoURL: 'https://www.youtube.com/watch?v=sample1',
      thumbnailURL: 'https://example.com/thumbnail1.jpg',
      duration: '5:32',
      source: 'YouTube',
      apartmentId: undefined,
      tags: ['property tour']
    },
    {
      id: 'v2',
      title: `${query} - Neighborhood Guide`,
      description: 'Neighborhood guide',
      videoURL: 'https://www.youtube.com/watch?v=sample2',
      thumbnailURL: 'https://example.com/thumbnail2.jpg',
      duration: '3:45',
      source: 'YouTube',
      apartmentId: undefined,
      tags: ['neighborhood']
    },
    {
      id: 'v3',
      title: `${query} - Room Tour + Amenities`,
      description: 'Quick look at interior finishes and parking access.',
      videoURL: 'https://www.youtube.com/watch?v=sample3',
      thumbnailURL: 'https://example.com/thumbnail3.jpg',
      duration: '4:12',
      source: 'YouTube',
      apartmentId: undefined,
      tags: ['room tour', 'amenities']
    }
  ]
}

export function extractYouTubeVideoID(url: string): string | null {
  const m = url.match(/v=([a-zA-Z0-9_-]+)/)
  return m ? m[1] : null
}

export function getEmbedURL(video: PropertyVideo): string {
  if (video.source === 'YouTube') {
    const id = extractYouTubeVideoID(video.videoURL)
    return id ? `https://www.youtube.com/embed/${id}` : video.videoURL
  }
  return video.videoURL
}
