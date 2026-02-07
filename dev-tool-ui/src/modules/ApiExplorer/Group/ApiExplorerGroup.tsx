import { Button } from "@/components/Button";

export interface ApiExplorerGroupProps {
  groups: string[];
  selectedGroup: string | null;
  onSelectGroup: (group: string) => void;
}

const ApiExplorerGroup = ({
  groups,
  selectedGroup,
  onSelectGroup,
}: ApiExplorerGroupProps) => {
  return (
    <aside className="w-44 flex-shrink-0 border-r border-[rgba(255,255,255,0.1)] overflow-auto self-stretch">
      <h2 className="font-semibold uppercase text-[rgba(255,255,255,0.7)] px-3 py-2 border-b border-[rgba(255,255,255,0.08)]">
        Groups
      </h2>
      <ul className="py-1">
        {groups.map((tag) => (
          <li key={tag}>
            <Button
              variant="listItem"
              selected={selectedGroup === tag}
              onClick={() => onSelectGroup(tag)}
            >
              {tag}
            </Button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default ApiExplorerGroup;
