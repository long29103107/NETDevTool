import type { OperationInfo } from "@/types/openapi";
import { getMethodColor } from "@/utils/openapiSchema";
import { type MouseEvent } from "react";
import { Button } from "@/components/Button/Button";
import { useCopy } from "@/hooks/useCopy";

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
        <PathWithCopy path={operation.path} />
      </div>
    </>
  );
};

const PathWithCopy = ({ path }: { path: string }) => {
  const { copied, copy } = useCopy();

  const handleCopy = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    copy(path);
  };

  return (
    <span
      data-slot="badge"
      className="inline-flex items-center gap-2 rounded-md border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.06)] px-2 py-0.5 font-medium w-fit whitespace-nowrap text-xs font-mono text-[rgba(255,255,255,0.8)] ml-1.5"
    >
      {path}
      <Button
        variant="ghost"
        onClick={handleCopy}
        className="!p-0 !h-auto !bg-transparent text-[rgba(255,255,255,0.5)] hover:!text-white hover:!bg-transparent focus:outline-none"
        title="Copy path"
      >
        {copied ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        )}
      </Button>
    </span>
  );
};

export default ApiExplorerPayloadSummary;
