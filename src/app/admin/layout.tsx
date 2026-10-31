import type { Metadata, Viewport } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "../globals.css";

const serif = Playfair_Display({ subsets: ["latin", "latin-ext"], weight: ["600"], variable: "--font-serif-display" });
const sans = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Gemini kalendar",
  manifest: "/admin/manifest.webmanifest",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Gemini kalendar", statusBarStyle: "default" },
  icons: { icon: "/admin/icons/192", apple: "/admin/icons/192" },
};

export const viewport: Viewport = {
  themeColor: "#0f4c5c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="hr" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-dvh bg-sand">{children}</body>
    </html>
  );
}
