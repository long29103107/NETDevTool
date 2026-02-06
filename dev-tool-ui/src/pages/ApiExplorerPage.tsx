import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  type OpenApiDoc,
  type OperationInfo,
  type SchemaObject,
  groupOperationsByTag,
} from "../types/openapi";
import { useApiExplorerStore } from "../stores/apiExplorerStore";

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

/** Swagger UI method colors */
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

const TypeBadge = ({ type }: { type: string }) => {
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <span
      data-slot="badge"
      className="inline-flex items-center justify-center rounded-md border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.06)] px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 text-xs font-mono text-[rgba(255,255,255,0.8)] ml-1.5"
    >
      {label}
    </span>
  );
};

const PayloadForm = ({
  operation,
  doc,
}: {
  operation: OperationInfo | null;
  doc: OpenApiDoc | null;
}) => {
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
  const exampleBody = buildExampleFromSchema(schema, doc) as Record<
    string,
    unknown
  >;

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

      const loadingToast = toast.loading(
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
        toast.success(`Request successful (${res.status})`, {
          id: loadingToast,
          description: `${operation.method.toUpperCase()} ${path}`,
        });
      } else {
        toast.error(`Request failed (${res.status})`, {
          id: loadingToast,
          description: `${operation.method.toUpperCase()} ${path}`,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Request failed";
      setResponse({
        status: 0,
        data: errorMessage,
      });
      toast.error("Request failed", {
        description: errorMessage,
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
    <form
      onSubmit={handleSubmit}
      className="p-4 space-y-4 overflow-auto flex flex-col"
    >
      <div>
        <span
          className="font-mono font-semibold uppercase text-xs mr-2"
          style={{ color: getMethodColor(operation.method) }}
        >
          {operation.method}
        </span>
        <span className="font-mono text-sm break-all">{operation.path}</span>
      </div>
      {operation.summary && (
        <p className="text-sm text-[rgba(255,255,255,0.7)]">
          {operation.summary}
        </p>
      )}

      {pathParams.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold uppercase text-[rgba(255,255,255,0.5)] mb-2">
            Path parameters
          </h4>
          <div className="space-y-2">
            {pathParams.map((p) => {
              const paramType = getSchemaType(p.schema as SchemaObject);
              return (
                <label key={p.name} className="block">
                  <span className="text-[#646cff] font-mono text-sm mr-2 inline-flex items-center flex-wrap gap-y-1">
                    {p.name}
                    {p.required !== false && (
                      <span className="text-red-500 ml-0.5">*</span>
                    )}
                    <TypeBadge type={paramType} />
                  </span>
                  <input
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
                    className="w-full mt-1.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.15)] rounded px-2 py-1.5 text-sm font-mono"
                  />
                </label>
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
                <label key={p.name} className="block">
                  <span className="text-[#646cff] font-mono text-sm mr-2 inline-flex items-center flex-wrap gap-y-1">
                    {p.name}
                    {p.required && (
                      <span className="text-red-500 ml-0.5">*</span>
                    )}
                    <TypeBadge type={paramType} />
                  </span>
                  <input
                    type="text"
                    value={queryValues[p.name] ?? ""}
                    onChange={(e) =>
                      setQueryValues((prev: Record<string, string>) => ({
                        ...prev,
                        [p.name]: e.target.value,
                      }))
                    }
                    className="w-full mt-1.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.15)] rounded px-2 py-1.5 text-sm font-mono"
                  />
                </label>
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
                <label key={key} className="block">
                  <span className="text-[#646cff] font-mono text-sm mr-2 inline-flex items-center flex-wrap gap-y-1">
                    {key}
                    {isRequired && (
                      <span className="text-red-500 ml-0.5">*</span>
                    )}
                    <TypeBadge type={type} />
                  </span>
                  {type === "boolean" ? (
                    <input
                      type="checkbox"
                      checked={Boolean(val)}
                      onChange={(e) => updateBody(key, e.target.checked)}
                      className="mt-1.5 rounded bg-[#1a1a1a] border border-[rgba(255,255,255,0.15)]"
                    />
                  ) : (
                    <input
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
                      className="w-full mt-1.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.15)] rounded px-2 py-1.5 text-sm font-mono"
                    />
                  )}
                </label>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex gap-2 flex-shrink-0">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-[#646cff] text-white rounded font-medium text-sm hover:bg-[#535bf2] disabled:opacity-50"
        >
          {submitting ? "Sending…" : "Submit"}
        </button>
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
    </form>
  );
};

const ApiExplorerPage = () => {
  const {
    doc,
    loading,
    error,
    groups,
    selectedGroup,
    selectedOperation,
    contentHeight,
    swaggerUrl,
    isLoadingUrl,
    initializeDoc,
    replaceWithUrl,
    resetToDefault,
    setSelectedGroup,
    setSelectedOperation,
    setContentHeight,
    setSwaggerUrl,
  } = useApiExplorerStore();

  const contentRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  // Initialize doc on mount
  useEffect(() => {
    initializeDoc();
  }, [initializeDoc]);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragStartY.current = e.clientY;
      dragStartHeight.current = contentRef.current?.offsetHeight ?? 0;
      const onMove = (e2: MouseEvent): void => {
        const dy = e2.clientY - dragStartY.current;
        const newH = Math.max(100, dragStartHeight.current + dy);
        setContentHeight(newH);
      };
      const onUp = (): void => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
    },
    [setContentHeight]
  );

  const handleLoadFromUrl = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!swaggerUrl.trim()) {
      return;
    }

    try {
      await replaceWithUrl(swaggerUrl.trim());
      setSwaggerUrl("");
    } catch (err) {
      console.error(err);
    }
  };

  const operations =
    doc && selectedGroup
      ? groupOperationsByTag(doc).get(selectedGroup) ?? []
      : [];

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-[rgba(255,255,255,0.6)]">Loading API spec...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">Error: {error}</p>
          <button
            onClick={resetToDefault}
            className="px-4 py-2 bg-[#646cff] text-white rounded font-medium text-sm hover:bg-[#535bf2]"
          >
            Reset to Default
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#242424]">
      <header className="flex-shrink-0 border-b border-[rgba(255,255,255,0.1)] px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">API Explorer</h1>
            <p className="text-xs text-[rgba(255,255,255,0.5)]">
              Groups → Operations → Payload
            </p>
          </div>
          <form
            onSubmit={handleLoadFromUrl}
            className="flex items-center gap-2 flex-1 max-w-md"
          >
            <input
              type="url"
              value={swaggerUrl}
              onChange={(e) => setSwaggerUrl(e.target.value)}
              placeholder="Enter Swagger JSON URL..."
              className="flex-1 bg-[#1a1a1a] border border-[rgba(255,255,255,0.15)] rounded px-3 py-1.5 text-sm font-mono text-[rgba(255,255,255,0.9)] placeholder:text-[rgba(255,255,255,0.4)]"
              disabled={isLoadingUrl || loading}
            />
            <button
              type="submit"
              disabled={isLoadingUrl || loading || !swaggerUrl.trim()}
              className="px-4 py-1.5 bg-[#646cff] text-white rounded font-medium text-sm hover:bg-[#535bf2] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoadingUrl ? "Loading..." : "Load"}
            </button>
            <button
              type="button"
              onClick={resetToDefault}
              disabled={isLoadingUrl || loading}
              className="px-4 py-1.5 bg-[rgba(255,255,255,0.1)] text-white rounded font-medium text-sm hover:bg-[rgba(255,255,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Reset
            </button>
          </form>
        </div>
      </header>

      <div
        ref={contentRef}
        className={`flex min-h-0 overflow-hidden ${
          contentHeight === null ? "flex-1" : ""
        }`}
        style={contentHeight !== null ? { height: contentHeight } : undefined}
      >
        <aside className="w-44 flex-shrink-0 border-r border-[rgba(255,255,255,0.1)] overflow-auto self-stretch">
          <h2 className="font-semibold uppercase text-[rgba(255,255,255,0.7)] px-3 py-2 border-b border-[rgba(255,255,255,0.08)]">
            Groups
          </h2>
          <ul className="py-1">
            {groups.map((tag) => (
              <li key={tag}>
                <button
                  type="button"
                  onClick={() => setSelectedGroup(tag)}
                  className={`w-full text-left px-3 py-2 text-sm block hover:bg-[rgba(255,255,255,0.06)] ${
                    selectedGroup === tag
                      ? "bg-[rgba(100,108,255,0.2)] text-[#646cff]"
                      : ""
                  }`}
                >
                  {tag}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <aside className="w-72 flex-shrink-0 border-r border-[rgba(255,255,255,0.1)] overflow-auto self-stretch">
          <h2 className="font-semibold uppercase text-[rgba(255,255,255,0.7)] px-3 py-2 border-b border-[rgba(255,255,255,0.08)]">
            Operations
          </h2>
          <ul className="py-1">
            {operations.map((op) => (
              <li key={op.operationId}>
                <button
                  type="button"
                  onClick={() => setSelectedOperation(op)}
                  className={`w-full text-left px-3 py-2 text-sm block hover:bg-[rgba(255,255,255,0.06)] truncate ${
                    selectedOperation?.operationId === op.operationId
                      ? "bg-[rgba(100,108,255,0.2)] text-[#646cff]"
                      : ""
                  }`}
                >
                  <span
                    className="inline-flex items-center justify-center font-mono uppercase text-xs min-w-[2.5rem] min-h-[1.25rem] shrink-0 mr-3"
                    style={{ color: getMethodColor(op.method) }}
                  >
                    {op.method}
                  </span>
                  {op.path}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1 min-w-0 border-l border-[rgba(255,255,255,0.08)] bg-[#1e1e1e] flex flex-col self-stretch">
          <h2 className="font-semibold uppercase text-[rgba(255,255,255,0.7)] px-4 py-2 border-b border-[rgba(255,255,255,0.08)]">
            Payload
          </h2>
          <PayloadForm operation={selectedOperation} doc={doc} />
        </main>
      </div>
      <div
        role="separator"
        aria-orientation="horizontal"
        onMouseDown={handleResizeStart}
        className="flex-shrink-0 h-1.5 bg-[rgba(255,255,255,0.08)] hover:bg-[#646cff] cursor-ns-resize transition-colors"
        title="Drag to resize"
      />
    </div>
  );
};

export default ApiExplorerPage;
