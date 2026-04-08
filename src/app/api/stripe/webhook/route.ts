import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

// Service role client — bypasses RLS dla webhooków
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const userId = session.metadata?.user_id;
    const credits = parseInt(session.metadata?.credits ?? "0", 10);
    const packageId = session.metadata?.package_id ?? "unknown";

    if (!userId || !credits) {
      console.error("Missing metadata:", session.metadata);
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    // 1. Dodaj kredyty do salda
    const { data: current } = await supabaseAdmin
      .from("credit_balances")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();

    const newBalance = (current?.balance ?? 0) + credits;

    const { error: balanceError } = await supabaseAdmin
      .from("credit_balances")
      .upsert({ user_id: userId, balance: newBalance, updated_at: new Date().toISOString() });

    if (balanceError) {
      console.error("Balance update error:", balanceError);
      return NextResponse.json({ error: "Balance update failed" }, { status: 500 });
    }

    // 2. Zapisz transakcję
    await supabaseAdmin.from("credit_transactions").insert({
      user_id: userId,
      amount: credits,
      type: "purchase",
      description: `Zakup pakietu ${packageId} — ${credits} diamentów`,
    });

    console.log(`✅ Added ${credits} credits to user ${userId}`);
  }

  return NextResponse.json({ received: true });
}

// Wymagane — wyłącz parsowanie body przez Next.js
export const config = {
  api: { bodyParser: false },
};
