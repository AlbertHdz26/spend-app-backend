import DynamoDBSpendRepository from '../repository/DynamoDBSpendRepository.js';
import SpendService from '../service/SpendService.js';
import { corsHeaders } from './corsHeaders.mjs';

export const handler = async (event, context) => {
  const repository = new DynamoDBSpendRepository();
  const spendService = new SpendService(repository);

  const id = event.pathParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'El parámetro "id" es obligatorio',
      }),
    };
  }

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

  const { name, amount, description } = body;

  try {
    const updatedSpend = await spendService.updateSpend(id, { name, amount, description });

    if (!updatedSpend) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Gasto no encontrado',
        }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Gasto actualizado correctamente',
        spend: updatedSpend,
      }),
    };
  } catch (error) {
    console.error('Error al actualizar el gasto:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Error al actualizar el gasto',
      }),
    };
  }
};
