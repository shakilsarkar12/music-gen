import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import { withCORS, handleOptions } from "@/lib/cors";

// Preflight — the browser sends this automatically before the real POST.
export async function OPTIONS(request) {
  return handleOptions(request);
}

export async function POST(request) {
  const origin = request.headers.get("origin") || "";
  try {
    await dbConnect();

    const body = await request.json();
    const { formData, musicTracks, taskId, musicId, productId, variantId } = body;

    if (!formData?.email || !taskId) {
      return withCORS(
        NextResponse.json(
          { error: "Email and taskId are required" },
          { status: 400 }
        ),
        origin
      );
    }

    // Upsert the order: if it already exists for this taskId and email, update it.
    // Otherwise, create a new record.
    const order = await Order.findOneAndUpdate(
      { email: formData.email, taskId: taskId },
      {
        $set: {
          occasion: formData.occasion,
          forWho: formData.forWho,
          recipientName: formData.recipientName,
          genre: formData.genre,
          voice: formData.voice,
          mood: formData.mood,
          lyrics: formData.lyrics,
          selectedDemo: formData.selectedDemo,
          selectedPackage: formData.selectedPackage,
          orderNotes: formData.orderNotes,
          musicId: musicId || undefined, // opaque public ID — maps back to this taskId for support/admin lookups
          shopifyProductId: productId || undefined,
          shopifyVariantId: variantId || undefined,
          // Do not overwrite status if it's already updated to something else like "paid"
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return withCORS(NextResponse.json({ success: true, order }), origin);
  } catch (error) {
    console.error("[orders] POST Error:", error);
    return withCORS(
      NextResponse.json(
        { error: "Failed to save order to database" },
        { status: 500 }
      ),
      origin
    );
  }
}