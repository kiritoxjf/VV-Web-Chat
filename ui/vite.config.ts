import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath, URL } from 'node:url'
import Inspect from 'vite-plugin-inspect'
import svgr from 'vite-plugin-svgr'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // dev环境端口号
    port: 8000,
    host: '0.0.0.0',
    // 反向代理
    proxy: {
      '/ws': {
        target: 'ws://127.0.0.1:8080',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path,
        headers: {
          'X-Real-IP': '127.0.0.1'
        }
      },
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          'X-Real-IP': '127.0.0.1'
        }
      }
    }
  },
  plugins: [
    Inspect({
      build: true,
      outputDir: '.vite-inspect'
    }),
    svgr(),
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'buildStats.html'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/styles/global.scss" as *;'
      }
    }
  },
  build: {
    target: 'modules', //浏览器兼容性modules|esnext
    sourcemap: false, //构建后是否生成source map文件
    // minify: 'terser', // 混淆器,terser构建后文件体积更小
    // outDir: envConfig.VITE_OUTPUT_DIR,  //指定输出文件包名
    outDir: 'dist',
    assetsDir: 'assets', // 指定生成静态资源的存放路径
    chunkSizeWarningLimit: 1500, //警报门槛，限制大文件大小B为单位
    assetsInlineLimit: 4096, //小于此阈值的导入或引用资源将内联为base64编码,以避免额外的http请求,设置为0可以完全禁用此项
    // 清除console和debugger(minify: 'terser',)设置后这个terserOptions才有用
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        //自动分割包名输出 chunkSizeWarningLimit 配置大小
        chunkFileNames: 'js/[name]-[hash].js', //入口文件名
        entryFileNames: 'js/[name]-[hash].js', //出口文件名位置
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]', //静态文件名位置
        manualChunks(id) {
          if (id.includes('axios')) {
            return 'axios'
          }
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString()
          }
        }
      }
    }
  }
})
