/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    // Phase 1 lift-and-shift: make image/font imports resolve to a URL string
    // (matching the original webpack `asset/resource` setup) instead of Next's
    // default StaticImageData object, so the existing `<img src={imported} />`
    // usage across ~85 imports works unchanged.
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg|woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
      generator: { filename: 'static/media/[hash][ext]' },
    })
    // Prevent Next's built-in next-image-loader from also processing these files.
    config.module.rules.forEach((rule) => {
      if (Array.isArray(rule.oneOf)) {
        rule.oneOf.forEach((one) => {
          if (typeof one.loader === 'string' && one.loader.includes('next-image-loader')) {
            one.exclude = /\.(png|jpe?g|gif|svg)$/i
          }
        })
      }
    })
    return config
  },
}

export default nextConfig
