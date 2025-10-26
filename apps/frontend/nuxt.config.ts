// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase'
  ],

  supabase: {
    // Database型定義の警告を無効化
    types: false,
    // 自動リダイレクトを無効化（手動でミドルウェア制御）
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/assets', '/assets/*', '/login', '/logout'],
    }
  },

  alias: {
    // Force cookie-es to be used instead of cookie for ESM compatibility
    'cookie': 'cookie-es'
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
      meiliHost: process.env.NUXT_PUBLIC_MEILI_HOST || 'http://localhost:7700',
      meiliKey: process.env.NUXT_PUBLIC_MEILI_KEY || 'masterKey123',
      s3PublicBase: process.env.NUXT_PUBLIC_S3_PUBLIC_BASE || 'http://localhost:9000/uploads'
    }
  },

  devtools: { enabled: true },

  compatibilityDate: '2024-11-01'
})
