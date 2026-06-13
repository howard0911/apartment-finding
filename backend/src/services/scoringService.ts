import { Apartment, UserPreferences } from '../types'

export function scoreApartments(apartments: Apartment[], prefs: UserPreferences): Apartment[] {
  return apartments
    .map((apt) => {
      const priceScore = calcPriceScore(apt, prefs)
      const commuteScore = calcCommuteScore(apt, prefs)
      const safetyScore = (apt.safetyScore ?? 50) / 10
      const amenitiesScore = calcAmenitiesScore(apt, prefs)
      const weights = weightsFromPriorities(prefs.priorities)
      const score =
        priceScore * weights.price +
        commuteScore * weights.commute +
        safetyScore * weights.safety +
        amenitiesScore * weights.amenities
      return { ...apt, score }
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
}

function calcPriceScore(apt: Apartment, prefs: UserPreferences) {
  const rent = apt.units[0]?.rent ?? 0
  if (!prefs.budgetMin || !prefs.budgetMax) return 5
  if (rent < prefs.budgetMin || rent > prefs.budgetMax) return 0
  const mid = (prefs.budgetMin + prefs.budgetMax) / 2
  const distance = Math.abs(rent - mid)
  const span = prefs.budgetMax - prefs.budgetMin || 1
  const normalized = Math.max(0, 1 - distance / span)
  return normalized * 10
}

function calcCommuteScore(apt: Apartment, prefs: UserPreferences) {
  if (!prefs.commuteDestinations?.length || !apt.commuteInfo?.length) return 5
  let best = 0
  for (const dest of prefs.commuteDestinations) {
    const match = apt.commuteInfo.find((c) => c.destinationLabel === dest.label && c.mode === dest.mode)
    if (!match) continue
    if (dest.maxMinutes && match.durationMinutes <= dest.maxMinutes) best = Math.max(best, 10)
    else if (match.durationMinutes) best = Math.max(best, Math.max(0, 10 - (match.durationMinutes - (dest.maxMinutes || 0)) / 5))
  }
  return best || 5
}

function calcAmenitiesScore(apt: Apartment, prefs: UserPreferences) {
  const amenities = apt.amenities?.map((a) => a.toLowerCase()) || []
  const mustHaveHits = (prefs.mustHave || []).filter((m) => amenities.includes(m.toLowerCase())).length
  const mustNotHits = (prefs.mustNotHave || []).filter((m) => amenities.includes(m.toLowerCase())).length
  return Math.max(0, 5 + mustHaveHits * 2 - mustNotHits * 3)
}

function weightsFromPriorities(priorities: string[]) {
  const base = { price: 1, commute: 1, safety: 1, amenities: 1 }
  priorities.forEach((p, idx) => {
    const weight = Math.max(1, 2 - idx * 0.2)
    if (p.toLowerCase().includes('price')) base.price = weight
    if (p.toLowerCase().includes('commute')) base.commute = weight
    if (p.toLowerCase().includes('safety')) base.safety = weight
    if (p.toLowerCase().includes('amenities')) base.amenities = weight
  })
  return base
}
