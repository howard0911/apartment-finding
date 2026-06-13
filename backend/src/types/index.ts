export interface UserPreferences {
  city: string
  useCurrentLocation: boolean
  currentLocationLatLng?: { lat: number; lng: number }
  budgetMin: number
  budgetMax: number
  moveInDate: string // ISO string
  commuteDestinations: {
    label: string
    address: string
    mode: 'driving' | 'transit' | 'walking'
    maxMinutes: number
  }[]
  mustHave: string[]
  mustNotHave: string[]
  priorities: string[]
}

export interface Apartment {
  id: string
  name: string
  address: string
  city: string
  lat: number
  lng: number
  units: {
    id: string
    bedBath: string
    rent: number
    leaseTermMonths: number
    utilitiesFee?: number
    availableDate: string
  }[]
  amenities: string[]
  officialWebsiteUrl?: string
  commuteInfo?: {
    destinationLabel: string
    mode: string
    durationMinutes: number
  }[]
  safetyScore?: number
  neighborhoodNote?: string
  reviewSummary?: {
    pros: string[]
    cons: string[]
    personalizedNote?: string
  }
  videos?: {
    platform: 'youtube'
    title: string
    url: string
    thumbnailUrl: string
  }[]
  score?: number
}
