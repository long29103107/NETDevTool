export interface ApiExplorerHeaderProps {
  swaggerUrl: string;
  onSwaggerUrlChange: (url: string) => void;
  onLoadFromUrl: (e: React.FormEvent) => Promise<void>;
  onReset: () => void;
  isLoadingUrl: boolean;
  loading: boolean;
}

const ApiExplorerHeader = ({
  swaggerUrl,
  onSwaggerUrlChange,
  onLoadFromUrl,
  onReset,
  isLoadingUrl,
  loading,
}: ApiExplorerHeaderProps) => {
  return (
    <header className="flex-shrink-0 border-b border-[rgba(255,255,255,0.1)] px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">API Explorer</h1>
          <p className="text-xs text-[rgba(255,255,255,0.5)]">
            Groups → Operations → Payload
          </p>
        </div>
        <form
          onSubmit={onLoadFromUrl}
          className="flex items-center gap-2 flex-1 max-w-md"
        >
          <input
            type="url"
            value={swaggerUrl}
            onChange={(e) => onSwaggerUrlChange(e.target.value)}
            placeholder="Enter Swagger JSON URL..."
            className="flex-1 bg-[#1a1a1a] border border-[rgba(255,255,255,0.15)] rounded px-3 py-1.5 text-sm font-mono text-[rgba(255,255,255,0.9)] placeholder:text-[rgba(255,255,255,0.4)]"
            disabled={isLoadingUrl || loading}
          />
          <button
            type="submit"
            disabled={isLoadingUrl || loading || !swaggerUrl.trim()}
            className="px-4 py-1.5 bg-[#646cff] text-white rounded font-medium text-sm hover:bg-[#535bf2] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isLoadingUrl ? "Loading..." : "Load"}
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={isLoadingUrl || loading}
            className="px-4 py-1.5 bg-[rgba(255,255,255,0.1)] text-white rounded font-medium text-sm hover:bg-[rgba(255,255,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Reset
          </button>
        </form>
      </div>
    </header>
  );
};

export default ApiExplorerHeader;
