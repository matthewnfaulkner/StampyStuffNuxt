import { loadStripe } from '@stripe/stripe-js'

export default defineNuxtPlugin(async () => {

  const stripe = await loadStripe(
    "pk_test_51T23LZRtLYBShCYyqXa4Q7aXzDcErE6HD71EiecOsVOZ2BLENHQUBd0KxSOhg8LsEIowXNZt486DLB7gDSP7GPAu00wmI2aEYY"
  )

  return {
    provide: {
      stripe
    }
  }
})
