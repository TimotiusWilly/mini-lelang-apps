import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Willy Consign | HotWheels Stock",
  description: "Platform lelang dan titip jual barang koleksi.",
  icons: {
    icon: "/logo.jpg",
  },
  verification: {
    google: "wLKWdZ5QETH06GF7_4ZQmRJ3PXaDsEUju1wCJF4rTeM",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="w-full bg-red-600 text-white p-3 text-center text-sm md:text-base font-bold shadow-md z-50 fixed top-0 left-0">
            ⚠️ PEMBERITAHUAN: Website sedang dalam masa perbaikan (maintenance) karena kendala teknis. Mohon maaf atas ketidaknyamanannya.
          </div>
          <div className="pt-12 md:pt-14 flex-1 flex flex-col blur-md pointer-events-none select-none opacity-50 transition-all duration-500">
            {children}
          </div>
          <ThemeToggle />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
