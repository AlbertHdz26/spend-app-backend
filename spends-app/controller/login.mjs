import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { corsHeaders } from './corsHeaders.mjs';

const ssmClient = new SSMClient();

// Cache de credenciales
let cachedCredentials = null;

const getCredentials = async () => {
  if (cachedCredentials) {
    return cachedCredentials;
  }
  console.log('Login: Obteniendo credenciales desde SSM');

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
 * Lambda de Login - Endpoint público POST /auth
 * Valida las credenciales enviadas por el frontend y retorna 200 o 401.
 */
export const handler = async (event) => {
  const authHeader = event.headers?.Authorization || event.headers?.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return {
      statusCode: 401,
      headers: { ...corsHeaders, 'WWW-Authenticate': 'Basic realm="spends-app"' },
      body: JSON.stringify({
        message: 'Se requiere autenticación. Envíe el header Authorization con Basic Auth.',
      }),
    };
  }

  try {
    const base64Credentials = authHeader.split(' ')[1];
    const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');

    const credentials = await getCredentials();

    if (username === credentials.username && password === credentials.password) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Autenticación exitosa',
          username,
        }),
      };
    }

    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Credenciales inválidas.',
      }),
    };
  } catch (error) {
    console.error('Login: Error al validar autenticación:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Error interno al validar la autenticación.',
      }),
    };
  }
};
