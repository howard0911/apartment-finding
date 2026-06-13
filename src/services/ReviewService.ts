import { Apartment } from '../models/Apartment'
import { UserPreferences } from '../models/UserPreferences'

export type Review = {
  id: string
  source: 'Google' | 'Yelp' | 'Zillow' | 'ApartmentRatings'
  rating: number
  author: string
  text: string
  tags: string[]
}

export type ReviewSummary = {
  pros: string[]
  cons: string[]
  personalizedNote: string
}

export async function fetchReviews(apartment: Apartment): Promise<Review[]> {
  await new Promise((r) => setTimeout(r, 500))
  return generateSampleReviews(apartment)
}

export async function summarizeReviewsWithGroq(reviews: Review[], preferences: UserPreferences): Promise<ReviewSummary> {
  await new Promise((r) => setTimeout(r, 400))
  const pros = new Set<string>()
  const cons = new Set<string>()
  reviews.forEach((r) => {
    r.tags.forEach((tag) => {
      if (tag.startsWith('pro:')) pros.add(tag.replace('pro:', ''))
      if (tag.startsWith('con:')) cons.add(tag.replace('con:', ''))
    })
  })
  const topNeed = preferences.mustHaveFeatures[0] ?? preferences.requiredAmenities[0] ?? 'your key requirements'
  const personalizedNote = `Emphasized ${topNeed}; matched ${preferences.additionalPoints.slice(0, 2).join(', ') || 'your priorities'} from Groq run (mocked).`
  return { pros: Array.from(pros), cons: Array.from(cons), personalizedNote }
}

function generateSampleReviews(apartment: Apartment): Review[] {
  const base: Review[] = [
    {
      id: `${apartment.id}-g1`,
      source: 'Google',
      rating: 4.4,
      author: 'Verified resident',
      text: 'Great staff responsiveness and well-kept common areas.',
      tags: ['pro:responsive staff', 'pro:cleanliness']
    },
    {
      id: `${apartment.id}-y1`,
      source: 'Yelp',
      rating: 3.8,
      author: 'Local guide',
      text: 'Neighborhood has lively food options; parking can be tight.',
      tags: ['pro:food nearby', 'con:parking']
    }
  ]

  if (apartment.riskFlags?.length) {
    base.push({
      id: `${apartment.id}-g2`,
      source: 'Google',
      rating: 3.5,
      author: 'Resident',
      text: apartment.riskFlags[0].note,
      tags: [`con:${apartment.riskFlags[0].note}`]
    })
  }

  return base
}
