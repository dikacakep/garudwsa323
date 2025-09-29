// api/tripay-webhook.js
const TARGET = 'https://180.243.8.120:443/tripay-webhook';  // Path sama dengan nama file
const SECRET = process.env.FORWARD_SECRET || 'whateversecret';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Received webhook from Tripay:', JSON.stringify(req.body, null, 2));

  const headers = {
    'content-type': 'application/json',
    'user-agent': req.headers['user-agent'] || 'vercel-forward/1.0',
    'x-forwarded-for': req.headers['x-forwarded-for'] || req.ip,
  };

  if (SECRET) headers['x-forward-secret'] = SECRET;

  try {
    const resp = await fetch(TARGET, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    });

    const text = await resp.text();
    console.log(`VPS Response: ${resp.status} - ${text}`);
    
    return res.status(resp.status).send(text);
    
  } catch (err) {
    console.error('Forward error:', err);
    return res.status(502).json({ 
      error: 'Bad gateway',
      details: err.message 
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
