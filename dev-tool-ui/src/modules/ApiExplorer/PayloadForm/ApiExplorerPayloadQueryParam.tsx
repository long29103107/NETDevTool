import { useState } from "react";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import type { SchemaObject } from "@/types/openapi";
import { getSchemaType } from "@/utils/openapiSchema";
import TypeBadge from "./TypeBadge";

export interface QueryParamItem {
  name: string;
  required?: boolean;
  schema?: SchemaObject;
}

export interface ApiExplorerPayloadQueryParamProps {
  queryParams: QueryParamItem[];
  queryValues: Record<string, string>;
  setQueryValues: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
}

const ApiExplorerPayloadQueryParam = ({
  queryParams,
  queryValues,
  setQueryValues,
}: ApiExplorerPayloadQueryParamProps) => {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  if (queryParams.length === 0) return null;

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  return (
    <section>
      <div className="space-y-2">
        {queryParams.map((p) => {
          const paramType = getSchemaType(p.schema as SchemaObject);
          const value = queryValues[p.name] ?? "";
          const isError = p.required && (!value || String(value).trim() === "");
          const showError = touched[p.name] && isError;

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
                value={value}
                error={showError ? "Required" : undefined}
                onChange={(e) => {
                  setQueryValues((prev: Record<string, string>) => ({
                    ...prev,
                    [p.name]: e.target.value,
                  }));
                  if (!touched[p.name]) {
                    setTouched((prev) => ({ ...prev, [p.name]: true }));
                  }
                }}
                onBlur={() => handleBlur(p.name)}
                className="mt-1.5 w-full"
              />
            </Label>
          );
        })}
      </div>
    </section>
  );
};

export default ApiExplorerPayloadQueryParam;
