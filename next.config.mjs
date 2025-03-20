/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
          {
            source: '/(.*)',
            headers: [
              {
                key: 'X-Forwarded-Host',
                value: 'carmarket-leh4.onrender.com',
              },
            ],
          },
        ];
      },
};

export default nextConfig;
