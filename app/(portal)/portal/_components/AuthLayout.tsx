import type { ReactNode } from "react";

/** Two-panel auth shell: a brand aside (desktop) / compact header (mobile) and
 *  the form panel. Used by login and change-password for visual consistency. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[minmax(0,1fr)_420px]">
      <aside className="hidden flex-col justify-between border-r border-[var(--diq_border)] bg-[var(--diq_deep)] p-10 md:flex">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--gold)]">DiQualia</p>
        <div>
          <p
            className="text-3xl font-medium text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-display), ui-serif, serif" }}
          >
            Applicant portal
          </p>
          <p className="mt-3 max-w-xs text-sm text-[var(--diq_mid)]">
            Track every role you&apos;ve applied for, review what you submitted, and keep your
            documents in one place.
          </p>
        </div>
        <p className="text-xs text-[var(--diq_mid)]">Secure access for DiQualia applicants.</p>
      </aside>

      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 md:hidden">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--gold)]">DiQualia</p>
          </div>
          <h1 className="text-2xl font-medium text-[var(--foreground)]">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-[var(--diq_mid)]">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
          {footer ? <div className="mt-6">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
