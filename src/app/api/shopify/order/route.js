import { NextResponse } from "next/server";
import { getSettings } from "@/lib/getSettings";

export async function PUT(request) {
  try {
    const { orderId, note, tags, email } = await request.json();
    
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const settings = await getSettings();
    if (!settings.shopUrl || !settings.shopifyAdminApiKey) {
      return NextResponse.json({ error: "Shopify API is not configured" }, { status: 500 });
    }

    let url = settings.shopUrl;
    if (!url.startsWith('http')) url = `https://${url}`;

    // Prepare the update payload for Shopify
    const orderPayload = {
      order: {
        id: orderId,
        note: note,
        tags: tags,
        email: email
      }
    };

    const response = await fetch(`${url}/admin/api/2024-04/orders/${orderId}.json`, {
      method: 'PUT',
      headers: {
        "X-Shopify-Access-Token": settings.shopifyAdminApiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderPayload),
      cache: "no-store"
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.errors ? JSON.stringify(data.errors) : "Failed to update Shopify order" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, order: data.order }, { status: 200 });

  } catch (error) {
    console.error("Error updating Shopify order:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
