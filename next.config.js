/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep the Node.js OCR worker and WASM runtime external to the Next.js bundle.
  serverExternalPackages: ["tesseract.js", "tesseract.js-core"],
};

module.exports = nextConfig;
