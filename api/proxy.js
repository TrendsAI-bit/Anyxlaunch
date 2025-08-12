// Vercel serverless function to proxy API calls and bypass CORS
export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { url, method = 'GET', headers = {}, body } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`Proxying ${method} request to: ${url}`);
    
    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body && method !== 'GET') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.text();
    
    // Try to parse as JSON, fallback to text
    let responseData;
    try {
      responseData = JSON.parse(data);
    } catch {
      responseData = data;
    }

    res.status(response.status).json({
      success: response.ok,
      status: response.status,
      data: responseData
    });

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
