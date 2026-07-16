import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateNegocioDto } from './create-negocio.dto';

describe('CreateNegocioDto — fechaCierreEsperada (REM-003)', () => {
  const base = { titulo: 'Negocio Test', clienteId: 'cliente-1' };

  const errorFor = async (payload: Record<string, unknown>) => {
    const dto = plainToInstance(CreateNegocioDto, payload);
    const errors = await validate(dto);
    return { dto, error: errors.find((e) => e.property === 'fechaCierreEsperada') };
  };

  it('normalizes an empty string to undefined and does not fail validation', async () => {
    const { dto, error } = await errorFor({ ...base, fechaCierreEsperada: '' });
    expect(error).toBeUndefined();
    expect(dto.fechaCierreEsperada).toBeUndefined();
  });

  it('accepts a valid ISO date string', async () => {
    const { error } = await errorFor({ ...base, fechaCierreEsperada: '2026-12-31' });
    expect(error).toBeUndefined();
  });

  it('accepts an omitted (undefined) date', async () => {
    const { error } = await errorFor({ ...base });
    expect(error).toBeUndefined();
  });

  it('still rejects a malformed date string', async () => {
    const { error } = await errorFor({ ...base, fechaCierreEsperada: 'not-a-date' });
    expect(error).toBeDefined();
  });
});
