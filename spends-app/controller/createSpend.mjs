import DynamoDBSpendRepository from '../repository/DynamoDBSpendRepository.js';
import SpendService from '../service/SpendService.js';
import { corsHeaders } from './corsHeaders.mjs';

export const handler = async (event, context) => {
  const repository = new DynamoDBSpendRepository();
  const spendService = new SpendService(repository);

  // Parseamos el body recibido en la petición
  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
  } catch (error) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'El cuerpo de la petición no es un JSON válido',
      }),
    };
  }

  const { name, amount, description = null } = body;

  // Validamos los campos requeridos
  if (!name || amount === undefined || amount === null) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Los campos "name" y "amount" son obligatorios',
      }),
    };
  }

  try {
    const createdSpend = await spendService.createSpend(name, amount, description);

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Gasto creado correctamente',
        spend: createdSpend,
      }),
    };
  } catch (error) {
    console.error('Error al crear el gasto:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Error al crear el gasto',
      }),
    };
  }
};
