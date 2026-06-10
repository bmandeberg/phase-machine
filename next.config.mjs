/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable the dev-tools "Segment Explorer" — in Next 15.5.x it tries to pull a
  // Node-only module (next-devtools/.../segment-explorer-node.js) into the React
  // *client* manifest during HMR, which throws "Could not find the module ... in the
  // React Client Manifest" + a 500 and forces a full page reload. Dev-only bug;
  // turning the tool off stops the recurring reload/stale-chunk churn.
  experimental: {
    devtoolSegmentExplorer: false,
  },
  // Disable next-image-loader so raster imports (png/jpg/gif) are NOT turned into
  // StaticImageData objects. Without this, `import x from './y.png'` resolves to
  // `{src, height, width}` and `<img src={x}/>` renders a broken image. SVGs are
  // unaffected (Next never runs next-image-loader on them) — only PNG/JPG/GIF
  // were broken. The loader is registered as a top-level webpack rule (not inside
  // a `oneOf`), so it can't be reliably excluded from the webpack() hook; this is
  // the supported switch that removes it. Our asset/resource rule below then makes
  // all image/font imports resolve to a plain URL string, matching the original
  // webpack setup so the ~85 `<img src={imported} />` usages work unchanged.
  images: {
    disableStaticImages: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg|woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
      generator: { filename: 'static/media/[hash][ext]' },
    })
    return config
  },
}

export default nextConfig
