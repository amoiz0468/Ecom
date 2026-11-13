import { Resend } from "resend";
import { Order } from "@/types";
import { formatPKR } from "@/lib/utils";
import { appendAuditLog } from "@/lib/db/sqlite";

function isResendConfigured(): boolean {
  const key = process.env.RESEND_API_KEY;
  return Boolean(
    key &&
      key.startsWith("re_") &&
      key !== "re_123456789" &&
      !key.includes("placeholder")
  );
}

export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  const recipientEmail = order.guest_info.email;
  if (!recipientEmail || !recipientEmail.includes("@")) return;

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ||
    "Almoin Crockery <orders@almoincrockery.pk>";

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #ece3d5; color: #1c1917; font-size: 14px;">
          <strong>${item.product_title}</strong><br/>
          <span style="color: #78716c; font-size: 12px;">${item.variant_title} (SKU: ${item.sku}) × ${item.quantity}</span>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #ece3d5; text-align: right; color: #1c1917; font-weight: 600; font-size: 14px;">
          ${formatPKR(item.total_pkr)}
        </td>
      </tr>
    `
    )
    .join("");

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fdfbf7; border: 1px solid #e7dfd3; border-radius: 16px; padding: 32px; color: #1c1917;">
      <p style="text-transform: uppercase; letter-spacing: 0.2em; font-size: 11px; color: #b45309; margin: 0 0 8px;">Almoin Crockery • Fine Tableware Pakistan</p>
      <h1 style="font-size: 24px; margin: 0 0 12px;">Order Confirmed — ${order.order_number}</h1>
      <p style="font-family: sans-serif; font-size: 14px; color: #57534e; line-height: 1.6;">
        Assalam-o-Alaikum <strong>${order.guest_info.name}</strong>,<br/>
        Thank you for your order! Our Karachi &amp; Lahore ceramic specialists are preparing your fragile tableware with double-corrugated foam cushioning.
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-family: sans-serif;">
        ${itemsHtml}
        <tr>
          <td style="padding-top: 14px; font-size: 15px; font-weight: bold;">Total Amount</td>
          <td style="padding-top: 14px; text-align: right; font-size: 18px; font-weight: bold; color: #b45309;">${formatPKR(order.total_pkr)}</td>
        </tr>
      </table>
      <p style="font-family: sans-serif; font-size: 12px; color: #78716c; background: #f5efe6; padding: 12px 16px; border-radius: 10px;">
        <strong>100% Free Breakage Replacement Guarantee:</strong> Please record a 30-second unboxing video upon delivery to claim instant free replacement of any transit-damaged piece.
      </p>
    </div>
  `;

  if (!isResendConfigured()) {
    appendAuditLog({
      actor: "notification-service",
      action: "EMAIL_SIMULATED",
      entity_type: "order",
      entity_id: order.order_number,
      details: `Simulated confirmation email to ${recipientEmail} for ${order.order_number}`,
    });
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject: `Order Confirmed: ${order.order_number} — Almoin Crockery`,
      html,
    });

    appendAuditLog({
      actor: "notification-service",
      action: "EMAIL_SENT",
      entity_type: "order",
      entity_id: order.order_number,
      details: `Sent Resend confirmation email to ${recipientEmail}`,
    });
  } catch {
    // Non-blocking email failure
  }
}

