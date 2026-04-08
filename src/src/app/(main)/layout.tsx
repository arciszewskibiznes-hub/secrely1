"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isExplore = pathname === "/explore";
  // Prevent double redirects
  const redirectingRef = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !redirectingRef.current) {
      redirectingRef.current = true;
      router.replace("/");
    }
    if (isAuthenticated) {
      redirectingRef.current = false;
    }
  }, [isAuthenticated, isLoading, router]);

  // Show spinner while session is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[hsl(270,75%,60%)] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-60">
        <Header />
        <main
          className={cn(
            "max-w-2xl mx-auto px-4",
            isExplore ? "py-3 overflow-hidden" : "py-6 page-content"
          )}
        >
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
