import React, { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Tooltip = ({ content, children, maxWidth = "200px" }: TooltipProps) => {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2 + window.scrollX,
      });
    }
  }, [show]);

  if (!content) return <>{children}</>;

  return (
    <div 
      ref={triggerRef}
      className="inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && createPortal(
        <div 
          className="fixed pointer-events-none z-[9999] mb-2"
          style={{ 
            top: coords.top, 
            left: coords.left,
            transform: 'translate(-50%, calc(-100% - 8px))',
            maxWidth 
          }}
        >
          <div className="bg-[#2a2a2a] text-xs text-[rgba(255,255,255,0.9)] px-2 py-1.5 rounded-md border border-[rgba(255,255,255,0.15)] shadow-xl break-words whitespace-pre-line z-50">
            {content}
          </div>
          <div className="w-2 h-2 bg-[#2a2a2a] border-r border-b border-[rgba(255,255,255,0.15)] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Tooltip;
