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

  try {
    const spend = await spendService.getSpend(id);

    if (!spend) {
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
      body: JSON.stringify({ spend }),
    };
  } catch (error) {
    console.error('Error al obtener el gasto:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Error al obtener el gasto',
      }),
    };
  }
};
