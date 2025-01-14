const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

const closeAuction = async (auction) => {

    const params = {
        TableName: process.env.AUCTION_TABLE_NAME,
        Key: {id: auction.id},
        UpdateExpression: 'set #status = :status',
        ExpressionAttributeValues: {
            ':status': 'CLOSED'
        },
        ExpressionAttributeNames: {
            '#status': 'status'
        }
    }

    await dynamodb.update(params).promise()

    const {title, seller, highestBid} = auction;
    const {amount, bidder} = highestBid;


    if(amount === 0){
        await sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: 'No Bids on your item :(',
            recipient: seller,
            body: ` oh no! Your item "${title}" did not get any bids. Better luck next time`
        })            
        }).promise()
        return;
    }

    const notifySeller = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: 'the item has been sold',
            recipient: seller,
            body: ` Your item "${title}" has been sold for "${amount}"`
        })
    }).promise();

    const notifyBidder = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: 'You won an auction',
            recipient: bidder,
            body: `You got yourself a "${title}" for "${amount}"`
        })
    }).promise();

    return Promise.all([notifySeller, notifyBidder])
}

exports.closeAuction = closeAuction