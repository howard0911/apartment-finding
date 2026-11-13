/**
 * API contract shared by the backend and the frontend.
 * The frontend imports these with `import type`, so this file must stay type-only.
 */

export type PropertyType = 'Apartment' | 'Condo' | 'Townhouse' | 'Studio' | 'Loft'

export type Amenity =
  | 'Parking'
  | 'Gym'
  | 'Pool'
  | 'Laundry'
  | 'Balcony'
  | 'Dishwasher'
  | 'Air Conditioning'
  | 'Heating'
  | 'Furnished'
  | 'Storage'
  | 'Elevator'
  | 'Doorman'
  | 'Security'
  | 'WiFi'
  | 'Cable'

export type PetPolicy = 'Allowed' | 'Not Allowed' | 'Cats Only' | 'Dogs Only' | 'Case by Case'

export type CommuteMode = 'Drive' | 'Transit' | 'Bike' | 'Walk'

export type LatLng = {
  lat: number
  lng: number
}

/** Commute time stated by the listing itself. */
export type CommuteOption = {
  mode: CommuteMode
  timeMinutes: number
  note?: string
}

export type RiskFlag = {
  type: 'Safety' | 'Noise' | 'Flood' | 'Construction'
  note: string
}

export type ReviewSummary = {
  pros: string[]
  cons: string[]
  personalizedNote: string
}

export type PropertyVideo = {
  platform: 'youtube'
  title: string
  url: string
  thumbnailUrl: string
}

export interface Apartment {
  id: string
  title: string
  address: string
  city: string
  state: string
  zipCode: string
  price: number
  bedrooms: number
  bathrooms: number
  squareFeet?: number
  propertyType: PropertyType
  amenities: Amenity[]
  petPolicy: PetPolicy
  availableDate?: string
  leaseTermMonths?: number
  utilitiesEstimate?: number
  neighborhood?: string
  neighborhoodNote?: string
  commuteOptions?: CommuteOption[]
  externalURL?: string
  riskFlags?: RiskFlag[]
  description: string
  imageURLs: string[]
  videoURLs: string[]
  latitude?: number
  longitude?: number
  rating?: number
  reviewCount?: number
  /** Minutes to the user's commute destination, computed by the backend. */
  commuteTimeByMode?: Partial<Record<CommuteMode, number>>
  commuteScore?: number
  priorityScore?: number
}

export interface UserPreferences {
  maxPrice?: number
  minPrice?: number
  preferredCities: string[]
  preferredNeighborhoods: string[]
  currentLocationLatLng?: LatLng
  minBedrooms?: number
  maxBedrooms?: number
  minBathrooms?: number
  maxBathrooms?: number
  minSquareFeet?: number
  maxSquareFeet?: number
  preferredPropertyTypes: string[]
  requiredAmenities: string[]
  preferredPetPolicy?: string
  /** Work/school address used for commute times. */
  commuteDestination?: string
  maxCommuteTime?: number
  commuteMode?: CommuteMode
  preferredMoveInDate?: string
  mustHaveFeatures: string[]
  dealBreakers: string[]
  /** Ordered nice-to-haves; earlier items weigh more. */
  additionalPoints: string[]
}

export interface SearchRequest {
  query: string
  preferences: UserPreferences
}

export interface SearchResponse {
  results: Apartment[]
}

/** GET /api/apartments/:id/videos. Empty when YOUTUBE_API_KEY is not configured. */
export interface VideosResponse {
  videos: PropertyVideo[]
}

/** POST /api/apartments/:id/review-summary */
export interface ReviewSummaryRequest {
  /** The user's ordered nice-to-haves, used to personalize the summary. */
  priorities: string[]
}

/** `summary` is null when GROQ_API_KEY is not configured. */
export interface ReviewSummaryResponse {
  summary: ReviewSummary | null
}
