"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "../_components/Button";
import { PasswordInput } from "../_components/PasswordInput";
import { PasswordStrength } from "../_components/PasswordStrength";

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
      {forced && !error ? (
        <p className="text-sm text-[var(--diq_mid)]">
          You can&apos;t skip this step — pick something only you would know.
        </p>
      ) : null}
      <div>
        <label htmlFor="current" className="mb-1 block text-sm text-[var(--diq_mid)]">
          Current password
        </label>
        <PasswordInput
          id="current"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="new" className="mb-1 block text-sm text-[var(--diq_mid)]">
          New password
        </label>
        <PasswordInput
          id="new"
          autoComplete="new-password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <PasswordStrength value={newPassword} />
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1 block text-sm text-[var(--diq_mid)]">
          Confirm new password
        </label>
        <PasswordInput
          id="confirm"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      {error && (
        <p role="alert" aria-live="polite" className="text-sm text-[var(--status-negative)]">
          {error}
        </p>
      )}
      <Button type="submit" variant="primary" size="md" loading={loading}>
        {loading ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
