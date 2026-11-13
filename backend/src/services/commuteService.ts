import axios from 'axios'
import { Apartment, CommuteMode, UserPreferences } from '../types'
import { withRetry } from './http'

const ROUTE_MATRIX_URL = 'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix'
const FIELD_MASK = 'originIndex,destinationIndex,duration,condition,status'
/** Routes API allows at most 100 elements per TRANSIT request; 25 origins x 1 destination stays well under every limit. */
const ORIGINS_PER_REQUEST = 25

const ROUTES_TRAVEL_MODE: Record<CommuteMode, string> = {
  Drive: 'DRIVE',
  Transit: 'TRANSIT',
  Bike: 'BICYCLE',
  Walk: 'WALK'
}

type GeoApartment = Apartment & { latitude: number; longitude: number }

/**
 * Process-lifetime cache of commute minutes (null = no route), keyed by origin, destination and mode.
 * Every Routes API element is billed, so repeated searches must not re-query the same pair.
 */
const commuteCache = new Map<string, number | null>()

function cacheKey(apt: GeoApartment, destination: string, mode: CommuteMode): string {
  return `${apt.latitude},${apt.longitude}|${destination.toLowerCase()}|${mode}`
}

type RouteMatrixRequest = {
  origins: { waypoint: { location: { latLng: { latitude: number; longitude: number } } } }[]
  destinations: { waypoint: { address: string } }[]
  travelMode: string
}

type RouteMatrixElement = {
  originIndex: number
  destinationIndex: number
  /** Duration string such as "1455s"; absent when no route exists. */
  duration?: string
  condition?: 'ROUTE_EXISTS' | 'ROUTE_NOT_FOUND' | 'ROUTE_MATRIX_ELEMENT_CONDITION_UNSPECIFIED'
  status?: { code?: number; message?: string }
}

/**
 * Adds commute minutes for the user's chosen mode to `commuteTimeByMode`.
 * Skipped when the user gave no destination/mode or GOOGLE_API_KEY is not configured.
 */
export async function enrichWithCommute(apartments: Apartment[], prefs: UserPreferences): Promise<Apartment[]> {
  const destination = prefs.commuteDestination?.trim()
  const mode = prefs.commuteMode
  if (!destination || !mode) return apartments
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    console.warn('commute enrichment skipped', { reason: 'GOOGLE_API_KEY is not set' })
    return apartments
  }
  const located = apartments.filter(hasLocation)
  const uncached = located.filter((apt) => !commuteCache.has(cacheKey(apt, destination, mode)))
  for (let start = 0; start < uncached.length; start += ORIGINS_PER_REQUEST) {
    const chunk = uncached.slice(start, start + ORIGINS_PER_REQUEST)
    const minutes = await fetchCommuteMinutes(chunk, destination, mode, apiKey)
    minutes.forEach((value, idx) => commuteCache.set(cacheKey(chunk[idx], destination, mode), value))
  }
  return apartments.map((apt) => {
    if (!hasLocation(apt)) return apt
    const minutes = commuteCache.get(cacheKey(apt, destination, mode))
    if (minutes === undefined || minutes === null) return apt
    return { ...apt, commuteTimeByMode: { ...apt.commuteTimeByMode, [mode]: minutes } }
  })
}

function hasLocation(apt: Apartment): apt is GeoApartment {
  return apt.latitude !== undefined && apt.longitude !== undefined
}

/** Returns minutes per origin (same order as `origins`); null where Google finds no route. */
async function fetchCommuteMinutes(origins: GeoApartment[], destination: string, mode: CommuteMode, apiKey: string): Promise<(number | null)[]> {
  const request: RouteMatrixRequest = {
    origins: origins.map((apt) => ({ waypoint: { location: { latLng: { latitude: apt.latitude, longitude: apt.longitude } } } })),
    destinations: [{ waypoint: { address: destination } }],
    travelMode: ROUTES_TRAVEL_MODE[mode]
  }
  const elements = await postRouteMatrix(request, apiKey)
  const minutes: (number | null)[] = origins.map(() => null)
  for (const el of elements) {
    if (el.status?.code) {
      throw new Error(`Route matrix element failed: code=${el.status.code} message=${el.status.message ?? ''} origin=${JSON.stringify(request.origins[el.originIndex])} destination=${destination} mode=${request.travelMode}`)
    }
    if (el.condition !== 'ROUTE_EXISTS' || !el.duration) continue
    minutes[el.originIndex] = Math.round(parseInt(el.duration, 10) / 60)
  }
  return minutes
}

async function postRouteMatrix(request: RouteMatrixRequest, apiKey: string): Promise<RouteMatrixElement[]> {
  const context = { travelMode: request.travelMode, origins: request.origins.length }
  return withRetry('routes compute matrix', context, async () => {
    const res = await axios.post<RouteMatrixElement[]>(ROUTE_MATRIX_URL, request, {
      headers: { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': FIELD_MASK }
    })
    return res.data
  })
}
