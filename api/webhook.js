// api/webhook.js
// Node 18+ : fetch & crypto sudah native

const TARGET = 'http://128.199.212.210:3000/webhook';   // ganti dengan IP:port VPS-mu
const SECRET = process.env.FORWARD_SECRET || '';     // taruh di Vercel → Settings → Env Variables

export default async function handler(req, res) {
  // 1. Cuma terima POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Salin header penting (biar VPS tetap bisa validasi)
  const headers = {
    'content-type': 'application/json',
    'user-agent': req.headers['user-agent'] || 'vercel-forward/1.0',
  };
  if (SECRET) headers['x-forward-secret'] = SECRET;

  // 3. Parse body (Vercel sudah otomatis json bila content-type json)
  const body = req.body;

  try {
    // 4. Teruskan ke VPS
    const resp = await fetch(TARGET, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    // 5. Balikkan status & body dari VPS ke Resend
    const text = await resp.text();
    return res.status(resp.status).send(text);
  } catch (err) {
    console.error('Forward error:', err);
    return res.status(502).json({ error: 'Bad gateway' });
  }
}

// Agar Vercel parse body otomatis
export const config = {
  api: {
    bodyParser: true, // default sudah true, cuma eksplisit saja
  },
};
