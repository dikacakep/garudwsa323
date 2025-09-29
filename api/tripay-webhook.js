// api/webhook.js
export default async function handler(req, res) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Handle GET request for testing
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'success',
      message: 'Webhook endpoint is working',
      timestamp: timestamp,
      endpoints: {
        webhook: '/api/tripay-webhook',
        debug: '/api/debug'
      }
    });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed_methods: ['GET', 'POST', 'OPTIONS']
    });
  }

  console.log('📥 Webhook received');
  console.log('Body:', JSON.stringify(req.body, null, 2));

  // Configuration
  const TARGET = process.env.VPS_URL || 'https://128.199.212.210:443/tripay-webhook';
  const SECRET = process.env.FORWARD_SECRET;
  const TIMEOUT = 25000; // 25 seconds (Vercel has 30s limit)

  const headers = {
    'content-type': 'application/json',
    'user-agent': req.headers['user-agent'] || 'vercel-forward/1.0',
    'x-forwarded-for': req.headers['x-forwarded-for'] || 
                       req.headers['x-real-ip'] || 
                       'vercel-function',
  };

  if (SECRET) {
    headers['x-forward-secret'] = SECRET;
  }

  try {
    console.log('🔄 Forwarding to:', TARGET);
    
    // Add timeout to prevent Vercel timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    
    const resp = await fetch(TARGET, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const text = await resp.text();
    
    console.log(`✅ VPS Response: ${resp.status}`);
    console.log(`Body: ${text}`);
    
    return res.status(resp.status).send(text);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    
    if (err.name === 'AbortError') {
      return res.status(408).json({
        error: 'Request timeout',
        message: 'VPS took too long to respond',
        target: TARGET,
        timeout: `${TIMEOUT}ms`
      });
    }
    
    return res.status(502).json({ 
      error: 'Bad gateway',
      message: err.message,
      target: TARGET,
      code: err.code
    });
  }
}
