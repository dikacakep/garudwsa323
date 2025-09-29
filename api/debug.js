// api/debug.js
export default async function handler(req, res) {
  const timestamp = new Date().toISOString();
  
  return res.status(200).json({
    status: 'success',
    message: 'Debug endpoint working',
    timestamp: timestamp,
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      FORWARD_SECRET: process.env.FORWARD_SECRET ? '[SET]' : '[NOT SET]'
    },
    deployment_info: {
      vercel_region: process.env.VERCEL_REGION,
      vercel_url: process.env.VERCEL_URL
    }
  });
}
