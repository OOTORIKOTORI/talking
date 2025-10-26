// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  
  modules: [
    '@nuxtjs/tailwindcss'
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
      meiliHost: process.env.NUXT_PUBLIC_MEILI_HOST || 'http://localhost:7700',
      meiliKey: process.env.NUXT_PUBLIC_MEILI_KEY || 'masterKey123'
    }
  },

  devtools: { enabled: true },

  compatibilityDate: '2024-11-01'
})
