import type { OperationInfo } from "@/types/openapi";

export interface ApiExplorerOperationsProps {
  operations: OperationInfo[];
  selectedOperation: OperationInfo | null;
  onSelectOperation: (operation: OperationInfo) => void;
}

const getMethodColor = (method: string): string => {
  const m = method.toLowerCase();
  const colors: Record<string, string> = {
    get: "#61affe",
    post: "#49cc90",
    put: "#fca130",
    delete: "#f93e3e",
    patch: "#50e3c2",
    head: "#9012fe",
    options: "#0d5aa7",
  };
  return colors[m] ?? "#646cff";
};

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
            <button
              type="button"
              onClick={() => onSelectOperation(op)}
              className={`w-full text-left px-3 py-2 text-sm block hover:bg-[rgba(255,255,255,0.06)] truncate ${
                selectedOperation?.operationId === op.operationId
                  ? "bg-[rgba(100,108,255,0.2)] text-[#646cff]"
                  : ""
              }`}
            >
              <span
                className="inline-flex items-center justify-center font-mono uppercase text-xs min-w-[2.5rem] min-h-[1.25rem] shrink-0 mr-3"
                style={{ color: getMethodColor(op.method) }}
              >
                {op.method}
              </span>
              {op.path}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default ApiExplorerOperations;
