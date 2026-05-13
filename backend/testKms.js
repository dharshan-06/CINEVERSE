const AWS = require('aws-sdk');

const kms = new AWS.KMS({
  region: process.env.AWS_REGION
});

async function testKMS() {

  console.log("Testing AWS KMS Connection...");

  try {

    const params = {
      KeyId: process.env.KMS_KEY_ID,
      Plaintext: Buffer.from("Hello from GitHub Actions")
    };

    const result = await kms.encrypt(params).promise();

    console.log("Encryption Successful!");
    console.log(result.CiphertextBlob.toString('base64'));

  } catch (error) {

    console.error("KMS Error:", error);

  }
}

testKMS();