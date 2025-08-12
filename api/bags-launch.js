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

    // Step 1: Create token launch configuration
    console.log('📡 Step 1: Creating launch config...');
    const configResponse = await fetch(`${apiBase}/token-launch/create-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        launchWallet: creatorWallet
      })
    });

    if (!configResponse.ok) {
      const errorText = await configResponse.text();
      console.error('Config API error:', errorText);
      throw new Error(`Config API failed: ${configResponse.status} - ${errorText}`);
    }

    const configData = await configResponse.json();
    console.log('✅ Config created:', configData);

    if (!configData.success) {
      throw new Error(`Config failed: ${configData.error || 'Unknown error'}`);
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

    // Step 3: Create the launch transaction
    console.log('📡 Step 2: Creating launch transaction...');
    const launchResponse = await fetch(`${apiBase}/token-launch/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        configId: configData.response?.id || configData.id,
        metadata: metadata,
        initialLiquiditySOL: 0.1,
        creatorWallet: creatorWallet
      })
    });

    if (!launchResponse.ok) {
      const errorText = await launchResponse.text();
      console.error('Launch API error:', errorText);
      throw new Error(`Launch API failed: ${launchResponse.status} - ${errorText}`);
    }

    const launchData = await launchResponse.json();
    console.log('✅ Launch transaction created:', launchData);

    if (!launchData.success) {
      throw new Error(`Launch failed: ${launchData.error || 'Unknown error'}`);
    }

    // Return the transaction for client-side signing
    res.status(200).json({
      success: true,
      data: {
        configId: configData.response?.id || configData.id,
        transaction: launchData.response?.transaction || launchData.transaction,
        message: 'Token launch transaction prepared successfully',
        metadata: metadata
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
