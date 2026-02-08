import React, { useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Tooltip = ({ content, children, maxWidth = "200px" }: TooltipProps) => {
  const [show, setShow] = useState(false);

  if (!content) return <>{children}</>;

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max z-[9999]"
          style={{ maxWidth }}
        >
          <div className="bg-[#2a2a2a] text-xs text-[rgba(255,255,255,0.9)] px-2 py-1.5 rounded-md border border-[rgba(255,255,255,0.15)] shadow-xl break-words whitespace-normal z-50">
            {content}
          </div>
          <div className="w-2 h-2 bg-[#2a2a2a] border-r border-b border-[rgba(255,255,255,0.15)] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
