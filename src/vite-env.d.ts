/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Mapbox public (pk.*) token; safe to ship to the browser when URL-restricted. */
  readonly VITE_MAPBOX_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
