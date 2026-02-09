import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import type { OpenApiDoc, OperationInfo, SchemaObject } from "@/types/openapi";
import { useApiExplorerStore } from "@/stores/apiExplorerStore";
import {
  buildExampleFromSchema,
  getRequestBodySchema,
  resolveSchema,
} from "@/utils/openapiSchema";
import { validateField } from "@/utils/validation";

export interface UseApiExplorerPayloadFormParams {
  operation: OperationInfo | null;
  doc: OpenApiDoc | null;
  /** When true and the request is login and response has a token, apply it to Authorize. */
  applyJwtFromResponse?: boolean;
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
  loadingData: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  loadData: () => Promise<void>;
  canLoadData: boolean;
  pathParams: { name: string; required?: boolean; schema?: SchemaObject }[];
  queryParams: { name: string; required?: boolean; schema?: SchemaObject }[];
  schema: SchemaObject | undefined;
  hasBody: boolean;
  bodyKeys: string[];
  baseUrl: string;
  buildCurl: () => string;
  isPathValid: boolean;
  isQueryValid: boolean;
  isBodyValid: boolean;
}

function buildHeaders(hasBody: boolean, authToken: string | null): HeadersInit | undefined {
  const headers: Record<string, string> = {};
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  if (hasBody) headers["Content-Type"] = "application/json";
  return Object.keys(headers).length > 0 ? headers : undefined;
}

function isLoginOperation(operation: OperationInfo | null): boolean {
  if (!operation) return false;
  return operation.operationId === "Login" || operation.path.toLowerCase().includes("auth/login");
}

export function useApiExplorerPayloadForm({
  operation,
  doc,
  applyJwtFromResponse = false,
}: UseApiExplorerPayloadFormParams): UseApiExplorerPayloadFormReturn {
  const authToken = useApiExplorerStore((s) => s.authToken);
  const setAuthToken = useApiExplorerStore((s) => s.setAuthToken);
  const [pathValues, setPathValues] = useState<Record<string, string>>({});
  const [queryValues, setQueryValues] = useState<Record<string, string>>({});
  const [bodyValues, setBodyValues] = useState<Record<string, unknown>>({});
  const [response, setResponse] = useState<{
    status: number;
    data: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Path params are always required in OpenAPI; normalize so required is true unless explicitly false
  const pathParams = (operation?.parameters.filter((p) => p.in === "path") ?? []).map((p) => ({
    ...p,
    required: p.required !== false,
  }));
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
    const isAuthLogin = operation.operationId === "Login" || operation.path.toLowerCase().includes("auth/login");
    const isAuthRegister = operation.operationId === "Register" || operation.path.toLowerCase().includes("auth/register");
    const authDefaults: Record<string, unknown> = {};
    if (isAuthLogin || isAuthRegister) {
      authDefaults.email = "long@gmail.com";
      authDefaults.password = "123456";
      if (isAuthRegister) authDefaults.name = "Long Nguyen";
    }
    if (hasBodyInit && exampleBody) {
      setBodyValues({ ...exampleBody, ...authDefaults });
    } else if (Object.keys(authDefaults).length > 0) {
      setBodyValues(authDefaults);
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

      let loadingToastId: string | number | undefined;
      try {
        const path = buildPath();
        const query = buildQuery();
        const url = `${baseUrl}${path}${query}`;
        const opts: RequestInit = {
          method: operation.method.toUpperCase(),
          headers: buildHeaders(hasBody, authToken),
          body:
            hasBody && bodyKeys.length > 0
              ? JSON.stringify(bodyValues)
              : undefined,
        };

        loadingToastId = toast.loading(
          `Sending ${operation.method.toUpperCase()} request...`
        );
        const res = await fetch(url, opts);
        const text = await res.text();
        let data = text;
        try {
          data = JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          // Response is not JSON (e.g. empty PUT response); keep raw text
        }

        setResponse({ status: res.status, data });

        if (res.ok) {
          let jwtApplied = false;
          if (applyJwtFromResponse && isLoginOperation(operation)) {
            try {
              const parsed = JSON.parse(text) as { token?: string };
              if (typeof parsed?.token === "string" && parsed.token) {
                setAuthToken(parsed.token);
                jwtApplied = true;
              }
            } catch {
              // ignore parse error
            }
          }
          toast.success(
            jwtApplied
              ? `Request successful. JWT applied to Authorize.`
              : `Request successful (${res.status}) - ${operation.method.toUpperCase()} ${path}`,
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
        toast.error(`Request failed: ${errorMessage}`, {
          id: loadingToastId,
          duration: 3000,
        });
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
      authToken,
      applyJwtFromResponse,
      setAuthToken,
    ]
  );

  const updateBody = useCallback((key: string, value: unknown) => {
    setBodyValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canLoadData =
    !!operation &&
    !!doc &&
    (operation.method === "put" ||
      operation.method === "patch" ||
      operation.method === "post") &&
    pathParams.length > 0 &&
    hasBody;

  const loadData = useCallback(async (): Promise<void> => {
    if (!operation || !doc || !canLoadData) return;
    const path = buildPath();
    if (path.includes("{")) {
      toast.error("Fill path parameters (e.g. id) before loading.");
      return;
    }
    setLoadingData(true);
    setResponse(null);
    let loadingToastId: string | number | undefined;
    try {
      const query = buildQuery();
      const url = `${baseUrl}${path}${query}`;
      loadingToastId = toast.loading("Loading data…");
      const headers = buildHeaders(false, authToken);
      const res = await fetch(url, { method: "GET", headers });
      const text = await res.text();
      if (!res.ok) {
        setResponse({ status: res.status, data: text });
        toast.error(`Load failed (${res.status})`, {
          id: loadingToastId,
          duration: 3000,
        });
        return;
      }
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(text) as Record<string, unknown>;
      } catch {
        toast.error("Response is not JSON", {
          id: loadingToastId,
          duration: 3000,
        });
        return;
      }
      setBodyValues(data);
      setResponse({ status: res.status, data: JSON.stringify(data, null, 2) });
      toast.success("Data loaded into form", {
        id: loadingToastId,
        duration: 2000,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Load failed";
      setResponse({ status: 0, data: errorMessage });
      toast.error(`Load failed: ${errorMessage}`, {
        id: loadingToastId,
        duration: 3000,
      });
    } finally {
      setLoadingData(false);
    }
  }, [operation, doc, canLoadData, baseUrl, buildPath, buildQuery, authToken]);

  const buildCurl = useCallback((): string => {
    if (!operation || !doc) return "";
    const path = buildPath();
    const query = buildQuery();
    const url = `${baseUrl}${path}${query}`;
    const method = operation.method.toUpperCase();
    
    let curl = `curl -X ${method} "${url}"`;
    
    // Headers
    if (authToken) {
      curl += ` \\\n  -H "Authorization: Bearer ${authToken.replace(/"/g, '\\"')}"`;
    }
    if (hasBody) {
        curl += ` \\\n  -H "Content-Type: application/json"`;
    }
    
    // Body
    if (hasBody && bodyKeys.length > 0) {
        const body = JSON.stringify(bodyValues, null, 2);
        // Escape single quotes for shell safety if needed, though simple JSON stringify is usually okay for basics.
        // For better safety we might use single quotes for the body wrapper and escape single quotes inside.
        curl += ` \\\n  -d '${JSON.stringify(bodyValues)}'`;
    }
    
    return curl;
  }, [operation, doc, baseUrl, buildPath, buildQuery, hasBody, bodyKeys, bodyValues, authToken]);

  // Path params are always required in OpenAPI; treat as required if not explicitly false
  const isPathValid = pathParams.every((p) => {
    const required = p.required !== false;
    return !validateField(pathValues[p.name], p.schema as SchemaObject, required);
  });

  const isQueryValid = queryParams.every((p) => {
    return !validateField(queryValues[p.name], p.schema as SchemaObject, p.required);
  });

  const isBodyValid = ((): boolean => {
    if (!hasBody || !schema?.properties) return true;
    const required = schema.required ?? [];
    return Object.keys(schema.properties).every((key) => {
      const propSchemaOrRef = schema.properties![key];
      const propSchema = resolveSchema(propSchemaOrRef, doc || ({} as any)) as SchemaObject;
      return !validateField(bodyValues[key], propSchema, required.includes(key));
    });
  })();

  return {
    pathValues,
    setPathValues,
    queryValues,
    setQueryValues,
    bodyValues,
    updateBody,
    response,
    submitting,
    loadingData,
    handleSubmit,
    loadData,
    canLoadData,
    pathParams,
    queryParams,
    schema,
    hasBody,
    bodyKeys,
    baseUrl,
    buildCurl,
    isPathValid,
    isQueryValid,
    isBodyValid,
  };
}
