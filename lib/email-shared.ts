/**
 * Framework-agnostic email constants — safe to import from CLI scripts (plain
 * `tsx`, no `server-only` shim). The Worker-only sender lives in `lib/email.ts`.
 */
export const EMAIL_FROM = { email: "noreply@diqualia.com", name: "DiQualia" } as const;

export type OutboundEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};
