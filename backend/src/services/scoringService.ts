import { Apartment, UserPreferences } from '../types'

const DAY_MS = 24 * 3600 * 1000

/** Drops apartments that fail hard filters, scores the rest, and sorts best first. */
export function rankApartments(apartments: Apartment[], preferences: UserPreferences, query: string): Apartment[] {
  const search = query.trim().toLowerCase()
  return apartments
    .filter((ap) => passesBasicFilters(ap, preferences))
    .map((ap) => ({
      ...ap,
      priorityScore: scoreApartment(ap, preferences, search),
      commuteScore: scoreCommute(ap, preferences)
    }))
    .sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0))
}

function passesBasicFilters(apartment: Apartment, preferences: UserPreferences): boolean {
  if (preferences.maxPrice !== undefined && apartment.price > preferences.maxPrice) return false
  if (preferences.minPrice !== undefined && apartment.price < preferences.minPrice) return false
  if (preferences.preferredMoveInDate && apartment.availableDate) {
    const pref = new Date(preferences.preferredMoveInDate).getTime()
    const avail = new Date(apartment.availableDate).getTime()
    if (avail - pref > 60 * DAY_MS) return false
  }
  if (preferences.preferredCities.length && !preferences.preferredCities.map((c) => c.toLowerCase()).includes(apartment.city.toLowerCase())) {
    return false
  }
  if (preferences.preferredPropertyTypes.length && !preferences.preferredPropertyTypes.includes(apartment.propertyType)) return false
  if (preferences.dealBreakers.length) {
    const text = `${apartment.title} ${apartment.description} ${apartment.neighborhoodNote ?? ''} ${apartment.amenities.join(' ')}`.toLowerCase()
    if (preferences.dealBreakers.some((d) => text.includes(d.toLowerCase()))) return false
  }
  if (preferences.maxCommuteTime && preferences.commuteMode && apartment.commuteOptions) {
    const best = apartment.commuteOptions.find((c) => c.mode === preferences.commuteMode)
    if (best && best.timeMinutes > preferences.maxCommuteTime) return false
  }
  return true
}

function scoreApartment(apartment: Apartment, preferences: UserPreferences, search: string): number {
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
    if (best && best.timeMinutes <= preferences.maxCommuteTime) {
      score += 8
      if (best.timeMinutes <= preferences.maxCommuteTime / 2) score += 4
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

function scoreCommute(apartment: Apartment, preferences: UserPreferences): number {
  if (!preferences.maxCommuteTime || !preferences.commuteMode) return 0
  const time = apartment.commuteTimeByMode?.[preferences.commuteMode]
  if (time === undefined) return 0
  if (time <= preferences.maxCommuteTime) return 10
  if (time <= preferences.maxCommuteTime * 1.5) return 5
  return -5
}
