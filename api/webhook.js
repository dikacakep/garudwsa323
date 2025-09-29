const TARGET = 'http://128.199.212.210:3000/webhook';
const SECRET = process.env.FORWARD_SECRET || 'whateversecret';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const headers = {
    'content-type': 'application/json',
    'user-agent': req.headers['user-agent'] || 'vercel-forward/1.0',
    'x-forward-secret': SECRET,
  };

  try {
    const resp = await fetch(TARGET, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    });

    const text = await resp.text();
    return res.status(resp.status).send(text);
  } catch (err) {
    console.error('Forward error:', err);
    return res.status(502).json({ error: 'Bad gateway' });
  }
}
