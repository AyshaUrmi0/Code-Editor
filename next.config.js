/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // For static exports
  distDir: 'build', // Changed from .next to build
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Required for static exports
  },
  // Disable server features since we're doing static export
  experimental: {
    optimizePackageImports: [ // Optimize these imports
      '@monaco-editor/react',
      'lucide-react',
    ],
    serverActions: false,
    serverComponents: false,
  },
  // Required for Pyodide (WebAssembly)
  webpack: (config, { isServer }) => {
    // Enable WebAssembly support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      topLevelAwait: true,
    }

    // Important: Pyodide must only run on client-side
    config.resolve.alias = config.resolve.alias || {}
    config.resolve.alias['@components'] = './components'

    // Disable server-side rendering for Pyodide
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
      }
    }

    return config
  },
  // Enable React compiler
  reactStrictMode: true,
  // Disable middleware and routing features
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  // Disable features we don't need for static export
  compress: false,
  poweredByHeader: false,
}

module.exports = nextConfig