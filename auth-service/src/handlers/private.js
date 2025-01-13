const handler = (event) =>{
    return {
        statusCode: 200,
        headers: {
            /* Required for CORS support to work */
          'Access-Control-Allow-Origin': '*',
            /* Required for cookies, authorization headers with HTTPS */
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          event
        })
    }
}

module.exports.handler = handler;