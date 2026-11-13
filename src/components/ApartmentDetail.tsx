import React, { useEffect, useState } from 'react'
import { Apartment } from '../models/Apartment'
import { UserPreferences } from '../models/UserPreferences'
import { searchPropertyVideos, PropertyVideo, getEmbedURL } from '../services/VideoService'
import { fetchReviews, summarizeReviewsWithGroq, ReviewSummary } from '../services/ReviewService'
import MapView from './MapView'

export default function ApartmentDetail({ apartment, onClose, preferences }: { apartment: Apartment; onClose: () => void; preferences: UserPreferences | null }) {
  const [videos, setVideos] = useState<PropertyVideo[]>([])
  const [videoLoading, setVideoLoading] = useState(false)
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null)
  const [reviewLoading, setReviewLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setVideoLoading(true)
    setReviewLoading(true)
    searchPropertyVideos(`${apartment.title} ${apartment.city}`).then((v) => {
      if (mounted) setVideos(v)
      setVideoLoading(false)
    })
    fetchReviews(apartment)
      .then((reviews) => {
        if (!preferences) return { pros: [], cons: [], personalizedNote: 'Set preferences to personalize review summary.' }
        return summarizeReviewsWithGroq(reviews, preferences)
      })
      .then((summary) => {
        if (mounted) setReviewSummary(summary)
      })
      .finally(() => {
        if (mounted) setReviewLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [apartment, preferences])

  return (
    <div className="modal">
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{apartment.title}</h2>
          <button className="secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="detail-grid">
          <section>
            <div className="muted">{apartment.address} • {apartment.city}, {apartment.state}</div>
            <div style={{ marginTop: 8 }}>Price: <strong>${apartment.price.toFixed(0)}</strong> {apartment.utilitiesEstimate && <span className="muted">+ est. ${apartment.utilitiesEstimate} utilities</span>}</div>
            <div style={{ marginTop: 4 }}>Lease: {apartment.leaseTermMonths ?? 12}-month • {apartment.bedrooms} bed / {apartment.bathrooms} bath</div>
            {apartment.availableDate && <div style={{ marginTop: 4 }}>Move-in: {new Date(apartment.availableDate).toLocaleDateString()}</div>}
            {apartment.neighborhoodNote && <div className="muted" style={{ marginTop: 8 }}>{apartment.neighborhood} — {apartment.neighborhoodNote}</div>}
            {apartment.riskFlags?.length ? (
              <div className="risk">
                {apartment.riskFlags.map((r) => (
                  <span key={r.note} className="risk-pill">{r.type}: {r.note}</span>
                ))}
              </div>
            ) : null}
            <div className="stack" style={{ marginTop: 8 }}>
              <strong>Amenities</strong>
              <div className="pill-row">
                {apartment.amenities.map((a) => <span className="pill muted" key={a}>{a}</span>)}
              </div>
            </div>
            {apartment.commuteOptions?.length ? (
              <div className="stack" style={{ marginTop: 8 }}>
                <strong>Commute preview</strong>
                <ul className="bullets">
                  {apartment.commuteOptions.map((c) => (
                    <li key={c.mode}>{c.mode}: {c.timeMinutes} min {c.note ? `• ${c.note}` : ''}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {apartment.externalURL && (
              <div style={{ marginTop: 8 }}>
                <a className="link-btn" href={apartment.externalURL} target="_blank" rel="noreferrer">Open official listing ↗</a>
              </div>
            )}
            <div style={{ marginTop: 12 }}>{apartment.description}</div>
          </section>

          <section>
            <div className="map">
              <MapView
                center={{ lat: apartment.latitude || apartment.lat || 37.7749, lng: apartment.longitude || apartment.lng || -122.4194 }}
                markers={[{ id: apartment.id, lat: apartment.latitude || apartment.lat || 37.7749, lng: apartment.longitude || apartment.lng || -122.4194, title: apartment.title }]}
              />
              <div className="muted small">Neighborhood snapshot: {apartment.neighborhood ?? 'N/A'}</div>
            </div>
            <div style={{ marginTop: 12 }}>
              <h4>Videos</h4>
              {videoLoading && <div className="muted">Loading videos...</div>}
              {!videoLoading && videos.length === 0 && <div className="muted">No videos found</div>}
              {!videoLoading && videos.map((v) => (
                <div key={v.id} style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 600 }}>{v.title}</div>
                  <div className="muted">{v.duration}</div>
                  <div style={{ marginTop: 8 }}>
                    <iframe width="100%" height="180" src={getEmbedURL(v)} title={v.title} frameBorder={0} allowFullScreen />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <h4>What residents say</h4>
              {reviewLoading && <div className="muted">Summarizing...</div>}
              {!reviewLoading && reviewSummary && (
                <div>
                  <div className="muted small">Pros</div>
                  <ul className="bullets">
                    {reviewSummary.pros.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                  <div className="muted small">Cons</div>
                  <ul className="bullets">
                    {reviewSummary.cons.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                  <div className="muted small">Personalized</div>
                  <div>{reviewSummary.personalizedNote}</div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function getMapEmbedURL(apartment: Apartment) {
  if (apartment.latitude && apartment.longitude) {
    return `https://www.google.com/maps?q=${apartment.latitude},${apartment.longitude}&z=14&output=embed`
  }
  const q = encodeURIComponent(`${apartment.address} ${apartment.city} ${apartment.state}`)
  return `https://www.google.com/maps?q=${q}&output=embed`
}
