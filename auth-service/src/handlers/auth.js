const jwt = require('jsonwebtoken');

const generatePolicy = (principalId, methodArn) => {
    const apiGatewayWildcard = methodArn.split('/', 2).join('/') + '/*';
return {
        principalId,
        policyDocument: {
        Version: '2012-10-17',
        Statement: [
            {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: apiGatewayWildcard,
            },
        ],
        },
    };
};

const handler = async (event)=>{
    if (!event.headers.authorization) {
        throw new Error('Unauthorized!!');
    }
    const token = event.headers.authorization.replace('Bearer ', '');
  try {
        const response = {};
        const claims = jwt.verify(token, process.env.AUTH0_PUBLIC_KEY);
        const policy = generatePolicy(claims.sub, event.routeArn);
        return {
            ...policy,
            context: claims
        };
  } catch (error) {
    console.log(error);
    throw new Error('Unauthorized!!');
  }
}

module.exports.handler = handler;