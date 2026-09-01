import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import SpendService from '../../../service/SpendService.js';
import Spend from '../../../model/Spend.js';

// Repositorio mock para aislar la lógica del servicio de DynamoDB.
function createMockRepository() {
  return {
    createSpend: jest.fn(),
    getSpend: jest.fn(),
    listSpends: jest.fn(),
    updateSpend: jest.fn(),
    deleteSpend: jest.fn(),
  };
}

describe('SpendService', () => {
  let repository;
  let service;

  beforeEach(() => {
    repository = createMockRepository();
    service = new SpendService(repository);
  });

  describe('createSpend', () => {
    it('debe crear un Spend y persistirlo en el repositorio', async () => {
      repository.createSpend.mockResolvedValue({});

      const spend = await service.createSpend('Taxi', 15.0, 'Viaje');

      expect(spend).toBeInstanceOf(Spend);
      expect(spend.name).toBe('Taxi');
      expect(spend.amount).toBe(15.0);
      expect(spend.description).toBe('Viaje');
      expect(repository.createSpend).toHaveBeenCalledTimes(1);
      expect(repository.createSpend).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Taxi', amount: 15.0, description: 'Viaje' })
      );
    });
  });

  describe('getSpend', () => {
    it('debe devolver un Spend cuando existe', async () => {
      repository.getSpend.mockResolvedValue({
        id: '123',
        name: 'Café',
        description: null,
        amount: 5,
        datetime_spend: '2026-08-21',
      });

      const spend = await service.getSpend('123');

      expect(spend).toBeInstanceOf(Spend);
      expect(spend.id).toBe('123');
      expect(repository.getSpend).toHaveBeenCalledWith('123');
    });

    it('debe devolver null cuando el gasto no existe', async () => {
      repository.getSpend.mockResolvedValue(null);

      const spend = await service.getSpend('no-existe');

      expect(spend).toBeNull();
    });
  });

  describe('listSpends', () => {
    it('debe devolver un arreglo de instancias de Spend', async () => {
      repository.listSpends.mockResolvedValue([
        { id: '1', name: 'A', amount: 10, datetime_spend: '2026-08-21' },
        { id: '2', name: 'B', amount: 20, datetime_spend: '2026-08-21' },
      ]);

      const spends = await service.listSpends();

      expect(spends).toHaveLength(2);
      expect(spends[0]).toBeInstanceOf(Spend);
      expect(spends[1].id).toBe('2');
    });

    it('debe devolver un arreglo vacío cuando no hay gastos', async () => {
      repository.listSpends.mockResolvedValue([]);

      const spends = await service.listSpends();

      expect(spends).toEqual([]);
    });
  });

  describe('updateSpend', () => {
    it('debe actualizar solo los campos definidos', async () => {
      repository.updateSpend.mockResolvedValue({
        id: '123',
        name: 'Nuevo',
        description: null,
        amount: 99,
        datetime_spend: '2026-08-21',
      });

      const spend = await service.updateSpend('123', { name: 'Nuevo', amount: 99 });

      expect(spend).toBeInstanceOf(Spend);
      expect(spend.name).toBe('Nuevo');
      expect(repository.updateSpend).toHaveBeenCalledWith('123', {
        name: 'Nuevo',
        amount: 99,
      });
    });

    it('debe devolver null cuando el repositorio lanza ConditionalCheckFailedException', async () => {
      const error = new Error('no existe');
      error.name = 'ConditionalCheckFailedException';
      repository.updateSpend.mockRejectedValue(error);

      const spend = await service.updateSpend('no-existe', { name: 'X' });

      expect(spend).toBeNull();
    });

    it('debe propagar otros errores', async () => {
      repository.updateSpend.mockRejectedValue(new Error('fallo de red'));

      await expect(service.updateSpend('123', { name: 'X' })).rejects.toThrow(
        'fallo de red'
      );
    });
  });

  describe('deleteSpend', () => {
    it('debe delegar la eliminación al repositorio', async () => {
      repository.deleteSpend.mockResolvedValue({});

      await service.deleteSpend('123');

      expect(repository.deleteSpend).toHaveBeenCalledWith('123');
    });
  });
});
