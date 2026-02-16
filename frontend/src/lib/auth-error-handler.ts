/**
 * Central handler for auth errors (401/UNAUTHENTICATED).
 * AuthProvider registers its logout callback here so that GraphQL/API
 * layers can trigger logout without a direct dependency on auth context.
 */
let onUnauthorized: (() => void) | null = null;

export function registerOnUnauthorized(fn: (() => void) | null) {
  onUnauthorized = fn;
}

export function triggerUnauthorized() {
  onUnauthorized?.();
}

export function isUnauthenticatedError(err: unknown): boolean {
  const errors = (err as { response?: { errors?: Array<{ extensions?: { code?: string } }> } })
    ?.response?.errors;
  return !!errors?.some((e) => e.extensions?.code === 'UNAUTHENTICATED');
}
