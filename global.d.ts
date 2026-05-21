// Ambient module declarations for non-code imports.
// Phase 1: plain (global) Sass side-effect imports. SCSS Modules (*.module.scss)
// will get their own typed declarations when we migrate styles in Phase 3.
declare module '*.scss'
declare module '*.css'

// Asset imports resolve to URL strings via the webpack rule in next.config.mjs.
declare module '*.svg' {
  const src: string
  export default src
}
declare module '*.png' {
  const src: string
  export default src
}
declare module '*.jpg' {
  const src: string
  export default src
}
declare module '*.gif' {
  const src: string
  export default src
}
