import React, { useEffect, useState } from 'react'
import { Apartment, PropertyVideo, ReviewSummary } from '../models/Apartment'
import { fetchApartmentVideos, fetchReviewSummary } from '../services/api'
import MapView from './MapView'

type Loadable<T> = { status: 'loading' } | { status: 'done'; value: T } | { status: 'error'; message: string }

export default function ApartmentDetail({ apartment, priorities, onClose }: { apartment: Apartment; priorities: string[]; onClose: () => void }) {
  const [videos, setVideos] = useState<Loadable<PropertyVideo[]>>({ status: 'loading' })
  const [reviews, setReviews] = useState<Loadable<ReviewSummary | null>>({ status: 'loading' })
  const prioritiesKey = priorities.join('|')

  useEffect(() => {
    let active = true
    setVideos({ status: 'loading' })
    fetchApartmentVideos(apartment.id)
      .then((value) => active && setVideos({ status: 'done', value }))
      .catch((err: Error) => {
        console.error('video load failed', err)
        if (active) setVideos({ status: 'error', message: err.message })
      })
    return () => {
      active = false
    }
  }, [apartment.id])

  useEffect(() => {
    let active = true
    setReviews({ status: 'loading' })
    fetchReviewSummary(apartment.id, priorities)
      .then((value) => active && setReviews({ status: 'done', value }))
      .catch((err: Error) => {
        console.error('review summary load failed', err)
        if (active) setReviews({ status: 'error', message: err.message })
      })
    return () => {
      active = false
    }
    // prioritiesKey stands in for the priorities array, which is a new reference on every render
  }, [apartment.id, prioritiesKey])

  const reviewSummary = reviews.status === 'done' ? reviews.value : null

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
                center={{ lat: apartment.latitude ?? 37.7749, lng: apartment.longitude ?? -122.4194 }}
                markers={[{ id: apartment.id, lat: apartment.latitude ?? 37.7749, lng: apartment.longitude ?? -122.4194, title: apartment.title }]}
              />
              <div className="muted small">Neighborhood snapshot: {apartment.neighborhood ?? 'N/A'}</div>
            </div>
            <div style={{ marginTop: 12 }}>
              <h4>Videos</h4>
              {videos.status === 'loading' && <div className="muted">Loading videos...</div>}
              {videos.status === 'error' && <div className="muted" role="alert">Couldn't load videos: {videos.message}</div>}
              {videos.status === 'done' && videos.value.length === 0 && <div className="muted">No videos found</div>}
              {videos.status === 'done' && videos.value.map((v) => (
                <div key={v.url} style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 600 }}>{v.title}</div>
                  <div style={{ marginTop: 8 }}>
                    <iframe width="100%" height="180" src={getEmbedURL(v)} title={v.title} frameBorder={0} allowFullScreen />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <h4>What residents say</h4>
              {reviews.status === 'loading' && <div className="muted">Summarizing...</div>}
              {reviews.status === 'error' && <div className="muted" role="alert">Couldn't summarize reviews: {reviews.message}</div>}
              {reviews.status === 'done' && !reviewSummary && <div className="muted">No reviews yet</div>}
              {reviewSummary && (
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

function getEmbedURL(video: PropertyVideo): string {
  const id = video.url.match(/v=([a-zA-Z0-9_-]+)/)?.[1]
  return id ? `https://www.youtube.com/embed/${id}` : video.url
}
