import { Apartment } from '../types'

export async function enrichWithSafety(apartments: Apartment[]): Promise<Apartment[]> {
  // TODO: replace mock with real crime/safety/neighborhood data
  return apartments.map((apt, idx) => ({
    ...apt,
    safetyScore: 70 + (idx * 5) % 20,
    neighborhoodNote: idx % 2 === 0 ? '安靜住宅區，步行便利 (mock)' : '夜生活熱鬧，略有噪音 (mock)'
  }))
}
