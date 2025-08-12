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

    console.log('🚀 Creating Bags token using official SDK:', { tokenName, symbol, creatorWallet });

    // Initialize Bags SDK properly following the documentation
    const bags = new BagsSDK({
      apiKey: 'bags_prod_3zpiHpFX3GsG0ZzA5XOQmJw06Go8pPVjRuqDHq0jD2Q',
      rpcUrl: 'https://mainnet.helius-rpc.com/?api-key=bc40e3e4-98df-4d4f-99cf-dd22cc091955'
    });

    console.log('✅ Bags SDK initialized');

    // Use the SDK methods (need to check what methods are actually available)
    console.log('📡 Available SDK methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(bags)));
    
    // Try to create a token launch - let's see what methods exist
    let result;
    try {
      // Try different possible method names
      if (typeof bags.launchToken === 'function') {
        console.log('🎯 Using launchToken method');
        result = await bags.launchToken({
          name: tokenName,
          symbol: symbol,
          description: description,
          image: imageUri,
          creator: creatorWallet
        });
      } else if (typeof bags.createToken === 'function') {
        console.log('🎯 Using createToken method');
        result = await bags.createToken({
          name: tokenName,
          symbol: symbol,
          description: description,
          image: imageUri,
          creator: creatorWallet
        });
      } else if (typeof bags.launch === 'function') {
        console.log('🎯 Using launch method');
        result = await bags.launch({
          name: tokenName,
          symbol: symbol,
          description: description,
          image: imageUri,
          creator: creatorWallet
        });
      } else {
        console.log('📋 Available methods:', Object.getOwnPropertyNames(bags));
        console.log('📋 Available prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(bags)));
        throw new Error('No suitable token creation method found in Bags SDK');
      }
      
      console.log('✅ SDK result:', result);
      
    } catch (sdkError) {
      console.error('❌ SDK method error:', sdkError);
      throw new Error(`Bags SDK error: ${sdkError.message}`);
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

    // Return the SDK result
    res.status(200).json({
      success: true,
      data: {
        message: 'Bags SDK token creation completed',
        result: result,
        metadata: metadata,
        transaction: result?.transaction || null
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
