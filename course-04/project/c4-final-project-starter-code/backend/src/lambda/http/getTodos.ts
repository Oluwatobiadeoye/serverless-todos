import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getTodos } from '../../businessLogic/todos'
import { getUserId, userExist } from '../utils'

const logger = createLogger('Todo')
export const handler =  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  logger.info("processing event get todos", event)
  const userId = getUserId(event)

  logger.info('Validating user with id', userId)
  const validUserId = userExist(userId)

  if(!validUserId) {
    logger.info('Unable to find user with id: ', userId)
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'User does not exist'
      })
    }
  }
  const todos = await getTodos(userId)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      todos
    })
  }
}