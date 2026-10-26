const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /^pwd$/i,
  /token/i,
  /secret/i,
  /authorization/i,
  /cookie/i,
  /credit_?card/i,
  /api_?key/i,
  /refresh/i,
];

const REDACTED = '[REDACTED]';
const MAX_DEPTH = 6;

export function sanitizePayload(
  data: unknown,
  depth = 0,
  visited = new WeakSet<object>(),
): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (depth > MAX_DEPTH) {
    return '[TRUNCATED_DEPTH]';
  }

  if (visited.has(data as object)) {
    return '[CIRCULAR_REF]';
  }
  visited.add(data as object);

  if (Array.isArray(data)) {
    return data.map((item) => sanitizePayload(item, depth + 1, visited));
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
    if (isSensitive) {
      sanitized[key] = REDACTED;
    } else {
      sanitized[key] = sanitizePayload(value, depth + 1, visited);
    }
  }

  return sanitized;
}
