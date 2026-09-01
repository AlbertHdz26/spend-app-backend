import DynamoDBSpendRepository from '../repository/DynamoDBSpendRepository.js';
import SpendService from '../service/SpendService.js';
import { corsHeaders } from './corsHeaders.mjs';

export const handler = async (event, context) => {
  const repository = new DynamoDBSpendRepository();
  const spendService = new SpendService(repository);

  try {
    const spends = await spendService.listSpends();

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ spends }),
    };
  } catch (error) {
    console.error('Error al listar los gastos:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Error al listar los gastos',
      }),
    };
  }
};
