// Vercel serverless function for Bags.fm token launching using official SDK
import { BagsSDK } from '@bagsfm/bags-sdk';

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

    console.log('🚀 Creating Bags token with official SDK:', { tokenName, symbol, creatorWallet });

    // Initialize Bags SDK
    const bags = new BagsSDK({
      apiKey: 'bags_prod_3zpiHpFX3GsG0ZzA5XOQmJw06Go8pPVjRuqDHq0jD2Q',
      rpcUrl: 'https://mainnet.helius-rpc.com/?api-key=bc40e3e4-98df-4d4f-99cf-dd22cc091955',
      environment: 'production' // or 'development' for testnet
    });

    // Create token metadata
    const metadata = {
      name: tokenName,
      symbol: symbol,
      description: description || `${tokenName} (${symbol}) launched via AnyXlaunch`,
      image: imageUri || 'https://via.placeholder.com/512x512/000000/FFFFFF?text=' + encodeURIComponent(symbol),
      external_url: 'https://anyxlaunch.vercel.app',
      attributes: [
        {
          trait_type: 'Platform',
          value: 'AnyXlaunch'
        },
        {
          trait_type: 'Launch Method',
          value: 'Web Interface'
        }
      ]
    };

    // Create token launch configuration
    const launchConfig = await bags.createTokenLaunchConfig({
      creatorWallet: creatorWallet,
      metadata: metadata,
      initialLiquiditySOL: 0.1, // 0.1 SOL initial liquidity
      // Add other configuration options as needed
    });

    console.log('✅ Launch config created:', launchConfig);

    // Generate the launch transaction
    const launchTransaction = await bags.createLaunchTransaction({
      configId: launchConfig.id,
      creatorWallet: creatorWallet
    });

    console.log('✅ Launch transaction created');

    // Return the transaction for client-side signing
    res.status(200).json({
      success: true,
      data: {
        configId: launchConfig.id,
        transaction: launchTransaction.transaction, // Base64 encoded transaction
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
      details: error.response?.data || error.stack,
      code: error.code || 'BAGS_SDK_ERROR'
    });
  }
}
