const ApiExplorerHeader = () => {
  return (
    <header className="flex-shrink-0 border-b border-[rgba(255,255,255,0.1)] px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">API Explorer</h1>
          <p className="text-xs text-[rgba(255,255,255,0.5)]">
            Groups → Operations → Payload
          </p>
        </div>
      </div>
    </header>
  );
};

export default ApiExplorerHeader;
