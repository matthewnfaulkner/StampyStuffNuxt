import Stripe from 'stripe'

const config = useRuntimeConfig();

const stripe = new Stripe(config.stripeSeceretKey, {
  apiVersion: '2026-01-28.clover'
})


export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const { paymentIntent } = query;
  
  try {
      
      const intent = await stripe.paymentIntents.retrieve(paymentIntent as string)

      return { clientSecret: intent.client_secret, amount: intent.amount, currency: intent.currency }
      
  } catch (versionError) {
    // If version fetch fails, throw error
    throw createError({ statusCode: 404, statusMessage: 'Payment Intent not found' });
  }
  
  return null;
})
