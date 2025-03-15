import { resolve } from 'path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'



export default defineConfig({


  plugins: [
    VitePWA({
      registerType: "prompt",
      //selfDestroying: true,
      workbox: {
        //globPatterns: ['**/*.{js,css,html,ico,png,svg,bcmap,woff,woff2,ttf,LICENSE}'],
        globPatterns: ['**/*.*'],
        maximumFileSizeToCacheInBytes: 30000000,
        cleanupOutdatedCaches: true
      },
      manifest: {
        name: "zPDF",
        description: "A Simple PDF Editor: Split pages, Merge, Rearrange, add Signature, Image and Multi-language Text. — Offline and Private.",
        icons: [{
          src: './icons/512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: './icons/256x256.png',
          sizes: '256x256',
          type: 'image/png'
        },
        {
          src: './icons/icon.ico',
          sizes: '256x256',
          type: 'image/x-icon'
        },
        {
          src: './icons/192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: './icons/180x180.png',
          sizes: '180x180',
          type: 'image/png'
        },
        {
          src: './icons/128x128.png',
          sizes: '128x128',
          type: 'image/png'
        },
        {
          src: './icons/96x96.png',
          sizes: '96x96',
          type: 'image/png'
        },
        {
          src: './icons/64x64.png',
          sizes: '64x64',
          type: 'image/png'
        },
        ],
        theme_color: "#1c4156",
        background_color: "#ffffff"
      }
    })
  ]
  ,


  build: {
    target: ['ES2015'],
    minify: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        //format: 'cjs',
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
    manifest: true,
  }
})

////////////

