import { useState } from "react";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import { Select } from "@/components/Select";
import { Tooltip } from "@/components/Tooltip";
import type { OpenApiDoc, SchemaObject } from "@/types/openapi";
import { getSchemaType, resolveSchema } from "@/utils/openapiSchema";
import { useForeignKeyOptions } from "@/hooks/useForeignKeyOptions";
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
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {bodyKeys.map((key) => {
          const prop = resolveSchema(
            schema.properties[key] as SchemaObject | { $ref: string },
            doc
          ) as SchemaObject | undefined;

          return (
            <BodyPropRow
              key={key}
              propKey={key}
              prop={prop}
              doc={doc}
              value={bodyValues[key]}
              isRequired={schema.required?.includes(key)}
              updateBody={updateBody}
            />
          );
        })}
      </div>
    </section>
  );
};


const BodyPropRow = ({
  propKey,
  prop,
  doc,
  value,
  isRequired,
  updateBody,
}: {
  propKey: string;
  prop: SchemaObject | undefined;
  doc: OpenApiDoc;
  value: unknown;
  isRequired?: boolean;
  updateBody: (key: string, value: unknown) => void;
}) => {
  const [touched, setTouched] = useState(false);
  const { options, loading } = useForeignKeyOptions(prop, doc);
  const type = getSchemaType(prop);
  const val = value;

  const handleBlur = () => setTouched(true);

  return (
    <Label className="block">
      <div className="flex justify-between items-center w-full mb-1.5 gap-2">
        <span className="text-[#646cff] font-mono text-sm inline-flex items-center gap-1.5 min-w-0">
          <span className="truncate">{propKey}</span>
          {isRequired && <span className="text-red-500 shrink-0">*</span>}
          {prop?.description && (
            <Tooltip content={prop.description} maxWidth="300px">
              <span className="text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.8)] cursor-help shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </span>
            </Tooltip>
          )}
        </span>
        <TypeBadge type={type} />
      </div>

      {options ? (
        <Select
          value={val === undefined || val === null ? "" : String(val)}
          options={options}
          disabled={loading}
          onChange={(e) => {
            const v = e.target.value;
            if (type === "integer")
              updateBody(propKey, v === "" ? undefined : parseInt(v, 10));
            else if (type === "number")
              updateBody(propKey, v === "" ? undefined : parseFloat(v));
            else updateBody(propKey, v === "" ? undefined : v);
            setTouched(true);
          }}
          onBlur={handleBlur}
          className="mt-1.5 w-full"
        />
      ) : type === "boolean" ? (
        <Input
          type="checkbox"
          checked={Boolean(val)}
          onChange={(e) => {
            updateBody(propKey, e.target.checked);
            setTouched(true);
          }}
          className="mt-1.5"
        />
      ) : (
        <Input
          type={type === "integer" || type === "number" ? "number" : "text"}
          step={type === "number" ? "any" : undefined}
          value={val === undefined || val === null ? "" : String(val)}
          onChange={(e) => {
            const v = e.target.value;
            if (type === "integer")
              updateBody(propKey, v === "" ? undefined : parseInt(v, 10));
            else if (type === "number")
              updateBody(propKey, v === "" ? undefined : parseFloat(v));
            else updateBody(propKey, v === "" ? undefined : v);
          }}
          onBlur={handleBlur}
          className="mt-1.5 w-full"
        />
      )}
    </Label>
  );
};

export default ApiExplorerPayloadBody;
