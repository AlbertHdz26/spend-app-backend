import { describe, it, expect } from '@jest/globals';
import Spend from '../../../model/Spend.js';

describe('Spend', () => {
  describe('constructor', () => {
    it('debe crear una instancia con todas las propiedades', () => {
      const data = {
        id: '123',
        name: 'Almuerzo',
        description: 'Comida en restaurante',
        amount: 25.50,
        datetime_spend: '2026-08-21',
      };

      const spend = new Spend(data);

      expect(spend.id).toBe('123');
      expect(spend.name).toBe('Almuerzo');
      expect(spend.description).toBe('Comida en restaurante');
      expect(spend.amount).toBe(25.50);
      expect(spend.datetime_spend).toBe('2026-08-21');
    });

    it('debe asignar null a description si no se proporciona', () => {
      const data = {
        id: '123',
        name: 'Café',
        amount: 5.00,
        datetime_spend: '2026-08-21',
      };

      const spend = new Spend(data);

      expect(spend.description).toBeNull();
    });
  });

  describe('newSpend', () => {
    it('debe crear un nuevo Spend con id generado automáticamente', () => {
      const spend = Spend.newSpend('Taxi', 15.00, 'Viaje al trabajo');

      expect(spend).toBeInstanceOf(Spend);
      expect(spend.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
      expect(spend.name).toBe('Taxi');
      expect(spend.amount).toBe(15.00);
      expect(spend.description).toBe('Viaje al trabajo');
    });

    it('debe asignar la fecha actual en formato ISO (YYYY-MM-DD)', () => {
      const spend = Spend.newSpend('Compras', 100.00);
      const today = new Date().toISOString().split('T')[0];

      expect(spend.datetime_spend).toBe(today);
    });

    it('debe asignar null a description por defecto', () => {
      const spend = Spend.newSpend('Gasolina', 50.00);

      expect(spend.description).toBeNull();
    });

    it('debe generar ids únicos para cada instancia', () => {
      const spend1 = Spend.newSpend('Gasto 1', 10.00);
      const spend2 = Spend.newSpend('Gasto 2', 20.00);

      expect(spend1.id).not.toBe(spend2.id);
    });
  });
});
