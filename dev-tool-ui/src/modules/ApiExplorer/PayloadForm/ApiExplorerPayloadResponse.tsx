export interface ApiExplorerPayloadResponseProps {
  response: { status: number; data: string } | null;
}

function getStatusColor(status: number): string {
  if (status <= 0) return "text-[rgba(255,255,255,0.5)]";
  if (status >= 200 && status < 300) return "text-emerald-400";
  if (status >= 300 && status < 400) return "text-sky-400";
  if (status >= 400 && status < 500) return "text-amber-400";
  if (status >= 500) return "text-red-400";
  return "text-[rgba(255,255,255,0.5)]";
}

const DEFAULT_STATUS = 500;

const ApiExplorerPayloadResponse = ({
  response,
}: ApiExplorerPayloadResponseProps) => {
  if (!response) return null;

  const displayStatus = response.status > 0 ? response.status : DEFAULT_STATUS;
  const statusColor = getStatusColor(displayStatus);

  return (
    <section className="mt-2 flex-1 w-full flex flex-col">
      <h4 className="text-xs font-semibold uppercase text-[rgba(255,255,255,0.5)] mb-1 flex items-center gap-2">
        <span>Response</span>
        <span
          className={`font-mono font-bold ${statusColor}`}
          aria-label={`Status ${displayStatus}`}
        >
          {displayStatus}
        </span>
      </h4>
      <pre className="flex-1 bg-[#1a1a1a] rounded p-3 text-xs font-mono overflow-auto min-h-[120px] text-[rgba(255,255,255,0.9)]">
        {response.data}
      </pre>
    </section>
  );
};

export default ApiExplorerPayloadResponse;
