const TypeBadge = ({ type }: { type: string }) => {
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <span
      data-slot="badge"
      className="inline-flex items-center justify-center rounded-md border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.06)] px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 text-xs font-mono text-[rgba(255,255,255,0.8)] ml-1.5"
    >
      {label}
    </span>
  );
};

export default TypeBadge;
