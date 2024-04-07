/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DROPBOX_APP_KEY: process.env.DROPBOX_APP_KEY,
    DROPBOX_APP_SECRET: process.env.DROPBOX_APP_SECRET,
    DROPBOX_REFRESH_TOKEN: process.env.DROPBOX_REFRESH_TOKEN
  }
};

export default nextConfig;
