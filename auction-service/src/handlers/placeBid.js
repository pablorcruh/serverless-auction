const AWS = require ('aws-sdk');

const middy = require('@middy/core');
const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httpEventNormalizer = require('@middy/http-event-normalizer');
const httpErrorHandler = require('@middy/http-error-handler');
const {getAuctionById} = require('./getAuction')

const dynamodb = new AWS.DynamoDB.DocumentClient()

const placeBid = async(event) => {
    const  {id} = event.pathParameters;
    const {amount} = event.body

    const auction = await getAuctionById(id)

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
        UpdateExpression: 'set highestBid.amount = :amount',
        ExpressionAttributeValues: {
            ':amount': amount
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
.use(httpErrorHandler());
