import { useState } from "react";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import type { SchemaObject } from "@/types/openapi";
import { getSchemaType } from "@/utils/openapiSchema";
import TypeBadge from "./TypeBadge";

export interface PathParamItem {
  name: string;
  required?: boolean;
  schema?: SchemaObject;
}

export interface ApiExplorerPayloadPathParamProps {
  pathParams: PathParamItem[];
  pathValues: Record<string, string>;
  setPathValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const ApiExplorerPayloadPathParam = ({
  pathParams,
  pathValues,
  setPathValues,
}: ApiExplorerPayloadPathParamProps) => {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  if (pathParams.length === 0) return null;

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  return (
    <section>
      <h4 className="text-xs font-semibold uppercase text-[rgba(255,255,255,0.5)] mb-2">
        Path parameters
      </h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {pathParams.map((p) => {
          const paramType = getSchemaType(p.schema as SchemaObject);
          const value = pathValues[p.name] ?? "";
          const isError = p.required && (!value || String(value).trim() === "");
          const showError = touched[p.name] && isError;

          return (
            <Label key={p.name} className="block">
              <span className="text-[#646cff] font-mono text-sm mr-2 inline-flex items-center flex-wrap gap-y-1">
                {p.name}
                {p.required && <span className="text-red-500 ml-0.5">*</span>}
                <TypeBadge type={paramType} />
              </span>
              <Input
                type={
                  paramType === "integer" || paramType === "number"
                    ? "number"
                    : "text"
                }
                step={paramType === "number" ? "any" : undefined}
                value={value}
                error={showError ? "Required" : undefined}
                onChange={(e) => {
                    setPathValues((prev: Record<string, string>) => ({
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

export default ApiExplorerPayloadPathParam;
