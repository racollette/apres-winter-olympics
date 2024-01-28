/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /**
   * If you have `experimental: { appDir: true }` set, then you must comment the below `i18n` config
   * out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.nftstorage.link',
      },
      {
        protocol: 'https',
        hostname: '**.arweave.net',
      },
      {
        protocol: 'https',
        hostname: '**.prod-image-cdn.tensor.trade',
      },
      {
        protocol: 'https',
        hostname: '**.pbs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: '**.ton.twitter.com',
      },
      {
        protocol: 'https',
        hostname: '**.cdn.discordapp.com',
      },
      {
        protocol: 'https',
        hostname: '**.ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: '**.www.dinoherd.cc',
      },
      {
        protocol: 'https',
        hostname: '**.dinoherd.cc',
      },
      {
        protocol: 'https',
        hostname: '**.www.clayno.club',
      },
      {
        protocol: 'https',
        hostname: '**.clayno.club',
      },
    ],
    unoptimized: true
  },
  publicRuntimeConfig: {
    myRPC: process.env.RPC
  },
  transpilePackages: ['react-tweet']
};

export default config;
