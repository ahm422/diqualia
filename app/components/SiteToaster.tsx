"use client";

import { Toaster } from "sonner";

export function SiteToaster() {
  return (
    <Toaster position="bottom-right" theme="system" richColors closeButton duration={5000} />
  );
}
