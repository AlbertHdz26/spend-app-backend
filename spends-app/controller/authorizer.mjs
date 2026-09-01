import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient();

// Cache de credenciales para evitar llamadas repetidas a SSM en el mismo Lambda container
let cachedCredentials = null;

const getCredentials = async () => {
  if (cachedCredentials) {
    return cachedCredentials;
  }
  console.log('Authorizer: Obteniendo credenciales desde SSM');

  const [userResponse, passwordResponse] = await Promise.all([
    ssmClient.send(new GetParameterCommand({ Name: process.env.APP_USERNAME_SSM })),
    ssmClient.send(new GetParameterCommand({ Name: process.env.APP_PASSWORD_SSM })),
  ]);

  cachedCredentials = {
    username: userResponse.Parameter.Value,
    password: passwordResponse.Parameter.Value,
  };

  return cachedCredentials;
};

/**
 * Lambda Authorizer para API Gateway.
 * Valida el header Authorization (Basic Auth) y retorna una IAM policy.
 */
export const handler = async (event) => {
  const authHeader = event.headers?.Authorization || event.headers?.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    console.log('Authorizer: Header Authorization ausente o no es Basic');
    return generatePolicy('anonymous', 'Deny', event.methodArn);
  }

  try {
    const base64Credentials = authHeader.split(' ')[1];
    const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');

    const credentials = await getCredentials();

    if (username === credentials.username && password === credentials.password) {
      console.log('Authorizer: Autenticación exitosa');
      return generatePolicy(username, 'Allow', event.methodArn);
    }

    console.log('Authorizer: Credenciales inválidas');
    return generatePolicy(username, 'Deny', event.methodArn);
  } catch (error) {
    console.error('Authorizer: Error al validar autenticación:', error);
    return generatePolicy('anonymous', 'Deny', event.methodArn);
  }
};

/**
 * Genera la IAM policy que API Gateway usa para permitir o denegar el acceso.
 * Usa un wildcard en el resource ARN para que el caché del authorizer
 * funcione para todos los endpoints del API.
 */
function generatePolicy(principalId, effect, resource) {
  const arnParts = resource.split(':');
  const apiGatewayArn = arnParts[5].split('/');
  const wildcardArn = `${arnParts[0]}:${arnParts[1]}:${arnParts[2]}:${arnParts[3]}:${arnParts[4]}:${apiGatewayArn[0]}/${apiGatewayArn[1]}/*/*`;

  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: wildcardArn,
        },
      ],
    },
  };
}
