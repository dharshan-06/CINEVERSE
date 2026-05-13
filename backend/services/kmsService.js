const AWS = require('aws-sdk');

const kms = new AWS.KMS({
  region: process.env.AWS_REGION || 'us-east-1'
});

const decryptSecret = async (encryptedData) => {
  if (!encryptedData || !encryptedData.startsWith('kms:')) {
    // If it doesn't start with 'kms:', assume it's already decrypted (fallback for local dev)
    return encryptedData;
  }

  try {
    const data = await kms.decrypt({
      CiphertextBlob: Buffer.from(encryptedData.replace('kms:', ''), 'base64')
    }).promise();
    
    return data.Plaintext.toString('utf-8');
  } catch (error) {
    console.error('KMS Decryption Error:', error);
    // Return original if decryption fails (might be local dev env)
    return encryptedData;
  }
};

module.exports = { decryptSecret };
