import { ReactNode } from "react";

export const GridBackground = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen w-full relative">
      {/* Grid Background */}
      <div
        className="fixed inset-0 z-[-1] pointer-events-none bg-slate-50/80 dark:bg-slate-950/80 transition-colors duration-500"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Soft blue gradient overlay from the edges */}
      <div 
        className="fixed inset-0 z-[-1] pointer-events-none opacity-100 transition-colors duration-500"
        style={{
          background: `
            radial-gradient(circle at 0% 0%, var(--glow-top) 0%, transparent 40%),
            radial-gradient(circle at 100% 0%, var(--glow-top) 0%, transparent 40%),
            radial-gradient(circle at 0% 100%, var(--glow-bottom) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, var(--glow-bottom) 0%, transparent 50%)
          `
        }}
      />
      {children}
    </div>
  );
};
