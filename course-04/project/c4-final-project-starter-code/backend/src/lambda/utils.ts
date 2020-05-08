import { APIGatewayProxyEvent } from "aws-lambda";
import { parseUserId } from "../auth/utils";
import * as AWS  from 'aws-sdk'
import { createLogger } from '../utils/logger'
import * as AWSXRay from 'aws-xray-sdk'


const logger = createLogger('Utils');
const XAWS = AWSXRay.captureAWS(AWS)

const docClient = new XAWS.DynamoDB.DocumentClient()

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
const todosTable = process.env.TODOS_TABLE

export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  logger.info('Parsed jwt token is',jwtToken)

  return parseUserId(jwtToken)
}

export async function userExist(userId: string) {
  
  const result = await docClient
  .get({
    TableName: todosTable,
    Key: {
      userId: userId
    }
  })
  .promise()

logger.log('Get user: ', result)
return !!result.Item
}