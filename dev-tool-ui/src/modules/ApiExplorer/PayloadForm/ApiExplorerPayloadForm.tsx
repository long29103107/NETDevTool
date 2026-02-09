import { useState } from "react";
import { Button } from "@/components/Button";
import { Form } from "@/components/Form";
import type { OpenApiDoc, OperationInfo, SchemaObject } from "@/types/openapi";
import ApiExplorerPayloadBody from "./ApiExplorerPayloadBody";
import ApiExplorerPayloadPathParam from "./ApiExplorerPayloadPathParam";
import ApiExplorerPayloadQueryParam from "./ApiExplorerPayloadQueryParam";
import ApiExplorerPayloadSummary from "./ApiExplorerPayloadSummary";
import ApiExplorerPayloadResponse from "./ApiExplorerPayloadResponse";
import { useApiExplorerPayloadForm } from "../../../hooks/useApiExplorerPayloadForm";
import { useCopy } from "@/hooks/useCopy";

function isLoginOperation(operation: OperationInfo | null): boolean {
  if (!operation) return false;
  return operation.operationId === "Login" || operation.path.toLowerCase().includes("auth/login");
}

export interface ApiExplorerPayloadFormProps {
  operation: OperationInfo | null;
  doc: OpenApiDoc | null;
}

const ApiExplorerPayloadForm = ({
  operation,
  doc,
}: ApiExplorerPayloadFormProps) => {
  const [applyJwtFromResponse, setApplyJwtFromResponse] = useState(true);
  const {
    pathValues,
    setPathValues,
    queryValues,
    setQueryValues,
    bodyValues,
    updateBody,
    response,
    submitting,
    loadingData,
    handleSubmit,
    loadData,
    canLoadData,
    pathParams,
    queryParams,
    schema,
    hasBody,
    buildCurl,
    isPathValid,
    isQueryValid,
    isBodyValid,
  } = useApiExplorerPayloadForm({ operation, doc, applyJwtFromResponse });

  if (!operation || !doc) {
    return (
      <div className="p-4 text-[rgba(255,255,255,0.5)] text-sm">
        Select an operation to see payload
      </div>
    );
  }

  const isValid = isPathValid && isQueryValid && isBodyValid;
  // Load data only needs path + query required fields filled (body is populated by the load)
  const canEnableLoadData = isPathValid && isQueryValid;

  return (
    <Form
      onSubmit={handleSubmit}
      className="p-4 space-y-6 overflow-auto flex flex-col"
    >
      <div className="space-y-2">
        <ApiExplorerPayloadSummary operation={operation} />
      </div>

      {pathParams.length > 0 && (
        <Section label="Path Parameters">
          <ApiExplorerPayloadPathParam
            key={operation.operationId}
            pathParams={pathParams}
            pathValues={pathValues}
            setPathValues={setPathValues}
            doc={doc}
          />
        </Section>
      )}

      {canLoadData && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={submitting || loadingData || !canEnableLoadData}
            onClick={loadData}
          >
            {loadingData ? "Loading…" : "Load data"}
          </Button>
        </div>
      )}

      {queryParams.length > 0 && (
        <Section label="Query Parameters">
          <ApiExplorerPayloadQueryParam
            key={operation.operationId}
            queryParams={queryParams}
            queryValues={queryValues}
            setQueryValues={setQueryValues}
            doc={doc}
          />
        </Section>
      )}

      {hasBody && schema?.properties && (
        <Section label="Request Body">
          <ApiExplorerPayloadBody
            key={operation.operationId}
            doc={doc}
            schema={
              schema as unknown as SchemaObject & {
                properties: Record<string, SchemaObject | { $ref: string }>;
              }
            }
            bodyValues={bodyValues}
            updateBody={updateBody}
          />
        </Section>
      )}

      <div className="pt-4 border-t border-[rgba(255,255,255,0.1)] flex flex-wrap items-center gap-4 flex-shrink-0">
        <div className="flex gap-2">
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || !isValid}
          >
            {submitting ? "Sending…" : "Submit"}
          </Button>
          <CopyCurlButton buildCurl={buildCurl} />
        </div>
        {isLoginOperation(operation) && (
          <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-[rgba(255,255,255,0.8)]">
            <input
              type="checkbox"
              checked={applyJwtFromResponse}
              onChange={(e) => setApplyJwtFromResponse(e.target.checked)}
              className="rounded border-[rgba(255,255,255,0.3)] bg-[#1a1a1a] text-[#646cff] focus:ring-[#646cff]"
            />
            Apply JWT from response
          </label>
        )}
      </div>

      {response && (
        <Section label="Response">
          <ApiExplorerPayloadResponse response={response} />
        </Section>
      )}
    </Form>
  );
};

const Section = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3 p-4 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)]">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
      {label}
    </h3>
    {children}
  </div>
);

const CopyCurlButton = ({ buildCurl }: { buildCurl: () => string }) => {
  const { copied, copy } = useCopy();

  const handleCopy = () => {
    copy(buildCurl());
  };

  return (
    <Button type="button" variant="secondary" onClick={handleCopy}>
      {copied ? "Copied!" : "Copy cURL"}
    </Button>
  );
};

export default ApiExplorerPayloadForm;
