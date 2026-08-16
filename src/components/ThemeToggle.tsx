"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center opacity-50">
          <span className="w-5 h-5" />
        </div>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative w-12 h-12 rounded-full glass-panel flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:scale-110 active:scale-95 transition-all duration-300 overflow-hidden"
        title="Ganti Tema"
      >
        <div className="relative w-5 h-5 flex items-center justify-center">
          <Sun
            className={`absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100 text-amber-500"
            }`}
          />
          <Moon
            className={`absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isDark ? "opacity-100 rotate-0 scale-100 text-blue-400" : "opacity-0 -rotate-90 scale-50"
            }`}
          />
        </div>
      </button>
    </div>
  );
}
