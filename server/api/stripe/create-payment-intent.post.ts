import Stripe from 'stripe'
import { CartItem, ProductVariant } from '~~/shared/types/schema';

const config = useRuntimeConfig();

const stripe = new Stripe(config.stripeSeceretKey, {
  apiVersion: '2026-01-28.clover'
})


export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const { cart, orderId } = query;
  let cartItems = JSON.parse(cart as string) as CartItem[];
  

  const productIds = cartItems.reduce<Record<string, number>>(
    (acc, cartItem) => {
      // main product
      acc[cartItem.variantId] = cartItem.quantity

      // addons (if any)
      cartItem.addons?.forEach((addon) => {
        acc[addon.id] = cartItem.quantity
      })

      return acc
    },
    {}
  )
  
  let products: ProductVariant[];
  try {
      products = (await directusServer.request(
          readItems('product_variants', {
            filter: {
              id: {
                _in: Object.keys(productIds)
              }
            },
            fields: ['id', 'price']
            // Deep query options for complex nested data:
            // - Sort blocks by their sort order
            // - Filter out hidden blocks

          }),
      )) as unknown as ProductVariant[];

      if(products) {
        const price = products.reduce((total, product) => {
          const quantity = productIds[product.id] ?? 0
          return total + (product.price || 0) * quantity
        }, 0) * 100;

        const intent = await stripe.paymentIntents.create({
          amount: price,
          currency: 'myr',
          metadata: {
            orderId: orderId as string
          }
        })

        return { clientSecret: intent.client_secret }
      }
  } catch (versionError) {
    // If version fetch fails, throw error
    throw createError({ statusCode: 404, statusMessage: 'Payment Intent Could not be created' });
  }
  
  return null;
})
