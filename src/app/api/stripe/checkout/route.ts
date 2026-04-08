import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

const PACKAGES = [
  { id: "pack_starter",  credits: 100,  bonus: 0,   price_pln: 1499, label: "Starter"  },
  { id: "pack_popular",  credits: 500,  bonus: 50,  price_pln: 6999, label: "Popular"  },
  { id: "pack_creator",  credits: 1200, bonus: 150, price_pln: 15999, label: "Creator" },
  { id: "pack_pro",      credits: 3000, bonus: 500, price_pln: 39999, label: "Pro"      },
];

export async function POST(req: NextRequest) {
  try {
    const { packageId } = await req.json();

    const pkg = PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    // Get authenticated user
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const totalCredits = pkg.credits + pkg.bonus;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "pln",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "pln",
            unit_amount: pkg.price_pln, // grosze
            product_data: {
              name: `${pkg.label} — ${totalCredits} 💎 diamentów`,
              description: pkg.bonus > 0
                ? `${pkg.credits} diamentów + ${pkg.bonus} bonus = ${totalCredits} łącznie`
                : `${pkg.credits} diamentów`,
              images: ["https://secrely.pl/favicon.svg"],
            },
          },
        },
      ],
      payment_method_types: ["card", "blik"],
      metadata: {
        user_id: user.id,
        package_id: pkg.id,
        credits: totalCredits.toString(),
      },
      customer_email: user.email,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/wallet?success=1&credits=${totalCredits}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/wallet?cancelled=1`,
      locale: "pl",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
