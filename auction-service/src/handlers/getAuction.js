const AWS = require ('aws-sdk');
const middy = require('@middy/core');
const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httpEventNormalizer = require('@middy/http-event-normalizer');
const httpErrorHandler = require('@middy/http-error-handler');
const dynamodb = new AWS.DynamoDB.DocumentClient()


const getAuctionById = async (id) => {
    let auction;

    try{
        const result = await dynamodb.get({
            TableName: process.env.AUCTION_TABLE_NAME,
            Key: { id }
        }).promise();
    
        auction = result.Item;
    }catch(error){
        throw new Error('Error retrieving auction');
    }

    if(!auction){
        throw new Error(`Auction with ID ${id} not Found`);
    }

    return auction;
}

const getAuction = async (event) => {
    const {id} = event.pathParameters;
    const auction = await getAuctionById(id);
   
    return {
        statusCode: 200,
        body: JSON.stringify(
        {
            auction
        },
        null,
        2
        ),
    };
};

exports.getAuctionById = getAuctionById

exports.handler = middy(getAuction)
.use(httpJsonBodyParser())
.use(httpEventNormalizer())
.use(httpErrorHandler());

