export function logError(functionName: string, operation: string, error: unknown, extra?: Record<string, unknown>): void {
  console.error(JSON.stringify({
    level: "error",
    function: functionName,
    operation,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    ...extra,
  }));
}

export function logInfo(functionName: string, operation: string, message: string, extra?: Record<string, unknown>): void {
  console.log(JSON.stringify({
    level: "info",
    function: functionName,
    operation,
    message,
    timestamp: new Date().toISOString(),
    ...extra,
  }));
}
