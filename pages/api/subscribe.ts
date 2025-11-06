// pages/api/subscribe.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(503).json({ error: "Service configuration error" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    // Add to subscribers table
    await supabase
      .from("subscribers")
      .upsert(
        {
          email: email.toLowerCase().trim(),
          confirmed: true,
          confirmed_at: new Date().toISOString(),
          subscribed_at: new Date().toISOString(),
        },
        {
          onConflict: "email",
          ignoreDuplicates: false,
        }
      );

    // Send welcome email via Resend API
    if (process.env.RESEND_API_KEY) {
      try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #d97706; color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9fafb; padding: 30px 20px; }
    .section { background: white; padding: 25px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
    .button { display: inline-block; background: #d97706; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 15px 0; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; padding: 30px 20px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📬 Welcome to Vending Exits!</h1>
    </div>
    
    <div class="content">
      <div class="section">
        <h2 style="color: #d97706; margin-top: 0;">Thanks for subscribing!</h2>
        <p>Every Monday morning, you'll receive the <strong>Weekly Top 10</strong> - the best vending machine business listings delivered directly to your inbox.</p>
        
        <h3 style="color: #374151; margin-top: 30px;">What to Expect:</h3>
        <ul style="line-height: 1.8;">
          <li>✓ Curated Top 10 listings every Monday</li>
          <li>✓ Verified routes only - no franchise funnels</li>
          <li>✓ Direct broker relationships</li>
          <li>✓ Investment analysis and insights</li>
        </ul>

        <p style="margin: 30px 0; text-align: center;">
          <a href="https://vendingexits.com" class="button">Browse Current Listings →</a>
        </p>
      </div>

      <div class="section" style="background: #fef3c7; border: 1px solid #fbbf24;">
        <h3 style="color: #92400e; margin-top: 0;">Why Vending Exits?</h3>
        <p style="color: #78350f; margin: 0;">
          We aggregate listings from 1,500+ brokers nationwide. No franchise funnels, no lead-gen schemes. Just real verified vending businesses from established brokers.
        </p>
      </div>

      <div class="footer">
        <p><strong>Jeff & John Sosville</strong><br>
        Founders, Vending Exits<br>
        jeff@vendingexits.com</p>
        
        <p style="margin-top: 25px; font-size: 12px; color: #9ca3af;">
          You're receiving this because you subscribed at VendingExits.com<br>
          Don't want these emails? <a href="mailto:jeff@vendingexits.com?subject=Unsubscribe" style="color: #d97706;">Unsubscribe</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
        `;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Jeff at Vending Exits <jeff@VendingExits.com>",
            to: email,
            subject: "Welcome to Vending Exits Weekly Top 10",
            html: emailHtml,
          }),
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Successfully subscribed!",
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
