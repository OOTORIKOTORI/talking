// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  components: true,
  ssr: true,
  
  css: [
    '~/assets/css/talking-stage.css'
  ],
  
  modules: [
     // 既存のモジュール...
     '@nuxtjs/tailwindcss',
     '@nuxtjs/supabase',
     '@nuxt/icon',
  ],

  // Google Fonts の設定
  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&family=Noto+Serif+JP:wght@300;400;500;700;900&family=M+PLUS+Rounded+1c:wght@300;400;500;700;900&family=M+PLUS+1p:wght@300;400;500;700;900&family=Kosugi+Maru&family=Kosugi&family=Sawarabi+Mincho&family=Sawarabi+Gothic&family=Zen+Maru+Gothic:wght@300;400;500;700;900&family=Zen+Kaku+Gothic+New:wght@300;400;500;700;900&family=Zen+Old+Mincho:wght@400;500;600;700;900&family=Shippori+Mincho:wght@400;500;600;700;800&family=Shippori+Mincho+B1:wght@400;500;600;700;800&family=Kaisei+Decol:wght@400;500;700&family=Kaisei+Opti:wght@400;500;700&family=Kaisei+Tokumin:wght@400;500;700;800&family=Kaisei+HarunoUmi:wght@400;500;700&family=Kiwi+Maru:wght@300;400;500&family=Stick&family=Potta+One&family=Reggae+One&family=Rock+Salt&family=Dela+Gothic+One&family=Hachi+Maru+Pop&family=Yusei+Magic&family=Train+One&family=Rampart+One&family=Mochiy+Pop+One&family=Mochiy+Pop+P+One&family=DotGothic16&family=RocknRoll+One&family=New+Tegomin&family=Yomogi&family=Slackkey&display=swap'
        }
      ]
    }
  },

  supabase: {
    // Database型定義の警告を無効化
    types: false,
    // 自動リダイレクトを無効化（手動でミドルウェア制御）
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/assets', '/assets/*', '/login', '/logout'],
    },
    redirect: false
  },

  alias: {
    // Force cookie-es to be used instead of cookie for ESM compatibility
    'cookie': 'cookie-es'
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4000',
      supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY,
      },
      meiliHost: process.env.NUXT_PUBLIC_MEILI_HOST || 'http://localhost:7700',
      meiliKey: process.env.NUXT_PUBLIC_MEILI_KEY || 'masterKey123',
      s3PublicBase: process.env.NUXT_PUBLIC_S3_PUBLIC_BASE || 'http://localhost:9000/uploads'
    }
  },
  // supabase設定は上部に統合済み

  devtools: { enabled: true },

  compatibilityDate: '2024-11-01'
})
