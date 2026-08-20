"use client";

import { createContext, useContext } from "react";

import { hasPermission, type AdminSession, type PermissionKey } from "@/lib/auth/session";

const AdminSessionContext = createContext<AdminSession | null>(null);

export function AdminSessionProvider({
  session,
  children,
}: {
  session: AdminSession;
  children: React.ReactNode;
}) {
  return (
    <AdminSessionContext.Provider value={session}>{children}</AdminSessionContext.Provider>
  );
}

export function useAdminSession(): AdminSession {
  const session = useContext(AdminSessionContext);
  if (!session) {
    throw new Error("useAdminSession must be used within AdminSessionProvider");
  }
  return session;
}

export function useCan(key: PermissionKey): boolean {
  return hasPermission(useAdminSession(), key);
}
