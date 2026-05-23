export function sanitizeForTelemetry(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  const sanitized = { ...data as Record<string, unknown> };
  delete sanitized.name;
  delete sanitized.phone;
  delete sanitized.email;
  delete sanitized.signature;
  delete sanitized.imageUrl;
  return sanitized;
}

export function captureError(error: Error, context?: Record<string, unknown>): void {
  console.error('[Telemetry]', sanitizeForTelemetry(context), error);
}
