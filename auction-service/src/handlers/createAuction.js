const {v4} = require('uuid')
const AWS = require('aws-sdk')
const middy = require('@middy/core');
const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httpEventNormalizer = require('@middy/http-event-normalizer');
const httpErrorHandler = require('@middy/http-error-handler');
const createError = require('http-errors')

const dynamodb = new AWS.DynamoDB.DocumentClient();

const createAuction = async (event) => {
  const body = event.body
  const title = body.title
  const now = new Date();
  
  const auction = {
    id: v4(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    highestBid: {
      amount: 0
    },
  }


  try{
    await dynamodb.put(
      {
        TableName: process.env.AUCTION_TABLE_NAME,
        Item: auction
      }
    ).promise()
  }catch(error){
    throw new createError(500, error)
  }

  return {
    statusCode: 201,
    body: JSON.stringify({
      auction
    })
  };
};


exports.handler = middy(createAuction)
.use(httpJsonBodyParser())
.use(httpEventNormalizer())
.use(httpErrorHandler());
