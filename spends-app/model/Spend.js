import { randomUUID } from 'node:crypto';

class Spend {
  constructor({ id, name, description, amount, datetime_spend }) {
    this.id = id;
    this.name = name;
    this.description = description || null;
    this.amount = amount;
    this.datetime_spend = datetime_spend;
  }

  static newSpend(name, amount, description = null) {
    const iso = new Date().toISOString().split('T')[0];
    return new Spend({
      id: randomUUID(),
      name,
      description,
      amount,
      datetime_spend: iso,
    });
  }
}

export default Spend;
