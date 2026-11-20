import Stripe from "stripe";
import ErrorHandler from "./ErrorHandler";

let stripeClient: Stripe | null = null;

// Create the Stripe client only once, and only when it is needed
export const getStripe = (): Stripe => {
  const key = process.env.STRIPE_SECRET_KEY?.trim();

  if (!key) {
    throw new ErrorHandler("Stripe is not configured on the server", 500);
  }

  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }

  return stripeClient;
};

// Frontend base URL (used for Stripe success / cancel redirects)
export const getClientUrl = (): string =>
  (process.env.CLIENT_URL || "http://localhost:5173")
    .trim()
    .replace(/\/+$/, "");
