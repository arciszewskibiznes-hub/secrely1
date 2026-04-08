import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/useAuth";

export const metadata: Metadata = {
  title: "Secrely — Platforma dla twórców",
  description: "Publikuj ekskluzywne treści i zarabiaj na swojej społeczności. Dołącz do Secrely już dziś.",
  keywords: ["platforma dla twórców", "ekskluzywne treści", "zarabiaj online", "secrely"],
  openGraph: {
    title: "Secrely — Platforma dla twórców",
    description: "Publikuj ekskluzywne treści i zarabiaj na swojej społeczności.",
    type: "website",
    url: "https://secrely.pl",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
