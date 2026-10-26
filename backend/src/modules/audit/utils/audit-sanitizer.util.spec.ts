import { sanitizePayload } from '@moduleAudit/utils/audit-sanitizer.util';

describe('audit-sanitizer.util', () => {
  it('should redact sensitive keys like password, token, apiKey, secret', () => {
    const raw = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'superSecretPassword123',
      pwd: 'loginPassword123',
      refreshToken: 'xyz-jwt-token',
      apiKey: 'sk-123456789',
      metadata: {
        authorization: 'Bearer 12345',
        clientSecret: 'secret_value',
        normalField: 'all-good',
      },
    };

    const result = sanitizePayload(raw) as any;

    expect(result.name).toBe('John Doe');
    expect(result.email).toBe('john@example.com');
    expect(result.password).toBe('[REDACTED]');
    expect(result.pwd).toBe('[REDACTED]');
    expect(result.refreshToken).toBe('[REDACTED]');
    expect(result.apiKey).toBe('[REDACTED]');
    expect(result.metadata.authorization).toBe('[REDACTED]');
    expect(result.metadata.clientSecret).toBe('[REDACTED]');
    expect(result.metadata.normalField).toBe('all-good');
  });

  it('should handle primitives and nullish values safely', () => {
    expect(sanitizePayload(null)).toBeNull();
    expect(sanitizePayload(undefined)).toBeUndefined();
    expect(sanitizePayload('hello')).toBe('hello');
    expect(sanitizePayload(42)).toBe(42);
  });

  it('should handle circular references without throwing', () => {
    const circular: any = { name: 'cycle' };
    circular.self = circular;

    const result = sanitizePayload(circular) as any;
    expect(result.name).toBe('cycle');
    expect(result.self).toBe('[CIRCULAR_REF]');
  });
});
