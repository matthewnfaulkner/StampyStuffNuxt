import Stripe from 'stripe'
import { Order, Payment } from '~~/shared/types/schema'

const config = useRuntimeConfig();


const stripe = new Stripe(config.stripeSeceretKey, {
    apiVersion: '2026-01-28.clover'
})

export default defineEventHandler(async (event) => {
    const body = await readRawBody(event)
    const signature = getHeader(event, 'stripe-signature')!
    
    const TOKEN = config.directusPaymentToken as string;

    if (!TOKEN) {
        throw createError({
            statusCode: 500,
            statusMessage: 'DIRECTUS_PAYMENT_TOKEN is not defined. Check your .env file.',
        });
    }

    let stripeEvent

    try {
        stripeEvent = stripe.webhooks.constructEvent(
        body!,
        signature,
        'whsec_7049b3ac8382d4eb99995602f7d726307ac0add292db3e69eb824324fc399bce'
        )
    } catch (err: any) {
        console.error('Webhook signature verification failed.', err.message)
        throw createError({ statusCode: 400, statusMessage: 'Invalid signature' })
    }

    // Handle events
    switch (stripeEvent.type) {
        case 'payment_intent.succeeded':
            const succeededIntent = stripeEvent.data.object
            console.log('Payment succeeded:', succeededIntent.id)
            
            try{
                const orderSuccess = await directusServer.request<Order>(withToken(TOKEN, readItem('orders', succeededIntent.metadata.orderId)));
                
                if(orderSuccess === undefined) {
                    console.error('Order Does Not Exist', succeededIntent.metadata.orderId)
                    throw createError({ statusCode: 400, statusMessage: `Order ${succeededIntent.metadata.orderId} Does Not Exst` })
                }

                const paymentMethod = await stripe.paymentMethods.retrieve(succeededIntent.payment_method as string)

                const payment: Omit<Payment, 'id' | 'order'> = {
                    payment_id: succeededIntent.id,
                    payment_method: paymentMethod.type as string,
                    payment_gateway: 'stripe',
                    amount: succeededIntent.amount / 100,
                    currency: succeededIntent.currency,
                    status: 'success',
                }

                await directusServer.request<Order>(withToken(TOKEN, updateItem('orders', succeededIntent.metadata.orderId, {
                    payment_status: 'paid',
                    payments: {
                        create: [payment]
                    }
                })));

            } catch (error){
                throw createError({ statusCode: 400, statusMessage: `Order ${succeededIntent.metadata.orderId} Does Not Exst` })

            }
            // ✅ Update your database here
            break

        case 'payment_intent.payment_failed':
            const failedIntent = stripeEvent.data.object
            console.log('Payment failed:', failedIntent.id)

            const orderFailed = await directusServer.request<Order>(withToken(TOKEN, readItem('orders', failedIntent.metadata.orderId)));

            if(orderFailed === undefined) {
                console.error('Order Does Not Exist', failedIntent.metadata.orderId)
                throw createError({ statusCode: 400, statusMessage: `Order ${failedIntent.metadata.orderId} Does Not Exst` })
            }

            const payment: Omit<Payment, 'id' | 'order'> = {
                payment_id: failedIntent.id,
                payment_method: null,
                payment_gateway: 'stripe',
                amount: failedIntent.amount / 100,
                currency: failedIntent.currency,
                status: 'failed',
                error_code: failedIntent.last_payment_error?.code
            }

            await directusServer.request<Order>(withToken(TOKEN, updateItem('orders', failedIntent.metadata.orderId, {
                payment_status: 'not_paid',
                payments: [payment]
            })));

        // ❌ Mark as failed in DB
        break
    }

  return { received: true }
})