const middy = require('@middy/core');
const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httpEventNormalizer = require('@middy/http-event-normalizer');
const httpErrorHandler = require('@middy/http-error-handler');

const handler = async (handler) => {
    await middy(handler)
    .use([
        httpJsonBodyParser(),
        httpEventNormalizer(),
        httpErrorHandler()
    ]);
}

module.exports.handler = handler; 
    