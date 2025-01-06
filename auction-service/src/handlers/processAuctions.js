const middy = require('@middy/core');
const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httpEventNormalizer = require('@middy/http-event-normalizer');
const httpErrorHandler = require('@middy/http-error-handler');


const processAuctions = async(event) => {
    console.log('processing auctions')
}

exports.handler = processAuctions