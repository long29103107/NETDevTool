/** Minimal OpenAPI 3 types for API explorer */

export interface OpenApiDoc {
  openapi?: string;
  paths: Record<string, PathItem>;
  components?: { schemas?: Record<string, SchemaObject> };
  servers?: { url: string }[];
}

export interface PathItem {
  get?: Operation;
  put?: Operation;
  post?: Operation;
  delete?: Operation;
  patch?: Operation;
  parameters?: Parameter[];
}

export interface Operation {
  tags?: string[];
  summary?: string;
  operationId?: string;
  parameters?: Parameter[];
  requestBody?: RequestBody;
}

export interface Parameter {
  name: string;
  in: "query" | "path" | "header" | "cookie";
  required?: boolean;
  schema?: SchemaObject;
  description?: string;
}

export interface RequestBody {
  content?: Record<string, MediaType>;
  required?: boolean;
}

export interface MediaType {
  schema?: SchemaObject | { $ref: string };
}

export type SchemaObject = {
  type?: string;
  format?: string;
  properties?: Record<string, SchemaObject | { $ref: string }>;
  required?: string[];
  items?: SchemaObject | { $ref: string };
  example?: unknown;
  description?: string;
  $ref?: string;
};

export type HttpMethod = "get" | "post" | "put" | "delete" | "patch";

export interface OperationInfo {
  method: HttpMethod;
  path: string;
  summary: string;
  operationId: string;
  parameters: Parameter[];
  requestBody?: RequestBody;
  tag: string;
}

export function groupOperationsByTag(doc: OpenApiDoc): Map<string, OperationInfo[]> {
  const byTag = new Map<string, OperationInfo[]>();
  if (!doc.paths) return byTag;

  for (const [path, pathItem] of Object.entries(doc.paths)) {
    const methods: { method: HttpMethod; op: Operation }[] = [];
    if (pathItem.get) methods.push({ method: "get", op: pathItem.get });
    if (pathItem.post) methods.push({ method: "post", op: pathItem.post });
    if (pathItem.put) methods.push({ method: "put", op: pathItem.put });
    if (pathItem.delete) methods.push({ method: "delete", op: pathItem.delete });
    if (pathItem.patch) methods.push({ method: "patch", op: pathItem.patch });

    const baseParams = pathItem.parameters ?? [];

    for (const { method, op } of methods) {
      const tags = op.tags?.length ? op.tags : ["Default"];
      const params = [...baseParams, ...(op.parameters ?? [])];
      const info: OperationInfo = {
        method,
        path,
        summary: op.summary ?? op.operationId ?? `${method} ${path}`,
        operationId: op.operationId ?? `${method}-${path}`,
        parameters: params,
        requestBody: op.requestBody,
        tag: tags[0],
      };
      for (const tag of tags) {
        const list = byTag.get(tag) ?? [];
        list.push(info);
        byTag.set(tag, list);
      }
    }
  }

  return byTag;
}
