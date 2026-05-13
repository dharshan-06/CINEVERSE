const AWS = require('aws-sdk');

const kms = new AWS.KMS({
  region: process.env.AWS_REGION || 'ap-south-1'
});

const decryptSecret = async (encryptedData) => {
  try {

    // Remove "kms:" prefix if present
    const cleanData = encryptedData.replace('kms:', '');

    const data = await kms.decrypt({
      CiphertextBlob: Buffer.from(cleanData, 'base64')
    }).promise();

    return data.Plaintext.toString('utf-8');

  } catch (error) {
    console.error('KMS Decryption Error:', error);
    return encryptedData;
  }
};

module.exports = { decryptSecret };