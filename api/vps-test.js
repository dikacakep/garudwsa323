// api/vps-test.js
export default async function handler(req, res) {
  const VPS_URL = process.env.VPS_URL || 'https://192.168.1.110:443';
  const targets = [
    `${VPS_URL}/tripay-webhook`,
    `${VPS_URL}/health`,
    `${VPS_URL}/`,
    'https://httpbin.org/status/200' // Test endpoint
  ];
  
  const results = [];
  
  for (const target of targets) {
    try {
      console.log(`Testing: ${target}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const start = Date.now();
      const response = await fetch(target, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'vercel-vps-test/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      const duration = Date.now() - start;
      
      results.push({
        url: target,
        status: response.status,
        statusText: response.statusText,
        duration: `${duration}ms`,
        success: response.ok
      });
      
    } catch (err) {
      results.push({
        url: target,
        error: err.message,
        code: err.code,
        success: false
      });
    }
  }
  
  return res.status(200).json({
    timestamp: new Date().toISOString(),
    vps_url: VPS_URL,
    test_results: results,
    summary: {
      total: targets.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }
  });
}
