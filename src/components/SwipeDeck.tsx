import React from 'react'
import { Apartment } from '../models/Apartment'
import ApartmentRow from './ApartmentRow'

export default function SwipeDeck({
  results,
  index,
  onLike,
  onSkip,
  onView
}: {
  results: Apartment[]
  index: number
  onLike: (ap: Apartment) => void
  onSkip: (ap: Apartment) => void
  onView: (ap: Apartment) => void
}) {
  if (!results.length) return null
  const current = results[index] ?? results[results.length - 1]
  const progress = Math.min(1, (index + 1) / results.length)
  return (
    <div className="swipe">
      <div className="swipe-progress">
        <div className="swipe-progress-bar" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="swipe-card">
        <ApartmentRow apartment={current} onView={onView} />
      </div>
      <div className="swipe-actions">
        <button className="ghost danger" onClick={() => onSkip(current)}>👎 Skip</button>
        <button className="ghost" onClick={() => onView(current)}>👀 Details</button>
        <button className="ghost success" onClick={() => onLike(current)}>👍 Like</button>
      </div>
    </div>
  )
}
