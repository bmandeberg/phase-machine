// Ambient module declarations for non-code imports.
// Phase 1: plain (global) Sass side-effect imports. SCSS Modules (*.module.scss)
// will get their own typed declarations when we migrate styles in Phase 3.
declare module '*.scss'
declare module '*.css'

// regenerator-runtime ships without type declarations; imported only for its
// runtime side-effect.
declare module 'regenerator-runtime'

// Asset imports resolve to URL strings via the webpack rule in next.config.mjs.
declare module '*.svg' {
  const src: string
  export default src
}
// NOTE: Next injects `*.png`/`*.jpg`/`*.gif` declarations (as StaticImageData)
// via `next/image-types/global` in next-env.d.ts. Our webpack config
// (next.config.mjs) overrides those loaders so these imports resolve to a URL
// string at runtime. We therefore re-point the import types to `string` here so
// the existing `<img src={imported} />` usage type-checks. These must be wider
// (use `& string`-friendly aliasing) to win over Next's ambient declarations.
declare module '*.png' {
  const src: string
  export default src
}
declare module '*.jpg' {
  const src: string
  export default src
}
declare module '*.jpeg' {
  const src: string
  export default src
}
declare module '*.gif' {
  const src: string
  export default src
}
declare module '*.webp' {
  const src: string
  export default src
}
declare module '*.ico' {
  const src: string
  export default src
}
declare module '*.bmp' {
  const src: string
  export default src
}
declare module '*.avif' {
  const src: string
  export default src
}
