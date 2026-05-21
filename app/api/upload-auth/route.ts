import crypto from 'crypto';

export async function GET() {
  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

    console.log('🔐 Upload Auth Endpoint Called');
    console.log('  ✓ Private Key exists:', !!privateKey);
    console.log('  ✓ Public Key exists:', !!publicKey);

    if (!privateKey || !publicKey) {
      console.error('❌ Missing ImageKit credentials');
      return Response.json(
        { error: 'Missing ImageKit credentials. Check .env.local' },
        { status: 500 }
      );
    }

    // Generate auth parameters
    const expireNum = Math.floor(Date.now() / 1000) + 1800; // 30 minutes (as number for signature)
    const expireStr = String(expireNum); // as string for response
    const token = crypto.randomBytes(10).toString('hex');

    console.log('✓ Token:', token);
    console.log('✓ Expire (number):', expireNum);
    console.log('✓ Expire (string):', expireStr);

    // Strip 'private_' or 'private_key_' prefix if present
    let privateKeyClean = privateKey;
    if (privateKeyClean.startsWith('private_key_')) {
      privateKeyClean = privateKeyClean.substring(12);
    } else if (privateKeyClean.startsWith('private_')) {
      privateKeyClean = privateKeyClean.substring(8);
    }

    console.log('✓ Private key length:', privateKeyClean.length);

    // Decode private key from base64
    let privateKeyBuffer;
    try {
      privateKeyBuffer = Buffer.from(privateKeyClean, 'base64');
      console.log('✓ Private key decoded, buffer length:', privateKeyBuffer.length);
    } catch (e) {
      console.error('❌ Base64 decode failed, trying UTF-8:', e);
      privateKeyBuffer = Buffer.from(privateKeyClean, 'utf-8');
    }

    // Create signature: HMAC-SHA1(privateKey, token + expire)
    // IMPORTANT: expire must be a STRING in the signature!
    const messageToSign = token + expireStr;
    console.log('✓ Message to sign:', messageToSign);

    const signature = crypto
      .createHmac('sha1', privateKeyBuffer)
      .update(messageToSign)
      .digest('hex');

    console.log('✓ Signature generated:', signature.substring(0, 20) + '...');
    console.log('✅ Auth params ready to send');

    return Response.json({
      token,
      expire: expireStr, // MUST be string!
      signature,
      publicKey,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Auth Error:', errorMsg);
    return Response.json(
      {
        error: 'Failed to generate authentication: ' + errorMsg,
      },
      { status: 500 }
    );
  }
}
