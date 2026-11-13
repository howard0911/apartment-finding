import { Router } from 'express'
import { ReviewSummaryRequest, ReviewSummaryResponse, VideosResponse } from '../types'
import { findListingById } from '../services/listingService'
import { findApartmentVideos } from '../services/videoService'
import { summarizeApartmentReviews } from '../services/reviewService'

/** Per-apartment detail data, fetched only when the user opens an apartment. */
const router = Router()

router.get('/apartments/:id/videos', async (req, res) => {
  const apartment = await findListingById(req.params.id)
  if (!apartment) {
    res.status(404).json({ error: `Apartment ${req.params.id} not found` })
    return
  }
  try {
    const response: VideosResponse = { videos: await findApartmentVideos(apartment) }
    res.json(response)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('video search error', { apartmentId: apartment.id, error: message })
    res.status(502).json({ error: 'Video search failed' })
  }
})

router.post('/apartments/:id/review-summary', async (req, res) => {
  const body = req.body as Partial<ReviewSummaryRequest> | undefined
  if (!Array.isArray(body?.priorities) || !body.priorities.every((p) => typeof p === 'string')) {
    res.status(400).json({ error: 'Request body must be { priorities: string[] }' })
    return
  }
  const apartment = await findListingById(req.params.id)
  if (!apartment) {
    res.status(404).json({ error: `Apartment ${req.params.id} not found` })
    return
  }
  try {
    const response: ReviewSummaryResponse = { summary: await summarizeApartmentReviews(apartment, body.priorities) }
    res.json(response)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('review summary error', { apartmentId: apartment.id, error: message })
    res.status(502).json({ error: 'Review summary failed' })
  }
})

export default router
