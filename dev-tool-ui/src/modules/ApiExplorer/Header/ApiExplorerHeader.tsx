import { useState, useEffect } from "react";
import { useApiExplorerStore } from "@/stores/apiExplorerStore";
import { Button } from "@/components/Button";

const ApiExplorerHeader = () => {
  const { authToken, setAuthToken } = useApiExplorerStore();
  const [showAuth, setShowAuth] = useState(false);
  const [inputValue, setInputValue] = useState(authToken ?? "");

  useEffect(() => {
    if (showAuth) setInputValue(authToken ?? "");
  }, [showAuth, authToken]);

  const handleApply = () => {
    const trimmed = inputValue.trim();
    setAuthToken(trimmed || null);
    setShowAuth(false);
  };

  const handleClear = () => {
    setInputValue("");
    setAuthToken(null);
    setShowAuth(false);
  };

  return (
    <header className="flex-shrink-0 border-b border-[rgba(255,255,255,0.1)] px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">API Explorer</h1>
          <p className="text-xs text-[rgba(255,255,255,0.5)]">
            Groups → Operations → Payload
          </p>
        </div>

        <div className="flex items-center gap-2">
          {authToken ? (
            <span
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/40"
              title="JWT is sent with every request"
            >
              <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" aria-hidden />
              JWT applied
            </span>
          ) : null}
          <Button
            type="button"
            variant={authToken ? "secondary" : "primary"}
            onClick={() => setShowAuth((s) => !s)}
            className="!h-8 !px-3 text-xs"
          >
            {authToken ? "Change" : "Authorize"}
          </Button>
          {authToken && (
            <Button type="button" variant="ghost" onClick={handleClear} className="!h-8 !px-2 text-xs text-red-400">
              Clear
            </Button>
          )}
        </div>
      </div>

      {showAuth && (
        <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.1)] flex flex-wrap items-center gap-2">
          <label className="text-xs text-[rgba(255,255,255,0.6)] whitespace-nowrap">JWT</label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Paste your JWT token"
            className="flex-1 min-w-[200px] px-3 py-1.5 text-sm font-mono bg-[#1a1a1a] border border-[rgba(255,255,255,0.15)] rounded focus:outline-none focus:border-[#646cff]"
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
          />
          <Button type="button" variant="primary" onClick={handleApply} className="!h-8 !px-3 text-xs">
            Apply
          </Button>
          <Button type="button" variant="ghost" onClick={() => setShowAuth(false)} className="!h-8 !px-2 text-xs">
            Cancel
          </Button>
        </div>
      )}
    </header>
  );
};

export default ApiExplorerHeader;
