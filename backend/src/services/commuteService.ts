import axios from 'axios'
import { Apartment, UserPreferences } from '../types'

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

export async function enrichWithCommute(apartments: Apartment[], prefs: UserPreferences): Promise<Apartment[]> {
  if (!prefs.commuteDestinations?.length) return apartments
  return Promise.all(
    apartments.map(async (apt) => {
      const commuteInfo = await Promise.all(
        prefs.commuteDestinations.map(async (dest) => {
          try {
            const durationMinutes = await fetchDuration(apt, dest.address, dest.mode)
            if (durationMinutes === null) return null
            return {
              destinationLabel: dest.label,
              mode: dest.mode,
              durationMinutes
            }
          } catch {
            return null
          }
        })
      )
      return { ...apt, commuteInfo: commuteInfo.filter(Boolean) as NonNullable<typeof commuteInfo[0]>[] }
    })
  )
}

async function fetchDuration(apartment: Apartment, destination: string, mode: string): Promise<number | null> {
  if (!GOOGLE_API_KEY) return null
  const url = 'https://maps.googleapis.com/maps/api/distancematrix/json'
  const params = {
    origins: `${apartment.lat},${apartment.lng}`,
    destinations: destination,
    mode,
    key: GOOGLE_API_KEY
  }
  try {
    const { data } = await axios.get(url, { params })
    const element = data?.rows?.[0]?.elements?.[0]
    if (element?.status !== 'OK') return null
    const seconds = element.duration?.value
    return seconds ? Math.round(seconds / 60) : null
  } catch (err) {
    // TODO: log error detail; swallow to avoid crashing enrichment
    return null
  }
}
