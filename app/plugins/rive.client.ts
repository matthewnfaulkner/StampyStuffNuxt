import { Rive } from '@rive-app/canvas'

export default defineNuxtPlugin(() => {
  return {
    provide: { rive: Rive }
  }
})
