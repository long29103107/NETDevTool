import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { Form } from "@/components/Form";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import type { OpenApiDoc, OperationInfo, SchemaObject } from "@/types/openapi";
import {
  buildExampleFromSchema,
  getMethodColor,
  getRequestBodySchema,
  getSchemaType,
  resolveSchema,
} from "@/utils/openapiSchema";
import TypeBadge from "./TypeBadge";
import ApiExplorerPayloadSummary from "./ApiExplorerPayloadSummary";

export interface ApiExplorerPayloadFormProps {
  operation: OperationInfo | null;
  doc: OpenApiDoc | null;
}

const ApiExplorerPayloadForm = ({
  operation,
  doc,
}: ApiExplorerPayloadFormProps) => {
  const [pathValues, setPathValues] = useState<Record<string, string>>({});
  const [queryValues, setQueryValues] = useState<Record<string, string>>({});
  const [bodyValues, setBodyValues] = useState<Record<string, unknown>>({});
  const [response, setResponse] = useState<{
    status: number;
    data: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!operation || !doc) return;
    const pathParams = operation.parameters.filter((p) => p.in === "path");
    const queryParams = operation.parameters.filter((p) => p.in === "query");
    const schema = getRequestBodySchema(operation, doc);
    const exampleBody = buildExampleFromSchema(schema, doc) as Record<
      string,
      unknown
    >;
    const hasBody =
      (operation.method === "post" ||
        operation.method === "put" ||
        operation.method === "patch") &&
      schema?.properties;

    const path: Record<string, string> = {};
    pathParams.forEach((p) => {
      path[p.name] = String((p.schema as SchemaObject)?.example ?? "");
    });
    setPathValues(path);
    const q: Record<string, string> = {};
    queryParams.forEach((p) => {
      q[p.name] = "";
    });
    setQueryValues(q);
    if (hasBody && exampleBody) {
      setBodyValues(exampleBody);
    } else {
      setBodyValues({});
    }
    setResponse(null);
  }, [operation?.operationId, operation?.path, operation, doc]);

  if (!operation || !doc) {
    return (
      <div className="p-4 text-[rgba(255,255,255,0.5)] text-sm">
        Select an operation to see payload
      </div>
    );
  }

  const pathParams = operation.parameters.filter((p) => p.in === "path");
  const queryParams = operation.parameters.filter((p) => p.in === "query");
  const schema = getRequestBodySchema(operation, doc);

  const hasBody =
    (operation.method === "post" ||
      operation.method === "put" ||
      operation.method === "patch") &&
    schema?.properties;
  const bodyKeys = schema?.properties ? Object.keys(schema.properties) : [];

  const baseUrl = (doc.servers?.[0]?.url ?? window.location.origin).replace(
    /\/$/,
    ""
  );
  const buildPath = (): string => {
    let p = operation.path;
    pathParams.forEach((param) => {
      p = p.replace(`{${param.name}}`, pathValues[param.name] ?? "");
    });
    return p;
  };
  const buildQuery = (): string => {
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
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
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
          {
            id: loadingToastId,
            duration: 3000,
          }
        );
      } else {
        toast.error(
          `Request failed (${
            res.status
          }) - ${operation.method.toUpperCase()} ${path}`,
          {
            id: loadingToastId,
            duration: 5000,
          }
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Request failed";
      setResponse({
        status: 0,
        data: errorMessage,
      });
      toast.error(`Request failed: ${errorMessage}`, {
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateBody = (key: string, value: unknown): void => {
    setBodyValues((prev: Record<string, unknown>) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Form
      onSubmit={handleSubmit}
      className="p-4 space-y-4 overflow-auto flex flex-col"
    >
      <ApiExplorerPayloadSummary operation={operation} />

      {pathParams.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold uppercase text-[rgba(255,255,255,0.5)] mb-2">
            Path parameters
          </h4>
          <div className="space-y-2">
            {pathParams.map((p) => {
              const paramType = getSchemaType(p.schema as SchemaObject);
              return (
                <Label key={p.name} className="block">
                  <span className="text-[#646cff] font-mono text-sm mr-2 inline-flex items-center flex-wrap gap-y-1">
                    {p.name}
                    {p.required !== false && (
                      <span className="text-red-500 ml-0.5">*</span>
                    )}
                    <TypeBadge type={paramType} />
                  </span>
                  <Input
                    type={
                      getSchemaType(p.schema as SchemaObject) === "integer"
                        ? "number"
                        : "text"
                    }
                    value={pathValues[p.name] ?? ""}
                    onChange={(e) =>
                      setPathValues((prev: Record<string, string>) => ({
                        ...prev,
                        [p.name]: e.target.value,
                      }))
                    }
                    className="mt-1.5 w-full"
                  />
                </Label>
              );
            })}
          </div>
        </section>
      )}

      {queryParams.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold uppercase text-[rgba(255,255,255,0.5)] mb-2">
            Query parameters
          </h4>
          <div className="space-y-2">
            {queryParams.map((p) => {
              const paramType = getSchemaType(p.schema as SchemaObject);
              return (
                <Label key={p.name} className="block">
                  <span className="text-[#646cff] font-mono text-sm mr-2 inline-flex items-center flex-wrap gap-y-1">
                    {p.name}
                    {p.required && (
                      <span className="text-red-500 ml-0.5">*</span>
                    )}
                    <TypeBadge type={paramType} />
                  </span>
                  <Input
                    type="text"
                    value={queryValues[p.name] ?? ""}
                    onChange={(e) =>
                      setQueryValues((prev: Record<string, string>) => ({
                        ...prev,
                        [p.name]: e.target.value,
                      }))
                    }
                    className="mt-1.5 w-full"
                  />
                </Label>
              );
            })}
          </div>
        </section>
      )}

      {hasBody && schema?.properties && (
        <section>
          <h4 className="text-xs font-semibold uppercase text-[rgba(255,255,255,0.5)] mb-2">
            Request body (payload)
          </h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {bodyKeys.map((key) => {
              const prop = resolveSchema(
                schema.properties![key] as SchemaObject | { $ref: string },
                doc
              ) as SchemaObject | undefined;
              const type = getSchemaType(prop);
              const val = bodyValues[key];
              const isRequired = schema.required?.includes(key);
              return (
                <Label key={key} className="block">
                  <span className="text-[#646cff] font-mono text-sm mr-2 inline-flex items-center flex-wrap gap-y-1">
                    {key}
                    {isRequired && (
                      <span className="text-red-500 ml-0.5">*</span>
                    )}
                    <TypeBadge type={type} />
                  </span>
                  {type === "boolean" ? (
                    <Input
                      type="checkbox"
                      checked={Boolean(val)}
                      onChange={(e) => updateBody(key, e.target.checked)}
                      className="mt-1.5"
                    />
                  ) : (
                    <Input
                      type={
                        type === "integer" || type === "number"
                          ? "number"
                          : "text"
                      }
                      step={type === "number" ? "any" : undefined}
                      value={
                        val === undefined || val === null ? "" : String(val)
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        if (type === "integer")
                          updateBody(
                            key,
                            v === "" ? undefined : parseInt(v, 10)
                          );
                        else if (type === "number")
                          updateBody(key, v === "" ? undefined : parseFloat(v));
                        else updateBody(key, v === "" ? undefined : v);
                      }}
                      className="mt-1.5 w-full"
                    />
                  )}
                </Label>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex gap-2 flex-shrink-0">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Sending…" : "Submit"}
        </Button>
      </div>

      {response && (
        <section className="mt-2 flex-1 w-full flex flex-col">
          <h4 className="text-xs font-semibold uppercase text-[rgba(255,255,255,0.5)] mb-1">
            Response {response.status > 0 ? response.status : ""}
          </h4>
          <pre className="flex-1 bg-[#1a1a1a] rounded p-3 text-xs font-mono overflow-auto min-h-[120px] text-[rgba(255,255,255,0.9)]">
            {response.data}
          </pre>
        </section>
      )}
    </Form>
  );
};

export default ApiExplorerPayloadForm;
