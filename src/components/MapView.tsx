import React, { useEffect, useRef } from 'react'

export type MapMarker = {
  id: string
  lat: number
  lng: number
  title?: string
  subtitle?: string
}

export interface MapViewProps {
  center: { lat: number; lng: number }
  markers: MapMarker[]
  zoom?: number
  poiMarkers?: MapMarker[]
}

// Minimal Mapbox GL embed (can swap provider later)
// TODO: move Mapbox token to env (VITE_MAPBOX_TOKEN), or wrap Google Maps JS SDK.

declare global {
  interface Window {
    mapboxgl: any
  }
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export default function MapView({ center, markers, zoom = 13, poiMarkers = [] }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstance = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || !MAPBOX_TOKEN) return
    if (!window.mapboxgl) {
      // Dynamically load Mapbox GL JS
      const script = document.createElement('script')
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'
      script.onload = () => initMap()
      document.head.appendChild(script)
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css'
      document.head.appendChild(link)
    } else {
      initMap()
    }

    function initMap() {
      if (mapInstance.current) return
      const mapboxgl = window.mapboxgl
      mapboxgl.accessToken = MAPBOX_TOKEN
      mapInstance.current = new mapboxgl.Map({
        container: mapRef.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [center.lng, center.lat],
        zoom
      })
      mapInstance.current.addControl(new mapboxgl.NavigationControl())
      addMarkers(markers, '#2563eb')
      addMarkers(poiMarkers, '#10b981')
    }

    function addMarkers(list: MapMarker[], color: string) {
      if (!mapInstance.current) return
      const mapboxgl = window.mapboxgl
      list.forEach((m) => {
        const el = document.createElement('div')
        el.className = 'map-marker'
        el.style.backgroundColor = color
        el.style.width = '14px'
        el.style.height = '14px'
        el.style.borderRadius = '50%'
        el.style.border = '2px solid white'
        new mapboxgl.Marker(el).setLngLat([m.lng, m.lat]).setPopup(new mapboxgl.Popup().setText(m.title || '')).addTo(mapInstance.current)
      })
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [center.lat, center.lng, markers, poiMarkers, zoom])

  return <div ref={mapRef} style={{ width: '100%', height: 280, borderRadius: 12, overflow: 'hidden' }} />
}
