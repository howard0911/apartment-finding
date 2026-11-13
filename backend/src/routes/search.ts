import { Router } from 'express'
import { SearchRequest, SearchResponse } from '../types'
import { getBaseListings } from '../services/listingService'
import { enrichWithCommute } from '../services/commuteService'
import { rankApartments } from '../services/scoringService'

const router = Router()

router.post('/search', async (req, res) => {
  const body = req.body as Partial<SearchRequest> | undefined
  if (typeof body?.query !== 'string' || typeof body.preferences !== 'object' || body.preferences === null) {
    res.status(400).json({ error: 'Request body must be { query: string, preferences: UserPreferences }' })
    return
  }
  const { query, preferences } = body
  try {
    const base = await getBaseListings()
    const withCommute = await enrichWithCommute(base, preferences)
    const response: SearchResponse = { results: rankApartments(withCommute, preferences, query) }
    res.json(response)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('search error', { query, error: err instanceof Error ? err.message : String(err) })
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router
