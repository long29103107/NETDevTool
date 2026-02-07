import type { OperationInfo } from "@/types/openapi";
import { getMethodColor } from "@/utils/openapiSchema";

const ApiExplorerPayloadSummary = ({
  operation,
}: {
  operation: OperationInfo;
}) => {
  return (
    <>
      {operation.summary && (
        <p className="text-lg text-[rgba(255,255,255,0.7)]">
          {operation.summary}
        </p>
      )}

      <div className="flex items-center gap-2">
        <span
          className="font-mono font-semibold uppercase text- mr-2"
          style={{ color: getMethodColor(operation.method) }}
        >
          {operation.method}
        </span>
        <span
          data-slot="badge"
          className="inline-flex py-3 w-full rounded-md border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.06)] px-2 py-0.5 font-medium w-fit whitespace-nowrap text-xs font-mono text-[rgba(255,255,255,0.8)] ml-1.5"
        >
          {operation.path}
        </span>
      </div>
    </>
  );
};

export default ApiExplorerPayloadSummary;
