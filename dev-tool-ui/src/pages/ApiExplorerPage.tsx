import { useCallback, useEffect, useRef } from "react";
import { groupOperationsByTag } from "@/types/openapi";
import { useApiExplorerStore } from "@/stores/apiExplorerStore";
import ApiExplorerHeader from "@/modules/ApiExplorer/Header/ApiExplorerHeader";
import ApiExplorerOperations from "@/modules/ApiExplorer/Operations/ApiExplorerOperations";
import ApiExplorerGroup from "@/modules/ApiExplorer/group/ApiExplorerGroup";
import ApiExplorerPayloadForm from "@/modules/ApiExplorer/PayloadForm/ApiExplorerPayloadForm";
import { Button } from "@/components/Button";

const ApiExplorerPage = () => {
  const {
    doc,
    loading,
    error,
    groups,
    selectedGroup,
    selectedOperation,
    contentHeight,
    swaggerUrl,
    isLoadingUrl,
    initializeDoc,
    replaceWithUrl,
    resetToDefault,
    setSelectedGroup,
    setSelectedOperation,
    setContentHeight,
    setSwaggerUrl,
  } = useApiExplorerStore();

  const contentRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  // Initialize doc on mount
  useEffect(() => {
    initializeDoc();
  }, [initializeDoc]);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragStartY.current = e.clientY;
      dragStartHeight.current = contentRef.current?.offsetHeight ?? 0;
      const onMove = (e2: MouseEvent): void => {
        const dy = e2.clientY - dragStartY.current;
        const newH = Math.max(100, dragStartHeight.current + dy);
        setContentHeight(newH);
      };
      const onUp = (): void => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
    },
    [setContentHeight]
  );

  const handleLoadFromUrl = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!swaggerUrl.trim()) {
      return;
    }

    try {
      await replaceWithUrl(swaggerUrl.trim());
      setSwaggerUrl("");
    } catch (err) {
      console.error(err);
    }
  };

  const operations =
    doc && selectedGroup
      ? groupOperationsByTag(doc).get(selectedGroup) ?? []
      : [];

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-[rgba(255,255,255,0.6)]">Loading API spec...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">Error: {error}</p>
          <Button variant="primary" onClick={resetToDefault}>
            Reset to Default
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#242424]">
      <ApiExplorerHeader />

      <div
        ref={contentRef}
        className={`flex min-h-0 overflow-hidden ${
          contentHeight === null ? "flex-1" : ""
        }`}
        style={contentHeight !== null ? { height: contentHeight } : undefined}
      >
        <ApiExplorerGroup
          groups={groups}
          selectedGroup={selectedGroup}
          onSelectGroup={setSelectedGroup}
        />

        <ApiExplorerOperations
          operations={operations}
          selectedOperation={selectedOperation}
          onSelectOperation={setSelectedOperation}
        />

        <main className="flex-1 min-w-0 border-l border-[rgba(255,255,255,0.08)] bg-[#1e1e1e] flex flex-col self-stretch">
          <h2 className="font-semibold uppercase text-[rgba(255,255,255,0.7)] px-4 py-2 border-b border-[rgba(255,255,255,0.08)]">
            Payload
          </h2>
          <ApiExplorerPayloadForm operation={selectedOperation} doc={doc} />
        </main>
      </div>
      <div
        role="separator"
        aria-orientation="horizontal"
        onMouseDown={handleResizeStart}
        className="flex-shrink-0 h-1.5 bg-[rgba(255,255,255,0.08)] hover:bg-[#646cff] cursor-ns-resize transition-colors"
        title="Drag to resize"
      />
    </div>
  );
};

export default ApiExplorerPage;
