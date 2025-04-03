/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // For static exports
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Required for static exports
  },
  // Next.js 15 optimized configuration
  experimental: {
    webpackBundleAnalyzer: false, // Disable bundle analyzer by default
    optimizePackageImports: [ // Optimize these imports
      '@monaco-editor/react',
      'lucide-react',
    ],
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
  // Font optimization (new in Next.js 15)
  optimizeFonts: true,
  // Enable React compiler if using
  reactStrictMode: true,
}

module.exports = nextConfig