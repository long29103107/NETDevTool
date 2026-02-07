import type { OpenApiDoc, OperationInfo, SchemaObject } from "@/types/openapi";

/**
 * Resolve a schema reference ($ref) to the actual schema from the document.
 */
export function resolveSchema(
  s: SchemaObject | { $ref: string } | undefined,
  doc: OpenApiDoc
): SchemaObject | undefined {
  if (!s) return undefined;
  if ("$ref" in s && s.$ref) {
    const name = s.$ref.split("/").pop();
    return name ? (doc.components?.schemas?.[name] as SchemaObject) : undefined;
  }
  return s as SchemaObject;
}

/**
 * Build an example value from an OpenAPI schema (for form defaults).
 */
export function buildExampleFromSchema(
  schema: SchemaObject | undefined,
  doc: OpenApiDoc
): unknown {
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
}

/**
 * Get the display type string from a schema (handles union types like ["string", "null"]).
 */
export function getSchemaType(schema: SchemaObject | undefined): string {
  if (!schema?.type) return "string";
  const t = schema.type;
  return Array.isArray(t) ? t.find((x) => x !== "null") ?? "string" : t;
}

/**
 * Get the resolved request body schema for an operation, if present.
 */
export function getRequestBodySchema(
  operation: OperationInfo,
  doc: OpenApiDoc
): SchemaObject | undefined {
  const jsonSchema =
    operation.requestBody?.content?.["application/json"]?.schema ??
    operation.requestBody?.content?.["application/*"]?.schema;
  if (!jsonSchema) return undefined;
  return resolveSchema(
    jsonSchema as SchemaObject | { $ref: string },
    doc
  );
}

/** Swagger UI-style colors for HTTP methods */
const METHOD_COLORS: Record<string, string> = {
  get: "#61affe",
  post: "#49cc90",
  put: "#fca130",
  delete: "#f93e3e",
  patch: "#50e3c2",
  head: "#9012fe",
  options: "#0d5aa7",
};

/**
 * Get the display color for an HTTP method (for badges, labels, etc.).
 */
export function getMethodColor(method: string): string {
  return METHOD_COLORS[method.toLowerCase()] ?? "#646cff";
}
