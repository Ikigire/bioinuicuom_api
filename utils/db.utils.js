require('dotenv').config()

// Load the AWS SDK for JS
var AWS = require("aws-sdk");

// Set a region to interact with (make sure it's the same as the region of your table)
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

// Set a table name that we can use later on
const tableName = "datos_sensados"

// Create the Service interface for DynamoDB
var dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

// Create the Document Client interface for DynamoDB
var ddbDocumentClient = new AWS.DynamoDB.DocumentClient();

module.exports = {
  tableName,
  dynamodb,
  ddbDocumentClient
}