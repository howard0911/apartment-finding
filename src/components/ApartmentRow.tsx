import React from 'react'
import { Apartment } from '../models/Apartment'

export default function ApartmentRow({ apartment, onView }: { apartment: Apartment; onView: (a: Apartment) => void }) {
  return (
    <div className="row">
      <div>
        <div style={{ fontWeight: 600 }}>{apartment.title}</div>
        <div className="muted">{apartment.address} • {apartment.city}</div>
        <div className="meta">
          <span>${apartment.price.toFixed(0)}/mo</span>
          {apartment.utilitiesEstimate && <span>+ est. ${apartment.utilitiesEstimate} utilities</span>}
          {apartment.leaseTermMonths && <span>{apartment.leaseTermMonths}-mo lease</span>}
          {apartment.availableDate && <span>Move-in {new Date(apartment.availableDate).toLocaleDateString()}</span>}
        </div>
        {apartment.neighborhoodNote && <div className="muted small">{apartment.neighborhood} — {apartment.neighborhoodNote}</div>}
        {apartment.commuteTimeByMode && (
          <div className="muted small">
            {Object.entries(apartment.commuteTimeByMode)
              .map(([mode, mins]) => `${mins} min by ${mode}`)
              .join(' · ')}
          </div>
        )}
      </div>
      <div className="row-actions">
        {apartment.priorityScore !== undefined && <div className="badge">Score {apartment.priorityScore.toFixed(0)}</div>}
        <button className="button" onClick={() => onView(apartment)}>
          View
        </button>
      </div>
    </div>
  )
}
