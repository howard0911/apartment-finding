import { Router } from 'express'
import { UserPreferences } from '../types'
import { getBaseListings } from '../services/listingService'
import { enrichWithCommute } from '../services/commuteService'
import { enrichWithSafety } from '../services/safetyService'
import { enrichWithVideos } from '../services/videoService'
import { enrichWithReviews } from '../services/reviewService'
import { scoreApartments } from '../services/scoringService'

const router = Router()

router.post('/search', async (req, res) => {
  try {
    const prefs = req.body as UserPreferences
    const base = await getBaseListings(prefs)
    const withCommute = await enrichWithCommute(base, prefs)
    const withSafety = await enrichWithSafety(withCommute)
    const withVideos = await enrichWithVideos(withSafety)
    const withReviews = await enrichWithReviews(withVideos, prefs)
    const scored = scoreApartments(withReviews, prefs)
    res.json({ preferences: prefs, results: scored })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('search error', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router
