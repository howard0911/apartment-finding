import { Apartment, UserPreferences } from '../types'

const mockListings: Apartment[] = [
  {
    id: 'apt-1',
    name: 'Modern Downtown Loft',
    address: '123 Main St',
    city: 'San Francisco',
    lat: 37.7749,
    lng: -122.4194,
    units: [
      { id: 'unit-1', bedBath: '1 bed / 1 bath', rent: 2800, leaseTermMonths: 12, availableDate: new Date().toISOString() }
    ],
    amenities: ['parking', 'laundry', 'dishwasher', 'balcony'],
    officialWebsiteUrl: 'https://example.com/listing/apt-1'
  },
  {
    id: 'apt-2',
    name: 'Quiet Parkside 2BR',
    address: '456 Oak Ave',
    city: 'San Francisco',
    lat: 37.7694,
    lng: -122.4862,
    units: [
      { id: 'unit-2', bedBath: '2 bed / 1.5 bath', rent: 2400, leaseTermMonths: 12, availableDate: new Date().toISOString() }
    ],
    amenities: ['parking', 'laundry', 'balcony', 'gym'],
    officialWebsiteUrl: 'https://example.com/listing/apt-2'
  }
]

export async function getBaseListings(prefs: UserPreferences): Promise<Apartment[]> {
  // TODO: Replace with real listing feed (Zillow/Apartment List/DB)
  const city = prefs.city?.toLowerCase()
  const min = prefs.budgetMin || 0
  const max = prefs.budgetMax || Number.MAX_SAFE_INTEGER
  return mockListings.filter((apt) => {
    const cityMatch = city ? apt.city.toLowerCase().includes(city) : true
    const rent = apt.units[0]?.rent ?? 0
    const budgetMatch = rent >= min && rent <= max
    return cityMatch && budgetMatch
  })
}
