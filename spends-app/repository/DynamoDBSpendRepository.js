import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

class DynamoDBSpendRepository {

  async createSpend(item) {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    });

    const response = await docClient.send(command);
    return response;
  }

  async getSpend(id) {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });

    const response = await docClient.send(command);
    return response.Item ?? null;
  }

  async listSpends() {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const response = await docClient.send(command);
    return response.Items ?? [];
  }

  async updateSpend(id, fields) {
    // Construimos dinámicamente la expresión de actualización solo con
    // los campos proporcionados, evitando sobrescribir con undefined.
    const updatableKeys = Object.keys(fields).filter(
      (key) => fields[key] !== undefined
    );

    if (updatableKeys.length === 0) {
      // No hay nada que actualizar; devolvemos el item actual.
      return this.getSpend(id);
    }

    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    for (const key of updatableKeys) {
      updateExpressions.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = fields[key];
    }

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      // Solo actualiza si el item existe.
      ConditionExpression: 'attribute_exists(id)',
      ReturnValues: 'ALL_NEW',
    });

    const response = await docClient.send(command);
    return response.Attributes ?? null;
  }

  async deleteSpend(id) {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });

    const response = await docClient.send(command);
    return response;
  }

}

export default DynamoDBSpendRepository;
