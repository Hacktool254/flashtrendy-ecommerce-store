import { resend } from "@/lib/resend";
import { render } from "@react-email/render";
import { OrderConfirmationEmail } from "@/emails/OrderConfirmationEmail";
import { PasswordResetEmail } from "@/emails/PasswordResetEmail";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import React from "react";

export async function sendOrderConfirmationEmail(order: any) {
  if (!process.env.RESEND_API_KEY) return;

  try {
    const html = await render(React.createElement(OrderConfirmationEmail, { order }));

    const { data, error } = await resend.emails.send({
      from: "FlashTrendy <onboarding@resend.dev>",
      to: order.user.email,
      subject: `Order Confirmation - #${order.id.slice(-8)}`,
      html: html,
    });

    if (error) {
      console.error("Error sending order confirmation email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    return { success: false, error };
  }
}

export async function sendOrderStatusUpdateEmail(order: any) {
  if (!process.env.RESEND_API_KEY) return;

  // For status updates, we can use a simpler approach or create a specific template
  // For now, I'll keep the raw HTML or I could create StatusUpdateEmail template
  // Let's stick to the raw HTML for this one to keep it simple, or I can refine later
  try {
    const { data, error } = await resend.emails.send({
      from: "FlashTrendy <onboarding@resend.dev>",
      to: order.user.email,
      subject: `Order Status Updated - #${order.id.slice(-8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h1 style="color: #0f172a; margin-bottom: 24px;">Order Status Updated</h1>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">Hi ${order.user.name}, the status of your order <strong>#${order.id.slice(-8)}</strong> has been updated to:</p>
          
          <div style="margin: 32px 0; padding: 20px; background-color: #f8fafc; border-radius: 6px; text-align: center;">
            <span style="font-size: 24px; font-weight: bold; color: #3b82f6; text-transform: uppercase;">${order.status}</span>
          </div>

          <p style="color: #475569; font-size: 14px;">Log in to your dashboard to see more details.</p>
          <hr style="margin: 32px 0; border: 0; border-top: 1px solid #e2e8f0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">&copy; 2024 FlashTrendy Ecommerce Store. All rights reserved.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending order status update email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send order status update email:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  if (!process.env.RESEND_API_KEY) return;

  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetLink = `${domain}/reset-password?token=${token}`;

  try {
    const html = await render(React.createElement(PasswordResetEmail, { resetLink }));

    const { data, error } = await resend.emails.send({
      from: "FlashTrendy <onboarding@resend.dev>",
      to: email,
      subject: "Reset your password",
      html: html,
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  if (!process.env.RESEND_API_KEY) return;

  try {
    const html = await render(React.createElement(WelcomeEmail, { name }));

    const { data, error } = await resend.emails.send({
      from: "FlashTrendy <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to FlashTrendy!",
      html: html,
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error };
  }
}
