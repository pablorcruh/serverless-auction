const {v4} = require('uuid')
const AWS = require('aws-sdk')
const middy = require('@middy/core');
const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httpEventNormalizer = require('@middy/http-event-normalizer');
const httpErrorHandler = require('@middy/http-error-handler');
const validatorMiddleware = require('@middy/validator');
const {transpileSchema} = require('@middy/validator/transpile')

const createError = require('http-errors')
const createAuctionSchema = require('../lib/schemas/createAuctionSchema')


const dynamodb = new AWS.DynamoDB.DocumentClient();

const createAuction = async (event) => {
  const {email} = event.requestContext.authorizer.lambda;
  const body = event.body
  const title = body.title
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);
  
  const auction = {
    id: v4(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0
    },
    seller: email
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
.use(httpErrorHandler())
.use(validatorMiddleware({
  eventSchema: transpileSchema(createAuctionSchema)
}));
