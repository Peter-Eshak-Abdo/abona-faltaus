"use client";
import { useEffect } from "react";

export default function FixProcess() {
  useEffect(() => {
    if (typeof window !== "undefined" && typeof (globalThis as any).process === "undefined") {
      (globalThis as any).process = { env: {} };
    }
  }, []);

  return null;
}
