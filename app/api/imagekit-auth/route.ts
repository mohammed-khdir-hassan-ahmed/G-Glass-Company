import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

    console.log('🔐 ImageKit Auth Endpoint:');
    console.log('  Public Key (first 20 chars):', publicKey?.substring(0, 20));
    console.log('  Private Key (first 20 chars):', privateKey?.substring(0, 20));

    if (!publicKey || !privateKey) {
      return Response.json(
        { error: 'Missing ImageKit credentials' },
        { status: 500 }
      );
    }

    // Generate authentication parameters
    const expire = Math.floor(Date.now() / 1000) + 1800; // 30 minutes
    const token = crypto.randomBytes(16).toString('hex');
    
    // ImageKit expects: signature = HMAC-SHA1(privateKey, token + expire)
    // Step 1: Strip 'private_' prefix
    const privateKeyWithoutPrefix = privateKey.startsWith('private_') 
      ? privateKey.substring(8) 
      : privateKey;
    
    // Step 2: Decode base64 to binary buffer
    const privateKeyBuffer = Buffer.from(privateKeyWithoutPrefix, 'base64');
    
    // Step 3: Create signature with binary key
    const messageToSign = `${token}${expire}`;
    
    const signature = crypto
      .createHmac('sha1', privateKeyBuffer)
      .update(messageToSign)
      .digest('hex');

    console.log('📝 Signature Generation:');
    console.log('  Token:', token);
    console.log('  Expire:', expire);
    console.log('  Message to sign:', messageToSign);
    console.log('  Signature (first 20 chars):', signature.substring(0, 20));

    console.log('🔍 Final Auth Response:');
    console.log('  token:', token);
    console.log('  expire:', expire);
    console.log('  signature:', signature);
    console.log('  publicKey (with prefix):', publicKey);
    console.log('  publicKey (without prefix):', publicKey?.startsWith('public_') ? publicKey.substring(7) : publicKey);

    return Response.json({
      token,
      expire,
      signature,
      publicKey, // Return public key with prefix as-is
    });
  } catch (error) {
    console.error('❌ Auth Error:', error);
    return Response.json(
      { 
        error: 'Failed to generate authentication', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
