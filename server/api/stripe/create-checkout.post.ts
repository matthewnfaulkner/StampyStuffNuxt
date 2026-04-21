import Stripe from 'stripe'

const config = useRuntimeConfig();


const stripe = new Stripe(config.stripeSeceretKey, {
  apiVersion: '2026-01-28.clover'
})

export default defineEventHandler(async (event) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'Test Product' },
          unit_amount: 2000
        },
        quantity: 1
      }
    ],
    success_url: 'https://example.com/success',
    cancel_url: 'https://example.com/cancel'
  })

  return { id: session.id }
})
