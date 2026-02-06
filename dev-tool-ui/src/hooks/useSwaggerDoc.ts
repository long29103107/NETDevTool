import { useState, useEffect, useCallback } from "react";
import { type OpenApiDoc } from "../types/openapi";
import swaggerFromSrc from "../swagger.json";

const swaggerDoc = swaggerFromSrc as unknown as OpenApiDoc;

interface UseSwaggerDocReturn {
  doc: OpenApiDoc | null;
  loading: boolean;
  error: string | null;
  replaceWithUrl: (url: string) => Promise<void>;
  resetToDefault: () => void;
}

/**
 * Custom hook to fetch Swagger documentation from local swaggerDoc
 * and allows replacing it with another public swagger JSON URL
 */
export function useSwaggerDoc(): UseSwaggerDocReturn {
  const [doc, setDoc] = useState<OpenApiDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial swagger doc from local file
  useEffect(() => {
    try {
      setDoc(swaggerDoc);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load swagger doc"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Replace the current swagger doc with one fetched from a public URL
   */
  const replaceWithUrl = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch swagger doc: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Validate that it's a valid OpenAPI doc structure
      if (!data || typeof data !== "object" || !data.paths) {
        throw new Error(
          "Invalid swagger JSON format: missing 'paths' property"
        );
      }

      setDoc(data as OpenApiDoc);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch swagger doc";
      setError(errorMessage);
      // Keep the current doc on error, don't clear it
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset to the default local swagger doc
   */
  const resetToDefault = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      setDoc(swaggerDoc);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reset swagger doc"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    doc,
    loading,
    error,
    replaceWithUrl,
    resetToDefault,
  };
}
