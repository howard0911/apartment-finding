export type CommuteMode = 'driving' | 'transit' | 'walking'

export interface CommuteRequest {
  origin: { lat: number; lng: number }
  destination: string
  mode: CommuteMode
}

export interface CommuteResult {
  mode: CommuteMode
  durationMinutes: number
  distanceKm?: number
  rawApiResponse?: any
}

// Google Distance Matrix implementation (swap-able)
// TODO: move to backend proxy to hide API key in production.
const GOOGLE_API_KEY = import.meta.env.VITE_MAPS_API_KEY

export async function fetchCommute(req: CommuteRequest): Promise<CommuteResult | null> {
  const url = 'https://maps.googleapis.com/maps/api/distancematrix/json'
  const params = new URLSearchParams({
    origins: `${req.origin.lat},${req.origin.lng}`,
    destinations: req.destination,
    mode: req.mode,
    key: GOOGLE_API_KEY
  })
  try {
    const res = await fetch(`${url}?${params.toString()}`)
    const data = await res.json()
    const element = data?.rows?.[0]?.elements?.[0]
    if (!element || element.status !== 'OK') return null
    const durationSeconds = element.duration?.value
    const distanceMeters = element.distance?.value
    return {
      mode: req.mode,
      durationMinutes: durationSeconds ? Math.round(durationSeconds / 60) : 0,
      distanceKm: distanceMeters ? Math.round((distanceMeters / 1000) * 10) / 10 : undefined,
      rawApiResponse: data
    }
  } catch (err) {
    console.error('Commute fetch error', err)
    return null
  }
}

export async function fetchCommuteBatch(
  apartments: { id: string; lat: number; lng: number }[],
  destination: string,
  modes: CommuteMode[]
): Promise<Record<string, Record<CommuteMode, CommuteResult>>> {
  const results: Record<string, Record<CommuteMode, CommuteResult>> = {}
  await Promise.all(
    apartments.map(async (apt) => {
      const perMode: Record<CommuteMode, CommuteResult> = {} as any
      await Promise.all(
        modes.map(async (mode) => {
          const r = await fetchCommute({ origin: { lat: apt.lat, lng: apt.lng }, destination, mode })
          if (r) perMode[mode] = r
        })
      )
      results[apt.id] = perMode
    })
  )
  return results
}
