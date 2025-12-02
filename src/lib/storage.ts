import { OpenAPISpec, DEFAULT_SPEC } from '@/types/openapi';

const STORAGE_KEY = 'oas-builder-spec';

export function saveSpec(spec: OpenAPISpec): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(spec));
  }
}

export function loadSpec(): OpenAPISpec {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as OpenAPISpec;
      } catch {
        return DEFAULT_SPEC;
      }
    }
  }
  return DEFAULT_SPEC;
}

export function clearSpec(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
