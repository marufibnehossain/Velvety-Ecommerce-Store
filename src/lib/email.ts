import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export async function sendVerificationEmail(
  to: string,
  verificationUrl: string
): Promise<{ ok: boolean; sent: boolean; error?: string }> {
  if (!resend) {
    console.log("[Auth] No RESEND_API_KEY – verification link (open in browser):", verificationUrl);
    return { ok: true, sent: false };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: "Verify your Velvety account",
      html: `
        <p>Thanks for signing up. Please verify your email by clicking the link below:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link expires in 24 hours. If you didn’t create an account, you can ignore this email.</p>
        <p>— Velvety</p>
      `,
    });
    if (error) {
      console.error("[Auth] Resend error:", error);
      return { ok: false, sent: false, error: error.message };
    }
    return { ok: true, sent: true };
  } catch (e) {
    console.error("[Auth] Resend exception:", e);
    const message = e instanceof Error ? e.message : "Failed to send email";
    return { ok: false, sent: false, error: message };
  }
}

export interface OrderConfirmationItem {
  name: string;
  quantity: number;
  price: number;
}

export async function sendOrderConfirmationEmail(
  to: string,
  options: {
    name?: string;
    items: OrderConfirmationItem[];
    subtotal: number;
    discount?: number;
    coupon?: string;
    shipping: number;
    total: number;
  }
): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    console.log("[Order] No RESEND_API_KEY – order confirmation skipped for:", to);
    return { ok: true };
  }
  const { name, items, subtotal, discount = 0, coupon, shipping, total } = options;
  const itemsRows = items
    .map(
      (i) =>
        `<tr><td>${i.name}</td><td>${i.quantity}</td><td>$${(i.price * i.quantity).toFixed(2)}</td></tr>`
    )
    .join("");
  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: "Your Velvety order confirmation",
      html: `
        <p>Hi${name ? ` ${name}` : ""},</p>
        <p>Thanks for your order. Here’s a summary:</p>
        <table style="width:100%; border-collapse: collapse; margin: 1rem 0;">
          <thead><tr style="border-bottom: 1px solid #ddd;"><th style="text-align:left;">Item</th><th>Qty</th><th style="text-align:right;">Total</th></tr></thead>
          <tbody>${itemsRows}</tbody>
        </table>
        <p>Subtotal: $${subtotal.toFixed(2)}</p>
        ${discount > 0 ? `<p>Discount${coupon ? ` (${coupon})` : ""}: -$${discount.toFixed(2)}</p>` : ""}
        <p>Shipping: $${shipping.toFixed(2)}</p>
        <p><strong>Total: $${total.toFixed(2)}</strong></p>
        <p>— Velvety</p>
      `,
    });
    if (error) {
      console.error("[Order] Resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.error("[Order] Resend exception:", e);
    return { ok: false, error: e instanceof Error ? e.message : "Failed to send email" };
  }
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    console.log("[Auth] No RESEND_API_KEY – reset link (open in browser):", resetUrl);
    return { ok: true };
  }
  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: "Reset your Velvety password",
      html: `
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 1 hour. If you didn’t request this, you can ignore this email.</p>
        <p>— Velvety</p>
      `,
    });
    if (error) {
      console.error("[Auth] Resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.error("[Auth] Resend exception:", e);
    return { ok: false, error: e instanceof Error ? e.message : "Failed to send email" };
  }
}
