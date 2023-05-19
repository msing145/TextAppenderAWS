

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient()
const ec2 = new AWS.EC2();
const s3 = new AWS.S3();

const INSTANCE_TYPE = process.env.INSTANCE_TYPE;
const KEY_NAME = process.env.KEY_NAME;
const AMI = process.env.AMI;
const SUBNET_ID = process.env.SUBNET_ID;
const BUCKET_NAME = process.env.BUCKET_NAME
const KEY = 'private/us-east-1:58dc6076-3925-48e1-b542-deb793c64ef1/my_script.js'
const ARN = process.env.ARN;

exports.handler = async (event, context) => {
  
  
  const text = JSON.parse(event.body)
  const inputText = text.inputText
  const inputFilePath = text.inputFilePath
  const index = Math.floor(Math.random() * 100);
  
 
  
const params = {
    TableName: 'Message',
    Item: {
      id : index,
      input_text : inputText,
      input_file_path : inputFilePath
    }
  };

  try {
    const data = await docClient.put(params).promise();
    console.log(data);

    const instancId = await ec2InstanceAndScript(index, inputText, inputFilePath);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      },
      body: JSON.stringify(instancId) 
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      },
      body: JSON.stringify('Error occurred while fetching data from DynamoDB' + err)
    };
  }
 
};



async function ec2InstanceAndScript(index, inputText, inputFilePath){

    try {
        
        
        
        const scriptParams = {
          Bucket: BUCKET_NAME,
           Key: KEY,
        };
        
        
        
        const scriptObject = await s3.getObject(scriptParams).promise();
        let scriptContent = scriptObject.Body.toString('utf-8');
        
        scriptContent = scriptContent.replace(/__ID__/g, index);
        
        
        
        // Run the script on the instance
        const userData = new Buffer.from(scriptContent).toString('base64');
        
        
        const instanceParams = {
          InstanceType: INSTANCE_TYPE,
          KeyName: KEY_NAME,
          ImageId: AMI,
          SubnetId: SUBNET_ID,
          MaxCount: 1,
          MinCount: 1,
          UserData: userData,
          IamInstanceProfile: {
              Arn: ARN
          },
          TagSpecifications: [{
            ResourceType: 'instance',
            Tags: [{ Key: 'Name', Value: 'Dry-run' }],
          }],
        };
    
        const instance = await ec2.runInstances(instanceParams).promise();
        const instanceId = instance.Instances[0].InstanceId

        //console.log(`New instance created: ${instance.Instances[0].InstanceId}`);
        
        /*
        
        const waitParams = {
          InstanceIds: [instanceId]
        };
        await ec2.waitFor('instanceStatusOk', waitParams).promise();
        
        
        const terminateParams = {
              InstanceIds: [instanceId]
          };
        await ec2.terminateInstances(terminateParams).promise();
        
        */
        
        
        return instanceId
        
      } catch (err) {
        console.log(err);
        return err
      }



}