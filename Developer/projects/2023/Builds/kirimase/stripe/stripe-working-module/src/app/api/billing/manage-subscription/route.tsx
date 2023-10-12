import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

interface ManageStripeSubscriptionActionProps {
  isSubscribed: boolean;
  stripeCustomerId?: string | null;
  isCurrentPlan: boolean;
  stripePriceId: string;
  email: string;
  userId: string;
}

export async function POST(req: Request) {
  const body: ManageStripeSubscriptionActionProps = await req.json();
  const {
    isSubscribed,
    isCurrentPlan,
    stripeCustomerId,
    userId,
    stripePriceId,
    email,
  } = body;
  console.log(body);
  const billingUrl = absoluteUrl("/billing");

  if (isSubscribed && stripeCustomerId && isCurrentPlan) {
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: billingUrl,
    });

    return new Response(JSON.stringify({ url: stripeSession.url }), {
      status: 200,
    });
  }

  const stripeSession = await stripe.checkout.sessions.create({
    success_url: billingUrl,
    cancel_url: billingUrl,
    payment_method_types: ["card"],
    mode: "subscription",
    billing_address_collection: "auto",
    customer_email: email,
    line_items: [
      {
        price: stripePriceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
    },
  });

  return new Response(JSON.stringify({ url: stripeSession.url }), {
    status: 200,
  });
}
