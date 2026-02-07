import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import type { OpenApiDoc, SchemaObject } from "@/types/openapi";
import { getSchemaType, resolveSchema } from "@/utils/openapiSchema";
import TypeBadge from "./TypeBadge";

export interface ApiExplorerPayloadBodyProps {
  doc: OpenApiDoc;
  schema: SchemaObject & {
    properties: Record<string, SchemaObject | { $ref: string }>;
  };
  bodyValues: Record<string, unknown>;
  updateBody: (key: string, value: unknown) => void;
}

const ApiExplorerPayloadBody = ({
  doc,
  schema,
  bodyValues,
  updateBody,
}: ApiExplorerPayloadBodyProps) => {
  const bodyKeys = Object.keys(schema.properties);

  return (
    <section>
      <h4 className="text-xs font-semibold uppercase text-[rgba(255,255,255,0.5)] mb-2">
        Request body (payload)
      </h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {bodyKeys.map((key) => {
          const prop = resolveSchema(
            schema.properties[key] as SchemaObject | { $ref: string },
            doc
          ) as SchemaObject | undefined;
          const type = getSchemaType(prop);
          const val = bodyValues[key];
          const isRequired = schema.required?.includes(key);
          return (
            <Label key={key} className="block">
              <span className="text-[#646cff] font-mono text-sm mr-2 inline-flex items-center flex-wrap gap-y-1">
                {key}
                {isRequired && <span className="text-red-500 ml-0.5">*</span>}
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
                    type === "integer" || type === "number" ? "number" : "text"
                  }
                  step={type === "number" ? "any" : undefined}
                  value={val === undefined || val === null ? "" : String(val)}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (type === "integer")
                      updateBody(key, v === "" ? undefined : parseInt(v, 10));
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
  );
};

export default ApiExplorerPayloadBody;
