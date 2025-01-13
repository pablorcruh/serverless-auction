const AWS = require ('aws-sdk');

const middy = require('@middy/core');
const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httpEventNormalizer = require('@middy/http-event-normalizer');
const httpErrorHandler = require('@middy/http-error-handler');
const {getAuctionById} = require('./getAuction')
const placeBidSchema = require('../lib/schemas/placeBidSchema');
const validatorMiddleware = require('@middy/validator');
const {transpileSchema} = require('@middy/validator/transpile')

const dynamodb = new AWS.DynamoDB.DocumentClient()

const placeBid = async(event) => {
    const  {id} = event.pathParameters;
    const {amount} = event.body
    const {email} = event.requestContext.authorizer.lambda;


    const auction = await getAuctionById(id)

        // bid identity validation
        if(email === auction.seller){
            throw new Error('You cannot bid on your own auctions!');
        }
        // avoid double bidding
        if(email === auction.highestBid.bidder){
            throw new Error('You are already the higest bidder!');
        }
    
        // auction status validation
        if(auction.status != 'OPEN'){
          throw new Error('Can not bid on closed auction')
        }
    
        // bid amount validation
        if(amount <= auction.highestBid.amount){
            throw new Error('Please check the amount bid');
        }
    

    const params = {
        TableName: process.env.AUCTION_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
        ExpressionAttributeValues: {
            ':amount': amount,
            ':bidder': email
        },
        ReturnValues: 'ALL_NEW'
    };

    let updatedAuction;    
    try{
        const result = await  dynamodb.update(params).promise();
        updatedAuction = result.Attributes;
    
    }catch(error){
        throw new Error(error);
    }


    return {
        statusCode: 200,
        body: JSON.stringify({
            updatedAuction
        },
        null,
        2
        )
    };
};

exports.handler = middy(placeBid)
.use(httpJsonBodyParser())
.use(httpEventNormalizer())
.use(httpErrorHandler())
.use(validatorMiddleware({
  eventSchema: transpileSchema(placeBidSchema)
}));
