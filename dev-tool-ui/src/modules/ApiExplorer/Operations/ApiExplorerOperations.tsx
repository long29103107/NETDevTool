import { Button } from "@/components/Button";
import type { OperationInfo } from "@/types/openapi";
import { getMethodColor } from "@/utils/openapiSchema";

export interface ApiExplorerOperationsProps {
  operations: OperationInfo[];
  selectedOperation: OperationInfo | null;
  onSelectOperation: (operation: OperationInfo) => void;
}

const ApiExplorerOperations = ({
  operations,
  selectedOperation,
  onSelectOperation,
}: ApiExplorerOperationsProps) => {
  return (
    <aside className="w-72 flex-shrink-0 border-r border-[rgba(255,255,255,0.1)] overflow-auto self-stretch">
      <h2 className="font-semibold uppercase text-[rgba(255,255,255,0.7)] px-3 py-2 border-b border-[rgba(255,255,255,0.08)]">
        Operations
      </h2>
      <ul className="py-1">
        {operations.map((op) => (
          <li key={op.operationId}>
            <Button
              variant="listItem"
              selected={selectedOperation?.operationId === op.operationId}
              onClick={() => onSelectOperation(op)}
              className="truncate"
            >
              <span
                className="inline-flex items-center justify-center font-mono uppercase text-sm min-w-[2.5rem] min-h-[1.25rem] shrink-0 mr-3"
                style={{ color: getMethodColor(op.method) }}
              >
                {op.method}
              </span>
              {op.path}
            </Button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default ApiExplorerOperations;
