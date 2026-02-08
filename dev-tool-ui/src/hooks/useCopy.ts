import { useState, useCallback } from "react";
import { toast } from "sonner";

interface UseCopyOptions {
  timeout?: number;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const useCopy = (options: UseCopyOptions = {}) => {
  const { timeout = 2000, onSuccess, onError } = options;
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard");
        onSuccess?.();

        setTimeout(() => {
          setCopied(false);
        }, timeout);
      } catch (error) {
        toast.error("Failed to copy");
        onError?.(error);
        console.error("Copy failed", error);
      }
    },
    [timeout, onSuccess, onError]
  );

  return { copied, copy };
};
