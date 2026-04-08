import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Secrely — Premium Creator Platform",
  description: "Discover and support exclusive creators. Unlock premium content with Secrely credits.",
  keywords: ["creator platform", "exclusive content", "premium creators"],
  openGraph: {
    title: "Secrely",
    description: "Premium creator platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
