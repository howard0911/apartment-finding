import type { UserPreferences } from '../../backend/src/types'

export type { UserPreferences }

export const samplePreferences: UserPreferences = {
  maxPrice: undefined,
  minPrice: undefined,
  preferredCities: [],
  preferredNeighborhoods: [],
  minBedrooms: 1,
  maxBedrooms: 2,
  minBathrooms: 1.0,
  maxBathrooms: 2.0,
  minSquareFeet: 500,
  maxSquareFeet: 1200,
  preferredPropertyTypes: ['Apartment'],
  requiredAmenities: [],
  preferredPetPolicy: 'Allowed',
  maxCommuteTime: undefined,
  commuteMode: undefined,
  preferredMoveInDate: '',
  mustHaveFeatures: [],
  dealBreakers: [],
  additionalPoints: ['Quiet building', 'Walkable to groceries', 'Good sunlight']
}
