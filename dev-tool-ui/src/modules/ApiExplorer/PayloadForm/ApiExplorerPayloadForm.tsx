import { Button } from "@/components/Button";
import { Form } from "@/components/Form";
import type { OpenApiDoc, OperationInfo, SchemaObject } from "@/types/openapi";
import ApiExplorerPayloadBody from "./ApiExplorerPayloadBody";
import ApiExplorerPayloadQueryParam from "./ApiExplorerPayloadQueryParam";
import ApiExplorerPayloadSummary from "./ApiExplorerPayloadSummary";
import ApiExplorerPayloadResponse from "./ApiExplorerPayloadResponse";
import { useApiExplorerPayloadForm } from "../../../hooks/useApiExplorerPayloadForm";

export interface ApiExplorerPayloadFormProps {
  operation: OperationInfo | null;
  doc: OpenApiDoc | null;
}

const ApiExplorerPayloadForm = ({
  operation,
  doc,
}: ApiExplorerPayloadFormProps) => {
  const {
    pathValues,
    setPathValues,
    queryValues,
    setQueryValues,
    bodyValues,
    updateBody,
    response,
    submitting,
    handleSubmit,
    pathParams,
    queryParams,
    schema,
    hasBody,
  } = useApiExplorerPayloadForm({ operation, doc });

  if (!operation || !doc) {
    return (
      <div className="p-4 text-[rgba(255,255,255,0.5)] text-sm">
        Select an operation to see payload
      </div>
    );
  }

  return (
    <Form
      onSubmit={handleSubmit}
      className="p-4 space-y-4 overflow-auto flex flex-col"
    >
      <ApiExplorerPayloadSummary operation={operation} />

      <ApiExplorerPayloadQueryParam
        queryParams={queryParams}
        queryValues={queryValues}
        setQueryValues={setQueryValues}
      />

      {hasBody && schema?.properties && (
        <ApiExplorerPayloadBody
          doc={doc}
          schema={
            schema as unknown as SchemaObject & {
              properties: Record<string, SchemaObject | { $ref: string }>;
            }
          }
          bodyValues={bodyValues}
          updateBody={updateBody}
        />
      )}

      <div className="flex gap-2 flex-shrink-0">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Sending…" : "Submit"}
        </Button>
      </div>

      <ApiExplorerPayloadResponse response={response} />
    </Form>
  );
};

export default ApiExplorerPayloadForm;
