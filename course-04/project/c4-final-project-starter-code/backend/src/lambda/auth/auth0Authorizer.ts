import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJdAbpWzKVnvztMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFm9sdXdhdG9iaS5ldS5hdXRoMC5jb20wHhcNMjAwNDI2MDk0MDU3WhcNMzQw
MTAzMDk0MDU3WjAhMR8wHQYDVQQDExZvbHV3YXRvYmkuZXUuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw2+B9PK4tYNywuc9D1KRBKY1
xXT2qD+s9+Puv08HAzhw2zx9FtbQ6DKEPD2RiG0C9DuyhCWsS6mMlMS6Z9FVgUzt
p/nf2I2wsRripv0hbjtdMXW2KN56ZBOla54fKzDCxPzPSKmkeRIYeiru8/0URWdE
N7K0mZ4UiMd+JXhG71CJnZOGH5ktuemGL1X2DWo0miJw1PRW2WyJdkfGN8u+fUPc
+9xqW0ZXPkkDe9SX+Juk9eZJTGlGi12u4B+2oToNyOoR7oTcMuoa6TDnGvzLlpj3
MwZtshHiK0Sa9siKEBwm6CtmqUIbBybgiaHbsjQyZ8nmCZvbRLFSzmEMtBOaJQID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQlKZqzezIZl+TPAc69
KeIGvYbAlDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAFPaQTS/
TbtOSPQvm7KNyUlu4VWkgslGi7g6jMJ9QXcZQ+g6CUu/Q5wsyrSHQzcBjEnLoG2o
jOK2qJ1NhM/N5gUtRo952ZJj2Nvu45+Ts90nC7gJcXyZjk9OZkYc0wYVENkekm86
BoJ/E818yI3AvWzn20L/Ou9Hf2DxmRNv2D+juwZ2ogyx1Pdv7vFFeQ2bYOKJ5HRs
PV7R+g/nVKM6sroLbR67MCHNQGqZqhVWrdPHP/d03AUcxu5FYkVWwfMbhKwJwtvI
2diTGY9Xq1KIHzHtdbCyaBPPW3cszlBKSvXwi3oAHDxG2qD9yVtglq/rBk84V3n5
o4Cf4HLkU8t+IV4=
-----END CERTIFICATE-----`
// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken : JwtPayload= verifyToken(event.authorizationToken, cert)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string, cert: string) : JwtPayload {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  logger.info('decoded token is ', jwt)
 
  return  verify(token, cert) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}