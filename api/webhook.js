// api/webhook.js
const https = require('https');

const TARGET = 'https://128.199.212.210:443/webhook';
const SECRET = process.env.FORWARD_SECRET || '';

export default async function handler(req, res) {
  if (req.method === 'GET' && req.url === '/') {
    return res.status(200).json({ message: 'Webhook Forwarder is running' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const headers = {
    'content-type': 'application/json',
    'user-agent': req.headers['user-agent'] || 'vercel-forward/1.0',
  };
  if (SECRET) headers['x-forward-secret'] = SECRET;

  const body = req.body;
  console.log('Received body:', JSON.stringify(body, null, 2));

  try {
    const resp = await fetch(TARGET, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      agent: new https.Agent({ rejectUnauthorized: false }), // Abaikan verifikasi SSL
    });
    const text = await resp.text();
    console.log(`VPS response: [${resp.status}] ${text}`);
    return res.status(resp.status).send(text);
  } catch (err) {
    console.error('Forward error:', err);
    return res.status(502).json({ error: 'Bad gateway' });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
