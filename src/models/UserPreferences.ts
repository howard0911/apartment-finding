export interface UserPreferences {
  maxPrice?: number
  minPrice?: number
  preferredCities: string[]
  preferredNeighborhoods: string[]
  minBedrooms?: number
  maxBedrooms?: number
  minBathrooms?: number
  maxBathrooms?: number
  minSquareFeet?: number
  maxSquareFeet?: number
  preferredPropertyTypes: string[]
  requiredAmenities: string[]
  preferredPetPolicy?: string
  maxCommuteTime?: number
  commuteMode?: 'Drive' | 'Transit' | 'Bike' | 'Walk'
  preferredMoveInDate?: string
  mustHaveFeatures: string[]
  dealBreakers: string[]
  additionalPoints: string[]
  // Lightweight state for stepwise survey UI
  currentStep?: number
}

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
