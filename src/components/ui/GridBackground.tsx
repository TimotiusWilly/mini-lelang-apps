import { ReactNode } from "react";

export const GridBackground = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen w-full relative">
      {/* Grid Background */}
      <div
        className="fixed inset-0 z-[-1] pointer-events-none bg-slate-50/80"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Soft blue gradient overlay from the edges */}
      <div 
        className="fixed inset-0 z-[-1] pointer-events-none opacity-100"
        style={{
          background: `
            radial-gradient(circle at 0% 0%, rgba(186, 230, 253, 0.5) 0%, transparent 40%),
            radial-gradient(circle at 100% 0%, rgba(186, 230, 253, 0.5) 0%, transparent 40%),
            radial-gradient(circle at 0% 100%, rgba(224, 242, 254, 0.6) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(224, 242, 254, 0.6) 0%, transparent 50%)
          `
        }}
      />
      {children}
    </div>
  );
};
