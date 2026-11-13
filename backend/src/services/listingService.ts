import { Apartment } from '../types'

const DAY_MS = 24 * 3600 * 1000

// TODO: Replace with a real listing feed (Phase 2)
const mockListings: Apartment[] = [
  {
    id: '1',
    title: 'Modern Downtown Loft',
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    price: 2800,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 850,
    propertyType: 'Loft',
    amenities: ['Parking', 'Gym', 'Laundry', 'Dishwasher', 'Air Conditioning'],
    petPolicy: 'Allowed',
    availableDate: new Date(Date.now() + 30 * DAY_MS).toISOString(),
    leaseTermMonths: 12,
    utilitiesEstimate: 180,
    neighborhood: 'SoMa',
    neighborhoodNote: 'Walkable to transit and coffee shops; lively nightlife, some street noise on weekends.',
    commuteOptions: [
      { mode: 'Transit', timeMinutes: 18, note: 'T Line to downtown offices' },
      { mode: 'Bike', timeMinutes: 12 },
      { mode: 'Drive', timeMinutes: 10 }
    ],
    externalURL: 'https://example.com/loft',
    riskFlags: [{ type: 'Noise', note: 'Faces a busy street; best with double-pane windows' }],
    description: 'Beautiful modern loft in the heart of downtown with stunning city views.',
    imageURLs: ['https://example.com/image1.jpg'],
    videoURLs: ['https://www.youtube.com/watch?v=sample1'],
    latitude: 37.7749,
    longitude: -122.4194,
    rating: 4.5,
    reviewCount: 23
  },
  {
    id: '2',
    title: 'Cozy Studio Near Park',
    address: '456 Oak Ave',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94118',
    price: 1900,
    bedrooms: 0,
    bathrooms: 1,
    squareFeet: 550,
    propertyType: 'Studio',
    amenities: ['Laundry', 'Dishwasher', 'Air Conditioning', 'Heating'],
    petPolicy: 'Cats Only',
    availableDate: new Date(Date.now() + 14 * DAY_MS).toISOString(),
    leaseTermMonths: 6,
    utilitiesEstimate: 120,
    neighborhood: 'Inner Richmond',
    neighborhoodNote: 'Quiet, next to the park with lots of local eateries. Great for runners.',
    commuteOptions: [
      { mode: 'Transit', timeMinutes: 25, note: '38R bus to downtown' },
      { mode: 'Bike', timeMinutes: 15 }
    ],
    riskFlags: [{ type: 'Construction', note: 'Light daytime construction on adjacent street through Q2' }],
    description: 'Charming studio apartment steps away from Golden Gate Park.',
    imageURLs: ['https://example.com/image2.jpg'],
    videoURLs: ['https://www.youtube.com/watch?v=sample2'],
    latitude: 37.7694,
    longitude: -122.4862,
    rating: 4.2,
    reviewCount: 15
  },
  {
    id: '3',
    title: 'Sunny Oakland 2BR with Parking',
    address: '789 Grove St',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94612',
    price: 2400,
    bedrooms: 2,
    bathrooms: 1.5,
    squareFeet: 950,
    propertyType: 'Apartment',
    amenities: ['Parking', 'Gym', 'Laundry', 'Balcony', 'Heating'],
    petPolicy: 'Allowed',
    availableDate: new Date(Date.now() + 45 * DAY_MS).toISOString(),
    leaseTermMonths: 12,
    utilitiesEstimate: 140,
    neighborhood: 'Uptown',
    neighborhoodNote: 'Near BART and Fox Theater; lively arts district with weekend events.',
    commuteOptions: [
      { mode: 'Transit', timeMinutes: 22, note: '19th St BART to Embarcadero' },
      { mode: 'Drive', timeMinutes: 16 }
    ],
    externalURL: 'https://example.com/oakland-2br',
    description: 'Light-filled 2BR with dedicated parking and balcony overlooking the courtyard.',
    imageURLs: ['https://example.com/image3.jpg'],
    videoURLs: ['https://www.youtube.com/watch?v=sample3'],
    latitude: 37.8099,
    longitude: -122.2687,
    rating: 4.3,
    reviewCount: 18
  },
  {
    id: '4',
    title: 'San Jose Townhouse with EV Charger',
    address: '321 Orchard Ln',
    city: 'San Jose',
    state: 'CA',
    zipCode: '95110',
    price: 3200,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1350,
    propertyType: 'Townhouse',
    amenities: ['Parking', 'Gym', 'Laundry', 'Air Conditioning', 'Heating', 'Storage'],
    petPolicy: 'Case by Case',
    availableDate: new Date(Date.now() + 20 * DAY_MS).toISOString(),
    leaseTermMonths: 12,
    utilitiesEstimate: 200,
    neighborhood: 'Rose Garden',
    neighborhoodNote: 'Family-friendly blocks with nearby parks; quieter evenings.',
    commuteOptions: [
      { mode: 'Drive', timeMinutes: 25, note: '280/87 interchange, typical rush-hour traffic' },
      { mode: 'Transit', timeMinutes: 38, note: 'Caltrain + short rideshare' }
    ],
    riskFlags: [{ type: 'Flood', note: 'In a moderate flood zone; check insurance options' }],
    description: 'Townhouse with EV charger and attached garage, close to tech campuses.',
    imageURLs: ['https://example.com/image4.jpg'],
    videoURLs: ['https://www.youtube.com/watch?v=sample4'],
    latitude: 37.3352,
    longitude: -121.8906,
    rating: 4.6,
    reviewCount: 31
  }
]

/** Returns every candidate listing; filtering and ranking happen in scoringService. */
export async function getBaseListings(): Promise<Apartment[]> {
  return mockListings
}

export async function findListingById(id: string): Promise<Apartment | undefined> {
  return mockListings.find((apt) => apt.id === id)
}
