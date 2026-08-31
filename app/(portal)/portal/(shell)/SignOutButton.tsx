"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "../_components/Button";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    try {
      await fetch("/api/portal/logout", { method: "POST", credentials: "include" });
    } catch {
      /* ignore — cookies are cleared server-side regardless */
    }
    router.push("/portal/login");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" loading={loading} onClick={signOut}>
      Sign out
    </Button>
  );
}
