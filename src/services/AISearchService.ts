import { Apartment, sampleData } from '../models/Apartment'
import { UserPreferences } from '../models/UserPreferences'
import { fetchCommuteBatch, CommuteMode } from './CommuteService'

export async function performAISearch(query: string, preferences: UserPreferences): Promise<Apartment[]> {
  await new Promise((r) => setTimeout(r, 600))
  const enriched = await enrichCommuteData(sampleData, preferences)
  return processAISearch(query, enriched, preferences)
}

async function enrichCommuteData(apartments: Apartment[], preferences: UserPreferences) {
  if (!preferences.preferredNeighborhoods?.length) return apartments
  const destination = preferences.preferredNeighborhoods[0]
  const modes: CommuteMode[] = ['transit', 'driving']
  const commuteMap = await fetchCommuteBatch(
    apartments.map((a) => ({ id: a.id, lat: a.latitude || a.lat || 0, lng: a.longitude || a.lng || 0 })),
    destination,
    modes
  )
  return apartments.map((a) => {
    const data = commuteMap[a.id] || {}
    const commuteTimeByMode: Record<string, number> = {}
    Object.entries(data).forEach(([mode, res]) => {
      if ((res as any)?.durationMinutes !== undefined) commuteTimeByMode[mode] = (res as any).durationMinutes
    })
    return { ...a, commuteTimeByMode }
  })
}

function processAISearch(query: string, apartments: Apartment[], preferences: UserPreferences): Apartment[] {
  const lower = query.trim().toLowerCase()
  const filtered = apartments.filter((ap) => passesBasicFilters(ap, preferences))
  const scored = filtered
    .map((ap) => {
      const score = scoreApartment(ap, preferences, lower)
      return { ...ap, priorityScore: score, commuteScore: scoreCommute(ap, preferences) }
    })
    .sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0))
  return scored
}

function passesBasicFilters(apartment: Apartment, preferences: UserPreferences) {
  if (preferences.maxPrice !== undefined && apartment.price > preferences.maxPrice) return false
  if (preferences.minPrice !== undefined && apartment.price < preferences.minPrice) return false
  if (preferences.preferredMoveInDate && apartment.availableDate) {
    const pref = new Date(preferences.preferredMoveInDate).getTime()
    const avail = new Date(apartment.availableDate).getTime()
    if (avail - pref > 60 * 24 * 3600 * 1000) return false
  }
  if (preferences.preferredCities.length && !preferences.preferredCities.map((c) => c.toLowerCase()).includes(apartment.city.toLowerCase())) {
    return false
  }
  if (preferences.preferredPropertyTypes.length && !preferences.preferredPropertyTypes.includes(apartment.propertyType)) return false
  if (preferences.dealBreakers.length) {
    const combinedText = `${apartment.title} ${apartment.description} ${apartment.neighborhoodNote ?? ''} ${apartment.amenities.join(' ')}`
    const lower = combinedText.toLowerCase()
    const hasDealBreaker = preferences.dealBreakers.some((d) => lower.includes(d.toLowerCase()))
    if (hasDealBreaker) return false
  }
  if (preferences.maxCommuteTime && preferences.commuteMode && apartment.commuteOptions) {
    const best = apartment.commuteOptions.find((c) => c.mode === preferences.commuteMode)
    if (best && best.timeMinutes > preferences.maxCommuteTime) return false
  }
  return true
}

function scoreApartment(apartment: Apartment, preferences: UserPreferences, search: string) {
  let score = 0
  if (preferences.preferredCities.includes(apartment.city)) score += 12
  if (preferences.preferredNeighborhoods.some((n) => (apartment.neighborhood ?? '').toLowerCase().includes(n.toLowerCase()))) score += 8
  if (preferences.preferredPropertyTypes.includes(apartment.propertyType)) score += 10
  if (preferences.preferredPetPolicy && apartment.petPolicy === preferences.preferredPetPolicy) score += 6
  const matchingAmenities = apartment.amenities.filter((m) => preferences.requiredAmenities.includes(m))
  score += matchingAmenities.length * 5
  if (preferences.mustHaveFeatures.length) {
    const text = `${apartment.title} ${apartment.description}`.toLowerCase()
    preferences.mustHaveFeatures.forEach((f) => {
      if (text.includes(f.toLowerCase())) score += 4
    })
  }
  if (preferences.maxCommuteTime && apartment.commuteOptions?.length) {
    const best = preferences.commuteMode
      ? apartment.commuteOptions.find((c) => c.mode === preferences.commuteMode)
      : apartment.commuteOptions[0]
    if (best && best.timeMinutes <= (preferences.maxCommuteTime ?? Number.MAX_SAFE_INTEGER)) {
      score += 8
      if (best.timeMinutes <= (preferences.maxCommuteTime ?? 0) / 2) score += 4
    }
  }
  if (preferences.additionalPoints.length) {
    const combined = `${apartment.title} ${apartment.description} ${apartment.neighborhoodNote ?? ''}`.toLowerCase()
    preferences.additionalPoints.forEach((p, idx) => {
      if (combined.includes(p.toLowerCase())) score += Math.max(3, 8 - idx)
    })
  }
  if (search.length) {
    const text = `${apartment.title} ${apartment.description} ${apartment.address}`.toLowerCase()
    if (text.includes(search)) score += 10
  }
  if (apartment.rating) score += apartment.rating
  score += scoreCommute(apartment, preferences)
  return score
}

export function getAIRecommendations(preferences: UserPreferences): Apartment[] {
  return processAISearch('', sampleData, preferences)
}

function scoreCommute(apartment: Apartment, preferences: UserPreferences) {
  if (!preferences.maxCommuteTime || !preferences.commuteMode) return 0
  const time = apartment.commuteTimeByMode?.[preferences.commuteMode.toLowerCase()]
  if (time === undefined) return 0
  if (time <= preferences.maxCommuteTime) return 10
  if (time <= preferences.maxCommuteTime * 1.5) return 5
  return -5
}
