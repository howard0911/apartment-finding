export interface GeocodeResult {
  lat: number
  lng: number
  formattedAddress: string
  city?: string
  neighborhood?: string
}

export interface PlaceSuggestion {
  description: string
  placeId: string
}

export interface GeocodingProvider {
  autocomplete(input: string): Promise<PlaceSuggestion[]>
  geocode(input: string | { placeId: string }): Promise<GeocodeResult | null>
}

// Google Maps implementation (can be swapped for Mapbox)
// TODO: move API calls to backend proxy to hide keys in production.
const GOOGLE_API_KEY = import.meta.env.VITE_MAPS_API_KEY
const GOOGLE_PLACES_BASE = 'https://maps.googleapis.com/maps/api/place'

export const GoogleGeocodingService: GeocodingProvider = {
  async autocomplete(input: string) {
    if (!input.trim()) return []
    const url = `${GOOGLE_PLACES_BASE}/autocomplete/json`
    const params = new URLSearchParams({
      input,
      key: GOOGLE_API_KEY
    })
    const res = await fetch(`${url}?${params.toString()}`)
    const data = await res.json()
    return (data.predictions || []).map((p: any) => ({
      description: p.description,
      placeId: p.place_id
    }))
  },

  async geocode(input: string | { placeId: string }) {
    const url = `${GOOGLE_PLACES_BASE}/details/json`
    const params = new URLSearchParams({
      key: GOOGLE_API_KEY
    })
    if (typeof input === 'string') params.set('place_id', input)
    else params.set('place_id', input.placeId)
    const res = await fetch(`${url}?${params.toString()}`)
    const data = await res.json()
    const result = data.result
    if (!result?.geometry?.location) return null
    const cityComp = (result.address_components || []).find((c: any) => c.types.includes('locality'))
    const neighborhoodComp = (result.address_components || []).find((c: any) => c.types.includes('neighborhood'))
    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
      city: cityComp?.long_name,
      neighborhood: neighborhoodComp?.long_name
    }
  }
}

export const GeocodingService = GoogleGeocodingService
