const AWS = require('aws-sdk')

const ses = new AWS.SES({region: 'us-east-1'})


const sendMail = async (event) => {

    const record = event.Records[0];
    const bodyMessage  = JSON.parse(record.body);
    const { body, recipient, subject} = bodyMessage;
    const params = {
      Source: 'pablorcruh@gmail.com',
      Destination: {
        ToAddresses: [ recipient ]
      },
      Message: {
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: body
          }
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject
        }
      }
    }
  
    try{
      const result = await ses.sendEmail(params).promise();
      console.log(result);
      return result;
    }catch(error){
      console.error(error);
    }

};
  
exports.sendMail = sendMail;