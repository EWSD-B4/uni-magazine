const path = require("path")
require("dotenv").config({ path: ".env.dev" })

/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uni-magazines.s3.ap-southeast-1.amazonaws.com",
      },
    ],
  },
  turbopack: {
    root: path.join(__dirname),
  },
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.modules = [
      path.join(__dirname, "node_modules"),
      ...(config.resolve.modules || []),
    ]
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "tailwindcss$": path.join(__dirname, "node_modules/tailwindcss/index.css"),
      "tw-animate-css$": path.join(
        __dirname,
        "node_modules/tw-animate-css/dist/tw-animate.css"
      ),
      "shadcn/tailwind.css$": path.join(
        __dirname,
        "node_modules/shadcn/dist/tailwind.css"
      ),
    }

    return config
  },
}

module.exports = nextConfig
