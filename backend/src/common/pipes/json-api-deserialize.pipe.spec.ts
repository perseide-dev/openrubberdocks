import { JsonApiDeserializePipe } from './json-api-deserialize.pipe';
import { BadRequestException } from '@nestjs/common';

describe('JsonApiDeserializePipe', () => {
  let pipe: JsonApiDeserializePipe;

  beforeEach(() => {
    pipe = new JsonApiDeserializePipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should throw BadRequestException if data is not provided', () => {
    expect(() => pipe.transform({}, {} as any)).toThrow(BadRequestException);
    expect(() => pipe.transform({ data: null }, {} as any)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if attributes are not provided', () => {
    expect(() => pipe.transform({ data: {} }, {} as any)).toThrow(BadRequestException);
  });

  it('should deserialize attributes correctly', () => {
    const payload = {
      data: {
        attributes: { name: 'Test', count: 10 },
      },
    };
    const result = pipe.transform(payload, {} as any);
    expect(result).toEqual({ name: 'Test', count: 10 });
  });

  it('should deserialize attributes and id correctly', () => {
    const payload = {
      data: {
        id: '123',
        attributes: { name: 'Test' },
      },
    };
    const result = pipe.transform(payload, {} as any);
    expect(result).toEqual({ id: '123', name: 'Test' });
  });

  it('should deserialize relationships (single to-one)', () => {
    const payload = {
      data: {
        attributes: { name: 'Test' },
        relationships: {
          author: { data: { id: '456' } },
        },
      },
    };
    const result = pipe.transform(payload, {} as any);
    expect(result).toEqual({
      name: 'Test',
      author: { id: '456' },
    });
  });

  it('should deserialize relationships (to-many array)', () => {
    const payload = {
      data: {
        attributes: { name: 'Test' },
        relationships: {
          tags: { data: [{ id: '1' }, { id: '2' }] },
        },
      },
    };
    const result = pipe.transform(payload, {} as any);
    expect(result).toEqual({
      name: 'Test',
      tags: [{ id: '1' }, { id: '2' }],
    });
  });

  it('should handle null relationships', () => {
    const payload = {
      data: {
        attributes: { name: 'Test' },
        relationships: {
          author: { data: null },
        },
      },
    };
    const result = pipe.transform(payload, {} as any);
    expect(result).toEqual({
      name: 'Test',
      author: null,
    });
  });

  it('should skip undefined relationship data', () => {
    const payload = {
      data: {
        attributes: { name: 'Test' },
        relationships: {
          author: {}, // missing data
        },
      },
    };
    const result = pipe.transform(payload, {} as any);
    expect(result).toEqual({ name: 'Test' });
  });
});
