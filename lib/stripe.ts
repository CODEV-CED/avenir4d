// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
