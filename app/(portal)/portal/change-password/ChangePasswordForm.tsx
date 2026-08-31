"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClass =
  "w-full rounded-lg border border-[var(--diq_border)] bg-[var(--card)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)] transition-colors";

export function ChangePasswordForm({ forced }: { forced: boolean }) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword !== confirm) {
      setError("The new passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/portal/change-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) {
        router.push("/portal");
        router.refresh();
      } else {
        setError(data.error ?? "Could not change password");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {forced && (
        <p className="text-sm text-[var(--diq_mid)]">
          Set a new password to continue — the one from your email is temporary.
        </p>
      )}
      <div>
        <label htmlFor="current" className="mb-1 block text-sm text-[var(--diq_mid)]">
          Current password
        </label>
        <input
          id="current"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="new" className="mb-1 block text-sm text-[var(--diq_mid)]">
          New password
        </label>
        <input
          id="new"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1 block text-sm text-[var(--diq_mid)]">
          Confirm new password
        </label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-[var(--gold)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
