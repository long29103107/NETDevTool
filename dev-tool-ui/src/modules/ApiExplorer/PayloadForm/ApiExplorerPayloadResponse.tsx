export interface ApiExplorerPayloadResponseProps {
  response: { status: number; data: string } | null;
}

const ApiExplorerPayloadResponse = ({
  response,
}: ApiExplorerPayloadResponseProps) => {
  if (!response) return null;

  return (
    <section className="mt-2 flex-1 w-full flex flex-col">
      <h4 className="text-xs font-semibold uppercase text-[rgba(255,255,255,0.5)] mb-1">
        Response {response.status > 0 ? response.status : ""}
      </h4>
      <pre className="flex-1 bg-[#1a1a1a] rounded p-3 text-xs font-mono overflow-auto min-h-[120px] text-[rgba(255,255,255,0.9)]">
        {response.data}
      </pre>
    </section>
  );
};

export default ApiExplorerPayloadResponse;
