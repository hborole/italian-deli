// Configure the AWS Account

const AWS = require('aws-sdk');

console.log(
  'AWS SES Config',
  process.env.AWS_ACCESS_KEY,
  process.env.AWS_SECRET_ACCESS_KEY,
  process.env.AWS_SES_REGION
);

const ses = new AWS.SES({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_SES_REGION,
  apiVersion: '2010-12-01',
});

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4',
});

module.exports = { s3, ses };
