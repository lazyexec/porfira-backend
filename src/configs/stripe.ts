import Stripe from "stripe";
import env from "./env.ts";

// interface Product {
//   title: string;
//   quantity: number
//   price: number;
// }

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
});


export default stripe;
