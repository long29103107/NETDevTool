import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { Form } from "@/components/Form";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import type { OpenApiDoc, OperationInfo, SchemaObject } from "@/types/openapi";
import TypeBadge from "./TypeBadge";

export interface ApiExplorerPayloadFormProps {
  operation: OperationInfo | null;
  doc: OpenApiDoc | null;
}

const resolveSchema = (
  s: SchemaObject | { $ref: string } | undefined,
  doc: OpenApiDoc
): SchemaObject | undefined => {
  if (!s) return undefined;
  if ("$ref" in s && s.$ref) {
    const name = s.$ref.split("/").pop();
    return name ? (doc.components?.schemas?.[name] as SchemaObject) : undefined;
  }
  return s as SchemaObject;
};

const buildExampleFromSchema = (
  schema: SchemaObject | undefined,
  doc: OpenApiDoc
): unknown => {
  schema = resolveSchema(schema as SchemaObject | { $ref: string }, doc);
  if (!schema) return null;
  if (schema.example !== undefined) return schema.example;
  if (schema.$ref) {
    const refSchema = resolveSchema(schema as { $ref: string }, doc);
    return buildExampleFromSchema(refSchema, doc);
  }
  if (schema.type === "object" && schema.properties) {
    const obj: Record<string, unknown> = {};
    const required = new Set(schema.required ?? []);
    for (const [key, prop] of Object.entries(schema.properties)) {
      const sub = resolveSchema(prop as SchemaObject | { $ref: string }, doc);
      const val = buildExampleFromSchema(sub, doc);
      if (required.has(key) || val !== undefined) obj[key] = val;
    }
    return obj;
  }
  if (schema.type === "array") {
    const item = resolveSchema(
      schema.items as SchemaObject | { $ref: string },
      doc
    );
    return item ? [buildExampleFromSchema(item, doc)] : [];
  }
  if (schema.type === "string") return "";
  if (schema.type === "integer" || schema.type === "number") return 0;
  if (schema.type === "boolean") return false;
  return null;
};

const getSchemaType = (schema: SchemaObject | undefined): string => {
  if (!schema?.type) return "string";
  const t = schema.type;
  return Array.isArray(t) ? t.find((x) => x !== "null") ?? "string" : t;
};

const getMethodColor = (method: string): string => {
  const m = method.toLowerCase();
  const colors: Record<string, string> = {
    get: "#61affe",
    post: "#49cc90",
    put: "#fca130",
    delete: "#f93e3e",
    patch: "#50e3c2",
    head: "#9012fe",
    options: "#0d5aa7",
  };
  return colors[m] ?? "#646cff";
};

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
    const jsonSchema =
      operation.requestBody?.content?.["application/json"]?.schema ??
      operation.requestBody?.content?.["application/*"]?.schema;
    const schema =
      jsonSchema && "$ref" in jsonSchema && jsonSchema.$ref
        ? (doc.components?.schemas?.[
            jsonSchema.$ref.split("/").pop() ?? ""
          ] as SchemaObject)
        : (jsonSchema as SchemaObject | undefined);
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
  const jsonSchema =
    operation.requestBody?.content?.["application/json"]?.schema ??
    operation.requestBody?.content?.["application/*"]?.schema;
  const schema =
    jsonSchema && "$ref" in jsonSchema && jsonSchema.$ref
      ? (doc.components?.schemas?.[
          jsonSchema.$ref.split("/").pop() ?? ""
        ] as SchemaObject)
      : (jsonSchema as SchemaObject | undefined);

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
      {operation.summary && (
        <p className="text-lg text-[rgba(255,255,255,0.7)]">
          {operation.summary}
        </p>
      )}

      <div className="flex items-center gap-2">
        <span
          className="font-mono font-semibold uppercase text-sm mr-2"
          style={{ color: getMethodColor(operation.method) }}
        >
          {operation.method}
        </span>
        <span
          data-slot="badge"
          className="inline-flex py-3 w-full rounded-md border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.06)] px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 text-xs font-mono text-[rgba(255,255,255,0.8)] ml-1.5"
        >
          {operation.path}
        </span>
      </div>

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
