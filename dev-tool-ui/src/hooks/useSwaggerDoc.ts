import { useState, useEffect, useCallback } from "react";
import { type OpenApiDoc } from "../types/openapi";

interface UseSwaggerDocReturn {
  doc: OpenApiDoc | null;
  loading: boolean;
  error: string | null;
  replaceWithUrl: (url: string) => Promise<void>;
  resetToDefault: () => void;
}

/**
 * Custom hook to fetch Swagger documentation from the current origin
 * and allows replacing it with another public swagger JSON URL
 */
export function useSwaggerDoc(): UseSwaggerDocReturn {
  const [doc, setDoc] = useState<OpenApiDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUrl = () => `${window.location.origin}/openapi/v1.json`;

  const fetchDoc = useCallback(async (url: string) => {
    console.log("fetchDoc ~ url:", url);
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
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial swagger doc from API
  useEffect(() => {
    fetchDoc(getUrl());
  }, [fetchDoc]);

  /**
   * Replace the current swagger doc with one fetched from a public URL
   */
  const replaceWithUrl = useCallback(async (url: string) => {
    await fetchDoc(url);
  }, [fetchDoc]);

  /**
   * Reset to the default API swagger doc
   */
  const resetToDefault = useCallback(() => {
    fetchDoc(getUrl());
  }, [fetchDoc]);

  return {
    doc,
    loading,
    error,
    replaceWithUrl,
    resetToDefault,
  };
}
