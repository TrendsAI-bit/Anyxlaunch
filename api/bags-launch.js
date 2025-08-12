// Vercel serverless function for Bags.fm token launching using direct API calls
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tokenName, symbol, description, imageUri, creatorWallet } = req.body;
    
    if (!tokenName || !symbol || !creatorWallet) {
      return res.status(400).json({ 
        error: 'Missing required fields: tokenName, symbol, creatorWallet' 
      });
    }

    console.log('🚀 Creating Bags token via API:', { tokenName, symbol, creatorWallet });

    const apiKey = 'bags_prod_3zpiHpFX3GsG0ZzA5XOQmJw06Go8pPVjRuqDHq0jD2Q';
    const apiBase = 'https://public-api-v2.bags.fm/api/v1';

    // Step 1: Test different possible endpoints
    console.log('📡 Step 1: Testing Bags API endpoints...');
    
    // Try different possible endpoints
    const testEndpoints = [
      '/token-launch/create-config',
      '/tokens/create-config', 
      '/launch/create-config',
      '/create-config',
      '/config',
      '/health',
      '/status'
    ];
    
    let workingEndpoint = null;
    let configData = null;
    
    for (const endpoint of testEndpoints) {
      try {
        console.log(`🧪 Testing endpoint: ${endpoint}`);
        const testResponse = await fetch(`${apiBase}${endpoint}`, {
          method: 'GET',
          headers: {
            'x-api-key': apiKey
          }
        });
        
        console.log(`📊 ${endpoint}: Status ${testResponse.status}`);
        
        if (testResponse.ok || testResponse.status === 404) {
          workingEndpoint = endpoint;
          console.log(`✅ Found working endpoint: ${endpoint}`);
          break;
        }
      } catch (e) {
        console.log(`❌ ${endpoint}: ${e.message}`);
      }
    }
    
    if (!workingEndpoint) {
      throw new Error('No working Bags API endpoints found. The API might be different than expected.');
    }
    
    // If we found a working endpoint, try to create config
    if (workingEndpoint !== '/health' && workingEndpoint !== '/status') {
      console.log(`📡 Attempting token config with: ${workingEndpoint}`);
      const configResponse = await fetch(`${apiBase}${workingEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          launchWallet: creatorWallet,
          // Try different possible parameter names
          wallet: creatorWallet,
          creator: creatorWallet,
          owner: creatorWallet
        })
      });

      if (!configResponse.ok) {
        const errorText = await configResponse.text();
        console.error('Config API error:', errorText);
        throw new Error(`Config API failed: ${configResponse.status} - ${errorText}`);
      }

      configData = await configResponse.json();
      console.log('✅ Config created:', configData);
    } else {
      // If only health/status worked, we'll skip to manual fallback
      throw new Error('Only health endpoints work - Bags API might not support programmatic token creation');
    }

    // Step 2: Create token metadata (Bags handles image upload internally if needed)
    const metadata = {
      name: tokenName,
      symbol: symbol,
      description: description || `${tokenName} (${symbol}) launched via AnyXlaunch`,
      image: imageUri, // Bags will handle this
      external_url: 'https://anyxlaunch.vercel.app',
      attributes: [
        {
          trait_type: 'Platform',
          value: 'AnyXlaunch'
        }
      ]
    };

    // For now, just return success with endpoint discovery results
    res.status(200).json({
      success: true,
      data: {
        message: 'Bags API endpoint discovery completed',
        workingEndpoint: workingEndpoint,
        configData: configData,
        metadata: metadata,
        note: 'This is a debugging response - actual token creation needs proper API endpoints'
      }
    });

  } catch (error) {
    console.error('❌ Bags launch error:', error);
    
    // Return detailed error information
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create token launch',
      details: error.stack,
      code: 'BAGS_API_ERROR'
    });
  }
}
