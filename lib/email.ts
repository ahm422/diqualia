import "server-only";

/**
 * Single source for the transactional sender + a thin wrapper around the
 * Cloudflare `send_email` binding that guarantees a plain-text alternative and
 * logs the message id so sends are confirmable in `wrangler tail`.
 *
 * Delivery only works once `diqualia.com` is onboarded for Cloudflare Email
 * Sending (SPF/DKIM/DMARC verified) — see docs/DEPLOY-108.md.
 */
import { EMAIL_FROM, type OutboundEmail } from "./email-shared";

export { EMAIL_FROM, type OutboundEmail };

export async function sendEmail(mailer: SendEmail, msg: OutboundEmail): Promise<string> {
  if (!msg.html.trim() || !msg.text.trim()) {
    throw new Error("sendEmail: both html and text parts are required");
  }
  const { messageId } = await mailer.send({
    from: EMAIL_FROM,
    to: msg.to,
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
    ...(msg.replyTo ? { replyTo: msg.replyTo } : {}),
  });
  console.info("[email] sent", { to: msg.to, subject: msg.subject, messageId });
  return messageId;
}
