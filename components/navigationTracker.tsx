"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { pushRoute } from "@/hooks/useNavHistory";

export default function NavigationTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // pathname is always a string in App Router
    pushRoute(pathname);
  }, [pathname]);

  // Renders nothing — pure side-effect component
  return null;
}
