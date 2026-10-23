/** @type {import('next').NextConfig} */
const nextConfig = {
  // The master prompt and style reference images are read from disk at
  // request time, so make sure Vercel bundles them with the API function.
  outputFileTracingIncludes: {
    "/api/generate": ["./prompts/**/*", "./style-references/**/*"],
  },
};

export default nextConfig;
