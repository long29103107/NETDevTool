import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import type { OpenApiDoc, OperationInfo, SchemaObject } from "@/types/openapi";
import {
  buildExampleFromSchema,
  getRequestBodySchema,
} from "@/utils/openapiSchema";

export interface UseApiExplorerPayloadFormParams {
  operation: OperationInfo | null;
  doc: OpenApiDoc | null;
}

export interface UseApiExplorerPayloadFormReturn {
  pathValues: Record<string, string>;
  setPathValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  queryValues: Record<string, string>;
  setQueryValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  bodyValues: Record<string, unknown>;
  updateBody: (key: string, value: unknown) => void;
  response: { status: number; data: string } | null;
  submitting: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  pathParams: { name: string; required?: boolean; schema?: SchemaObject }[];
  queryParams: { name: string; required?: boolean; schema?: SchemaObject }[];
  schema: SchemaObject | undefined;
  hasBody: boolean;
  bodyKeys: string[];
  baseUrl: string;
}

export function useApiExplorerPayloadForm({
  operation,
  doc,
}: UseApiExplorerPayloadFormParams): UseApiExplorerPayloadFormReturn {
  const [pathValues, setPathValues] = useState<Record<string, string>>({});
  const [queryValues, setQueryValues] = useState<Record<string, string>>({});
  const [bodyValues, setBodyValues] = useState<Record<string, unknown>>({});
  const [response, setResponse] = useState<{
    status: number;
    data: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pathParams = operation?.parameters.filter((p) => p.in === "path") ?? [];
  const queryParams =
    operation?.parameters.filter((p) => p.in === "query") ?? [];
  const schema =
    operation && doc ? getRequestBodySchema(operation, doc) : undefined;
  const hasBody =
    !!operation &&
    !!schema?.properties &&
    (operation.method === "post" ||
      operation.method === "put" ||
      operation.method === "patch");
  const bodyKeys = schema?.properties ? Object.keys(schema.properties) : [];
  const baseUrl =
    doc?.servers?.[0]?.url != null
      ? doc.servers[0].url.replace(/\/$/, "")
      : window.location.origin.replace(/\/$/, "");

  useEffect(() => {
    if (!operation || !doc) return;
    const pathParamsInit = operation.parameters.filter((p) => p.in === "path");
    const queryParamsInit = operation.parameters.filter(
      (p) => p.in === "query"
    );
    const schemaInit = getRequestBodySchema(operation, doc);
    const hasBodyInit =
      (operation.method === "post" ||
        operation.method === "put" ||
        operation.method === "patch") &&
      !!schemaInit?.properties;

    const path: Record<string, string> = {};
    pathParamsInit.forEach((p) => {
      path[p.name] = String((p.schema as SchemaObject)?.example ?? "");
    });
    setPathValues(path);
    const q: Record<string, string> = {};
    queryParamsInit.forEach((p) => {
      q[p.name] = "";
    });
    setQueryValues(q);
    const exampleBody = buildExampleFromSchema(schemaInit, doc) as Record<
      string,
      unknown
    >;
    if (hasBodyInit && exampleBody) {
      setBodyValues(exampleBody);
    } else {
      setBodyValues({});
    }
    setResponse(null);
  }, [operation?.operationId, operation?.path, operation, doc]);

  const buildPath = useCallback((): string => {
    if (!operation) return "";
    let p = operation.path;
    pathParams.forEach((param) => {
      p = p.replace(`{${param.name}}`, pathValues[param.name] ?? "");
    });
    return p;
  }, [operation, pathParams, pathValues]);

  const buildQuery = useCallback((): string => {
    const entries = queryParams
      .filter(
        (q) => queryValues[q.name] !== undefined && queryValues[q.name] !== ""
      )
      .map(
        (q) =>
          `${encodeURIComponent(q.name)}=${encodeURIComponent(
            String(queryValues[q.name] ?? "")
          )}`
      );
    return entries.length ? `?${entries.join("&")}` : "";
  }, [queryParams, queryValues]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      if (!operation || !doc) return;
      setSubmitting(true);
      setResponse(null);

      try {
        const path = buildPath();
        const query = buildQuery();
        const url = `${baseUrl}${path}${query}`;
        const opts: RequestInit = {
          method: operation.method.toUpperCase(),
          headers: hasBody ? { "Content-Type": "application/json" } : undefined,
          body:
            hasBody && bodyKeys.length > 0
              ? JSON.stringify(bodyValues)
              : undefined,
        };

        const loadingToastId = toast.loading(
          `Sending ${operation.method.toUpperCase()} request...`
        );
        const res = await fetch(url, opts);
        const text = await res.text();
        let data = text;
        try {
          data = JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          // keep raw text
        }

        setResponse({ status: res.status, data });

        if (res.ok) {
          toast.success(
            `Request successful (${
              res.status
            }) - ${operation.method.toUpperCase()} ${path}`,
            { id: loadingToastId, duration: 3000 }
          );
        } else {
          toast.error(
            `Request failed (${
              res.status
            }) - ${operation.method.toUpperCase()} ${path}`,
            { id: loadingToastId, duration: 5000 }
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Request failed";
        setResponse({ status: 0, data: errorMessage });
        toast.error(`Request failed: ${errorMessage}`, { duration: 3000 });
      } finally {
        setSubmitting(false);
      }
    },
    [
      operation,
      doc,
      baseUrl,
      buildPath,
      buildQuery,
      hasBody,
      bodyKeys.length,
      bodyValues,
    ]
  );

  const updateBody = useCallback((key: string, value: unknown) => {
    setBodyValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  return {
    pathValues,
    setPathValues,
    queryValues,
    setQueryValues,
    bodyValues,
    updateBody,
    response,
    submitting,
    handleSubmit,
    pathParams,
    queryParams,
    schema,
    hasBody,
    bodyKeys,
    baseUrl,
  };
}
