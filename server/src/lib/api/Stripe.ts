import stripe from "stripe";
import { response } from "express";

const client = new stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: '2020-03-02'
});

export const Stripe = {
  connect: async (code: string) => {
    const response = await client.oauth.token({
      grant_type: "authorization_code",
      code: code
    });

    return response;
  },
  charge: async (amount: number, source: string, stripeAccount: string) => {
    const res = await client.charges.create({
      amount,
      currency: "gbp",
      source,
      application_fee_amount: Math.round(amount * 0.05)
    }, {
      stripeAccount: stripeAccount
    });

    if (res.status !== "succeeded") {
      throw new Error("Failed to create charge with Stripe");
    }
  },
  disconnect: async (stripeUserId: string) => {
    const response = await client.oauth.deauthorize({
      client_id: `${process.env.STRIPE_CLIENT_ID}`,
      stripe_user_id: stripeUserId
    });

    return response;
  }
}
