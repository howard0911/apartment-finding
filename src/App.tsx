import React, { useEffect, useMemo, useState } from 'react'
import { searchApartments } from './services/api'
import { Apartment } from './models/Apartment'
import ApartmentRow from './components/ApartmentRow'
import ApartmentDetail from './components/ApartmentDetail'
import { UserPreferences, samplePreferences } from './models/UserPreferences'
import QuestionCard from './components/QuestionCard'
import SwipeDeck from './components/SwipeDeck'

export default function App() {
  const [query, setQuery] = useState('')
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [draft, setDraft] = useState<UserPreferences>(samplePreferences)
  const [surveyStep, setSurveyStep] = useState(0)
  const [results, setResults] = useState<Apartment[]>([])
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Apartment | null>(null)
  const [liked, setLiked] = useState<Apartment[]>([])
  const [skipped, setSkipped] = useState<Apartment[]>([])
  const [deckIndex, setDeckIndex] = useState(0)
  const [stage, setStage] = useState<'intro' | 'survey' | 'results'>('intro')
  const [theme, setTheme] = useState<'dark' | 'light'>('light')
  const [customMustHave, setCustomMustHave] = useState('')
  const [customAvoid, setCustomAvoid] = useState('')
  const [locationInput, setLocationInput] = useState('')
  const [commuteAddress, setCommuteAddress] = useState('')

  const steps = useMemo(
    () =>
      buildSteps(draft, setDraft, {
        customMustHave,
        setCustomMustHave,
        customAvoid,
        setCustomAvoid,
        locationInput,
        setLocationInput,
        commuteAddress,
        setCommuteAddress
      }),
    [draft, customAvoid, customMustHave, locationInput, commuteAddress]
  )

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  async function runSearch(prefs: UserPreferences, text: string) {
    setLoading(true)
    setSearchError(null)
    try {
      const res = await searchApartments({ query: text, preferences: prefs })
      setResults(res)
      setDeckIndex(0)
    } catch (err) {
      console.error('search failed', err)
      setSearchError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleNext() {
    if (surveyStep < steps.length - 1) {
      setSurveyStep((s) => s + 1)
      return
    }
    setPreferences(draft)
    setStage('results')
    await runSearch(draft, query)
  }

  function handlePrev() {
    if (surveyStep > 0) {
      setSurveyStep((s) => s - 1)
    } else {
      setStage('intro')
    }
  }

  function handleLike(ap: Apartment) {
    setLiked((prev) => [...prev, ap])
    setDeckIndex((i) => Math.min(results.length - 1, i + 1))
  }
  function handleSkip(ap: Apartment) {
    setSkipped((prev) => [...prev, ap])
    setDeckIndex((i) => Math.min(results.length - 1, i + 1))
  }

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-top">
          <button className="brand" onClick={() => { setStage('intro'); setSurveyStep(0) }}>Find Your Next Home</button>
          <div className="theme-toggle">
            <button className={`theme-option ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')} aria-label="Light mode">☀️</button>
            <button className={`theme-option ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')} aria-label="Dark mode">🌙</button>
          </div>
        </div>
        {stage === 'intro' && (
          <div className="hero-center">
            <h1>Find Your Next Home</h1>
            <p className="muted small">Answer quick cards and get your top picks ranked by commute, lifestyle, and risks — no endless filters.</p>
            <button className="button start-btn" onClick={() => { setStage('survey'); setSurveyStep(0) }}>Start</button>
          </div>
        )}
      </div>

      {stage === 'survey' && (
        <div className="survey-fullscreen">
          <div className="step-nav">
            <button className="link-btn" onClick={() => { setStage('intro'); setSurveyStep(0) }}>← Start over</button>
            <div className="step-dots large">
              {steps.map((_, i) => (
                <span key={i} className={`dot ${i === surveyStep ? 'dot-active' : ''}`} />
              ))}
            </div>
          </div>
          <QuestionCard
            {...steps[surveyStep]}
            onNext={handleNext}
            onPrev={handlePrev}
            nextLabel={surveyStep === steps.length - 1 ? 'See results' : 'Next'}
            showPrev
          />
        </div>
      )}

      {stage === 'results' && (
        <div className="layout-grid">
          <div className="card results-card">
            <div className="card-header">
              <div>
                <div className="eyebrow">Swipe results</div>
                <h2 style={{ margin: 0 }}>Like / Skip</h2>
              </div>
              <div className="search-bar">
                <input className="search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Refine (balcony, quiet, near transit)" />
                <button className="button" onClick={() => preferences && runSearch(preferences, query)} disabled={loading || !preferences}>
                  {loading ? 'Searching...' : 'Refine'}
                </button>
              </div>
            </div>
            {!loading && <div className="badge">{results.length} {results.length === 1 ? 'match' : 'matches'}</div>}
            {preferences && (
              <>
                <SwipeDeck results={results} index={deckIndex} onLike={handleLike} onSkip={handleSkip} onView={(ap) => setSelected(ap)} />
                <div className="liked-grid">
                  {liked.map((a) => (
                    <div key={`like-${a.id}`} className="liked">
                      <span>👍</span>
                      <span>{a.title}</span>
                    </div>
                  ))}
                </div>
                {searchError && <div className="muted" role="alert">Search failed: {searchError}</div>}
                {!loading && !searchError && results.length === 0 && <div className="muted">No matches yet. Adjust filters.</div>}
                {loading && <div className="muted">Scanning listings...</div>}
              </>
            )}
          </div>
        </div>
      )}

      {selected && <ApartmentDetail apartment={selected} priorities={preferences?.additionalPoints ?? []} onClose={() => setSelected(null)} />}
    </div>
  )
}

type StepExtras = {
  customMustHave: string
  setCustomMustHave: (v: string) => void
  customAvoid: string
  setCustomAvoid: (v: string) => void
  locationInput: string
  setLocationInput: (v: string) => void
  commuteAddress: string
  setCommuteAddress: (v: string) => void
}

function buildSteps(draft: UserPreferences, setDraft: (p: UserPreferences) => void, extras: StepExtras) {
  return [
    {
      title: 'Pick property type',
      children: (
        <div className="pill-row">
          {['Apartment', 'Condo', 'Townhouse', 'Studio', 'Loft'].map((type) => (
            <button
              key={type}
              className={`pill selectable ${draft.preferredPropertyTypes.includes(type) ? 'pill-active' : ''}`}
              onClick={() =>
                setDraft({
                  ...draft,
                  preferredPropertyTypes: [type]
                })
              }
            >
              {type}
            </button>
          ))}
        </div>
      )
    },
    {
      title: 'Where to live',
      subtitle: 'Detect or pick a city.',
      children: (
        <div className="stack">
          <div className="inline-inputs">
            <button
              className="pill detect"
              onClick={() => {
                if (!navigator.geolocation) return
                navigator.geolocation.getCurrentPosition(async (pos) => {
                  const { latitude, longitude } = pos.coords
                  setDraft({ ...draft, preferredCities: ['Current Location'], preferredNeighborhoods: ['Current Location'], currentLocationLatLng: { lat: latitude, lng: longitude } })
                  extras.setLocationInput('Current Location')
                })
              }}
            >
              📍 Detect my location
            </button>
            <input
              value={extras.locationInput}
              onChange={(e) => {
                const val = e.target.value
                setDraft({ ...draft, preferredCities: val ? [val] : [] })
                extras.setLocationInput(val)
              }}
              placeholder="City, State/Province, Country"
            />
          </div>
          <div className="pill-row">
            {['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Indianapolis', 'Seattle', 'Denver', 'Washington, D.C.'].map((city) => (
              <button
                key={city}
                className={`pill selectable ${draft.preferredCities.includes(city) ? 'pill-active' : ''}`}
                onClick={() =>
                  setDraft({
                    ...draft,
                    preferredCities: [city]
                  })
                }
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Budget',
      subtitle: 'Monthly rent target (utilities estimated).',
      children: (
        <div className="inline-inputs">
          <input
            type="number"
            value={draft.minPrice ?? ''}
            placeholder="Min"
            onChange={(e) => {
              const val = Number(e.target.value)
              if (draft.maxPrice !== undefined && val > draft.maxPrice) return
              setDraft({ ...draft, minPrice: val })
            }}
          />
          <input
            type="number"
            value={draft.maxPrice ?? ''}
            placeholder="Max"
            onChange={(e) => {
              const val = Number(e.target.value)
              if (draft.minPrice !== undefined && val < draft.minPrice) return
              setDraft({ ...draft, maxPrice: val })
            }}
          />
        </div>
      )
    },
    {
      title: 'Move-in date',
      subtitle: 'Pick your target date.',
      children: (
        <div className="stack">
          <input
            type="date"
            value={draft.preferredMoveInDate ? draft.preferredMoveInDate.split('T')[0] : ''}
            placeholder="MM/DD/YYYY"
            onChange={(e) => setDraft({ ...draft, preferredMoveInDate: e.target.value })}
          />
        </div>
      )
    },
    {
      title: 'Commute',
      subtitle: 'Optional. Add a destination to filter by time.',
      children: (
        <div className="stack">
          <input
            value={extras.commuteAddress}
            onChange={(e) => {
              extras.setCommuteAddress(e.target.value)
              setDraft({ ...draft, commuteDestination: e.target.value })
            }}
            placeholder="Work/School address"
          />
          <div className="pill-row">
            {(['Transit', 'Drive', 'Bike', 'Walk'] as const).map((mode) => (
              <button
                key={mode}
                className={`pill selectable ${draft.commuteMode === mode ? 'pill-active' : ''}`}
                onClick={() => setDraft({ ...draft, commuteMode: mode })}
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="pill-row">
            {[15, 20, 30, 45].map((minutes) => (
              <button
                key={minutes}
                className={`pill selectable ${draft.maxCommuteTime === minutes ? 'pill-active' : ''}`}
                onClick={() => setDraft({ ...draft, maxCommuteTime: minutes })}
              >
                ≤ {minutes} min
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Must haves',
      subtitle: 'Tap essentials or add your own.',
      children: (
        <div className="stack">
          <div className="pill-row">
            {['Parking', 'Laundry', 'Balcony', 'Natural light', 'Gym', 'Quiet', 'Pool', 'Dishwasher', 'Hardwood floors', 'Air conditioning', 'High-speed internet', 'Elevator'].map((item) => (
              <button
                key={item}
                className={`pill selectable ${draft.mustHaveFeatures.includes(item) ? 'pill-active' : ''}`}
                onClick={() =>
                  setDraft({
                    ...draft,
                    mustHaveFeatures: toggle(draft.mustHaveFeatures, item),
                    requiredAmenities: toggle(draft.requiredAmenities, item)
                  })
                }
              >
                {item}
              </button>
            ))}
          </div>
          <div className="inline-inputs">
            <input
              placeholder="Add your own must-have"
              value={extras.customMustHave}
              onChange={(e) => extras.setCustomMustHave(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && extras.customMustHave.trim()) {
                  setDraft({
                    ...draft,
                    mustHaveFeatures: toggle(draft.mustHaveFeatures, extras.customMustHave.trim()),
                    requiredAmenities: toggle(draft.requiredAmenities, extras.customMustHave.trim())
                  })
                  extras.setCustomMustHave('')
                }
              }}
            />
            <button
              className="secondary"
              onClick={() => {
                if (!extras.customMustHave.trim()) return
                setDraft({
                  ...draft,
                  mustHaveFeatures: toggle(draft.mustHaveFeatures, extras.customMustHave.trim()),
                  requiredAmenities: toggle(draft.requiredAmenities, extras.customMustHave.trim())
                })
                extras.setCustomMustHave('')
              }}
            >
              Add
            </button>
          </div>
        </div>
      )
    },
    {
      title: 'Hard Nos',
      subtitle: 'Deal-breakers to skip.',
      children: (
        <div className="stack">
          <div className="pill-row">
            {['Street noise', 'No parking', 'Old appliances', 'No AC', 'Carpet', 'Smoking', 'No balcony'].map((item) => (
              <button
                key={item}
                className={`pill selectable ${draft.dealBreakers.includes(item) ? 'pill-active' : ''}`}
                onClick={() => setDraft({ ...draft, dealBreakers: toggle(draft.dealBreakers, item) })}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="inline-inputs">
            <input
              placeholder="Add your own avoid"
              value={extras.customAvoid}
              onChange={(e) => extras.setCustomAvoid(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && extras.customAvoid.trim()) {
                  setDraft({ ...draft, dealBreakers: toggle(draft.dealBreakers, extras.customAvoid.trim()) })
                  extras.setCustomAvoid('')
                }
              }}
            />
            <button
              className="secondary"
              onClick={() => {
                if (!extras.customAvoid.trim()) return
                setDraft({ ...draft, dealBreakers: toggle(draft.dealBreakers, extras.customAvoid.trim()) })
                extras.setCustomAvoid('')
              }}
            >
              Add
            </button>
          </div>
        </div>
      )
    },
    {
      title: 'Bonus points',
      subtitle: 'Earlier items get more weight.',
      children: (
        <div className="stack">
          <div className="chips">
            {draft.additionalPoints.map((p, idx) => (
              <div className="chip" key={p + idx}>
                <span>{idx + 1}. {p}</span>
                <div className="chip-actions">
                  <button className="link-btn reorder-btn" aria-label={`Move ${p} up`} onClick={() => swapAdditional(draft, setDraft, idx, -1)}>↑</button>
                  <button className="link-btn reorder-btn" aria-label={`Move ${p} down`} onClick={() => swapAdditional(draft, setDraft, idx, 1)}>↓</button>
                </div>
              </div>
            ))}
          </div>
          <div className="pill-row">
            {['Near groceries', 'Sunlight', 'Walkable', 'Newer building', 'Pets ok'].map((item) => (
              <button
                key={item}
                className={`pill selectable ${draft.additionalPoints.includes(item) ? 'pill-active' : ''}`}
                onClick={() =>
                  setDraft({
                    ...draft,
                    additionalPoints: draft.additionalPoints.includes(item)
                      ? draft.additionalPoints.filter((p) => p !== item)
                      : [...draft.additionalPoints, item]
                  })
                }
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )
    }
  ]
}

function swapAdditional(draft: UserPreferences, setDraft: (p: UserPreferences) => void, idx: number, direction: -1 | 1) {
  const next = [...draft.additionalPoints]
  const target = idx + direction
  if (target < 0 || target >= next.length) return
  ;[next[idx], next[target]] = [next[target], next[idx]]
  setDraft({ ...draft, additionalPoints: next })
}

function toggle(list: string[], item: string) {
  return list.includes(item) ? list.filter((v) => v !== item) : [...list, item]
}
