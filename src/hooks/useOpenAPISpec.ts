'use client';

import { useState, useEffect, useCallback } from 'react';
import { OpenAPISpec, DEFAULT_SPEC } from '@/types/openapi';
import { saveSpec, loadSpec, clearSpec } from '@/lib/storage';

export function useOpenAPISpec() {
  const [spec, setSpec] = useState<OpenAPISpec>(DEFAULT_SPEC);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadSpec();
    setSpec(loaded);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveSpec(spec);
    }
  }, [spec, isLoaded]);

  const updateSpec = useCallback((updates: Partial<OpenAPISpec>) => {
    setSpec((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetSpec = useCallback(() => {
    clearSpec();
    setSpec(DEFAULT_SPEC);
  }, []);

  return { spec, updateSpec, resetSpec, isLoaded };
}
