/** Minimal OpenAPI 3 types for API explorer */

export interface OpenApiDoc {
  openapi?: string;
  paths: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, SchemaObject>;
    parameters?: Record<string, Parameter>;
  };
  servers?: { url: string }[];
}

/** Parameter as it appears in paths (can be inline or $ref) */
export type ParameterOrRef = Parameter | { $ref: string };

export interface PathItem {
  get?: Operation;
  put?: Operation;
  post?: Operation;
  delete?: Operation;
  patch?: Operation;
  parameters?: ParameterOrRef[];
}

export interface Operation {
  tags?: string[];
  summary?: string;
  operationId?: string;
  parameters?: ParameterOrRef[];
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

function resolveParameter(
  item: ParameterOrRef | undefined,
  doc: OpenApiDoc
): Parameter | null {
  if (!item) return null;
  if ("$ref" in item && item.$ref) {
    const name = item.$ref.split("/").pop();
    const resolved = name ? doc.components?.parameters?.[name] : undefined;
    return resolved ?? null;
  }
  return item as Parameter;
}

export function groupOperationsByTag(
  doc: OpenApiDoc
): Map<string, OperationInfo[]> {
  const byTag = new Map<string, OperationInfo[]>();
  if (!doc.paths) return byTag;

  for (const [path, pathItem] of Object.entries(doc.paths)) {
    const methods: { method: HttpMethod; op: Operation }[] = [];
    if (pathItem.get) methods.push({ method: "get", op: pathItem.get });
    if (pathItem.post) methods.push({ method: "post", op: pathItem.post });
    if (pathItem.put) methods.push({ method: "put", op: pathItem.put });
    if (pathItem.delete)
      methods.push({ method: "delete", op: pathItem.delete });
    if (pathItem.patch) methods.push({ method: "patch", op: pathItem.patch });

    const baseParams = (pathItem.parameters ?? [])
      .map((p) => resolveParameter(p, doc))
      .filter((p): p is Parameter => p !== null);

    for (const { method, op } of methods) {
      const tags = op.tags?.length ? op.tags : ["Default"];
      const opParams = (op.parameters ?? [])
        .map((p) => resolveParameter(p, doc))
        .filter((p): p is Parameter => p !== null);
      const opNames = new Set(opParams.map((p) => p.name));
      const params = [
        ...baseParams.filter((p) => !opNames.has(p.name)),
        ...opParams,
      ];
      const info: OperationInfo = {
        method,
        path,
        summary: op.summary ?? op.operationId ?? `${method} ${path}`,
        operationId: op.operationId ?? `${method}-${path}`,
        parameters: params,
        requestBody: op.requestBody,
        tag: tags[0]!,
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
