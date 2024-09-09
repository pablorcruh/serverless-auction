const {v4} = require('uuid')
const AWS = require('aws-sdk')

exports.createAuction = async (event) => {
  const body = JSON.parse(event.body)
  const title = body.title
  const now = new Date();
  const dynamodb = new AWS.DynamoDB.DocumentClient();


  const auction = {
    id: v4(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString()
  }

  await dynamodb.put(
    {
      TableName: process.env.AUCTION_TABLE_NAME,
      Item: auction
    }
  ).promise()

  return {
    statusCode: 201,
    body: JSON.stringify({
      auction
    })
  };
};
