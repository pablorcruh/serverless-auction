const AWS = require('aws-sdk')
const middy = require('@middy/core');
const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httpEventNormalizer = require('@middy/http-event-normalizer');
const httpErrorHandler = require('@middy/http-error-handler');
const createError = require('http-errors')

const dynamodb = new AWS.DynamoDB.DocumentClient();

const getAuctions = async (event) => {
  const {status} = event.queryStringParameters;
 let auctions
  let result
  try{
    const params = {
        TableName: process.env.AUCTION_TABLE_NAME,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeValues: {
          ':status': status,
        },
        ExpressionAttributeNames: {
          '#status': 'status'
      }
    };
    result = await dynamodb.query(params).promise();
  }catch(error){
    throw new createError(500,error)
  }
  auctions = result.Items
  return {
    statusCode: 200,
    body: JSON.stringify({
      auctions
    })
  };
};


exports.handler = middy(getAuctions)
.use(httpJsonBodyParser())
.use(httpEventNormalizer())
.use(httpErrorHandler());
