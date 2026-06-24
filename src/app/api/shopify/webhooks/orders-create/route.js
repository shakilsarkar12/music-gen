import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongoose";
import Notification from "@/models/Notification";
import { getSettings } from "@/lib/getSettings";

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const hmacHeader = request.headers.get("X-Shopify-Hmac-Sha256");
    const shopDomain = request.headers.get("X-Shopify-Shop-Domain");

    const settings = await getSettings();
    const shopifySecret = settings.shopifySecretId;

    if (!shopifySecret) {
      console.error("[Shopify Webhook] Shopify Secret ID not configured");
      return NextResponse.json({ error: "Configuration missing" }, { status: 500 });
    }

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha256", shopifySecret)
      .update(rawBody, "utf8", "hex")
      .digest("base64");

    if (hash !== hmacHeader) {
      console.error("[Shopify Webhook] HMAC validation failed.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderData = JSON.parse(rawBody);

    await dbConnect();
    
    // Create notification
    await Notification.create({
      title: "New Shopify Order",
      message: `Order #${orderData.order_number} placed by ${orderData.email || 'a customer'} for $${orderData.total_price}`,
      type: "shopify_order",
      link: `https://${shopDomain}/admin/orders/${orderData.id}`
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("[Shopify Webhook] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
