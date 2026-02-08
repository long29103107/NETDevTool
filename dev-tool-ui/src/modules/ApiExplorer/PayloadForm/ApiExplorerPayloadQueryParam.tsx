import { useState } from "react";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import { Select } from "@/components/Select";
import type { OpenApiDoc, SchemaObject } from "@/types/openapi";
import { getSchemaType } from "@/utils/openapiSchema";
import { useForeignKeyOptions } from "@/hooks/useForeignKeyOptions";
import { Tooltip } from "@/components/Tooltip";
import TypeBadge from "./TypeBadge";
import { formatDescription } from "@/utils/tooltip";

export interface QueryParamItem {
  name: string;
  required?: boolean;
  schema?: SchemaObject;
  description?: string;
}

export interface ApiExplorerPayloadQueryParamProps {
  queryParams: QueryParamItem[];
  queryValues: Record<string, string>;
  setQueryValues: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  doc: OpenApiDoc | null;
}

const ApiExplorerPayloadQueryParam = ({
  queryParams,
  queryValues,
  setQueryValues,
  doc,
}: ApiExplorerPayloadQueryParamProps) => {
  if (queryParams.length === 0) return null;

  return (
    <section>
      <div className="space-y-2">
        {queryParams.map((p) => (
          <QueryParamRow
            key={p.name}
            p={p}
            value={queryValues[p.name] ?? ""}
            doc={doc}
            onChange={(val) =>
              setQueryValues((prev) => ({ ...prev, [p.name]: val }))
            }
          />
        ))}
      </div>
    </section>
  );
};

const QueryParamRow = ({
  p,
  value,
  doc,
  onChange,
}: {
  p: QueryParamItem;
  value: string;
  doc: OpenApiDoc | null;
  onChange: (val: string) => void;
}) => {
  const [touched, setTouched] = useState(false);
  const { options, loading } = useForeignKeyOptions(p.schema as SchemaObject, doc);

  const paramType = getSchemaType(p.schema as SchemaObject);
  const isError = p.required && (!value || String(value).trim() === "");
  const showError = touched && isError;

  return (
    <Label className="block">
      <div className="flex justify-between items-center w-full mb-1.5 gap-2">
        <span className="text-[#646cff] font-mono text-sm inline-flex items-center gap-1.5 min-w-0">
          <span className="truncate">{p.name}</span>
          {p.required && <span className="text-red-500 shrink-0">*</span>}
          {p.description && (
            <Tooltip content={formatDescription(p.description)} maxWidth="300px">
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
        <TypeBadge type={paramType} />
      </div>

      {options ? (
        <Select
          value={value}
          options={options}
          disabled={loading}
          error={showError ? "Required" : undefined}
          onChange={(e) => {
            onChange(e.target.value);
            setTouched(true);
          }}
          onBlur={() => setTouched(true)}
          className="mt-1.5 w-full"
        />
      ) : (
        <Input
          type="text"
          value={value}
          error={showError ? "Required" : undefined}
          onChange={(e) => {
            onChange(e.target.value);
            setTouched(true);
          }}
          onBlur={() => setTouched(true)}
          className="mt-1.5 w-full"
        />
      )}
    </Label>
  );
};

export default ApiExplorerPayloadQueryParam;
