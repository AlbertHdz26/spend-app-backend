import Spend from '../model/Spend.js';

class SpendService {

  constructor(repository) {
    this.repository = repository;
  }

  async createSpend(name, amount, description = null) {
    const spend = Spend.newSpend(name, amount, description);

    await this.repository.createSpend({
      id: spend.id,
      name: spend.name,
      description: spend.description,
      amount: spend.amount,
      datetime_spend: spend.datetime_spend,
    });

    return spend;
  }

  async getSpend(id) {
    const item = await this.repository.getSpend(id);

    if (!item) {
      return null;
    }

    return new Spend(item);
  }

  async listSpends() {
    const items = await this.repository.listSpends();
    return items.map((item) => new Spend(item));
  }

  async updateSpend(id, { name, amount, description }) {
    // Solo enviamos los campos definidos para no sobrescribir con undefined.
    const fields = {};
    if (name !== undefined) fields.name = name;
    if (amount !== undefined) fields.amount = amount;
    if (description !== undefined) fields.description = description;

    try {
      const updated = await this.repository.updateSpend(id, fields);

      if (!updated) {
        return null;
      }

      return new Spend(updated);
    } catch (error) {
      // El repositorio usa una condición attribute_exists(id); si el gasto
      // no existe DynamoDB lanza ConditionalCheckFailedException.
      if (error.name === 'ConditionalCheckFailedException') {
        return null;
      }
      throw error;
    }
  }

  async deleteSpend(id) {
    await this.repository.deleteSpend(id);
  }
}

export default SpendService;
