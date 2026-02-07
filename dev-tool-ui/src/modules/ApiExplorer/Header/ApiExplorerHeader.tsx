import { Button } from "@/components/Button";
import { Form } from "@/components/Form";
import { Input } from "@/components/Input";

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
        <Form
          onSubmit={onLoadFromUrl}
          className="flex items-center gap-2 flex-1 max-w-md"
        >
          <Input
            type="url"
            value={swaggerUrl}
            onChange={(e) => onSwaggerUrlChange(e.target.value)}
            placeholder="Enter Swagger JSON URL..."
            disabled={isLoadingUrl || loading}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={isLoadingUrl || loading || !swaggerUrl.trim()}
            className="py-1.5 whitespace-nowrap"
          >
            {isLoadingUrl ? "Loading..." : "Load"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onReset}
            disabled={isLoadingUrl || loading}
          >
            Reset
          </Button>
        </Form>
      </div>
    </header>
  );
};

export default ApiExplorerHeader;
