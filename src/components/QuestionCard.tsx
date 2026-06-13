import React from 'react'

export default function QuestionCard({
  title,
  subtitle,
  children,
  onNext,
  nextLabel = 'Next',
  disabled,
  onPrev,
  showPrev
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  onNext: () => void
  nextLabel?: string
  disabled?: boolean
  onPrev?: () => void
  showPrev?: boolean
}) {
  return (
    <div className="card neon question-card">
      <div className="card-header">
        <div>
          <div className="eyebrow">Question</div>
          <h2 style={{ margin: 0 }}>{title}</h2>
          {subtitle && <p className="muted small" style={{ marginTop: 4 }}>{subtitle}</p>}
        </div>
        <div className="step-actions">
          {showPrev && (
            <button type="button" className="secondary" onClick={onPrev}>
              Back
            </button>
          )}
          <button type="button" className="button" onClick={onNext} disabled={disabled}>
            {nextLabel}
          </button>
        </div>
      </div>
      <div className="card-body">{children}</div>
    </div>
  )
}
