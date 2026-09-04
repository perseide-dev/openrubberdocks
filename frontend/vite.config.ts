import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, './src/core/assets'),
      '@components': path.resolve(__dirname, './src/core/components'),
      '@config': path.resolve(__dirname, './src/core/config'),
      '@config-env': path.resolve(__dirname, './src/core/config/env'),
      '@config-tsq': path.resolve(__dirname, './src/core/config/tsq'),
      '@global': path.resolve(__dirname, './src/core/global'),
      '@global-hooks': path.resolve(__dirname, './src/core/global/hooks'),
      '@global-providers': path.resolve(__dirname, './src/core/global/providers'),
      '@http': path.resolve(__dirname, './src/core/http'),
      '@http-base': path.resolve(__dirname, './src/core/http/base'),
      '@http-constants': path.resolve(__dirname, './src/core/http/constants'),
      '@http-error': path.resolve(__dirname, './src/core/http/error'),
      '@http-interceptors': path.resolve(__dirname, './src/core/http/interceptors'),
      '@http-middelware': path.resolve(__dirname, './src/core/http/middelware'),
      '@http-types': path.resolve(__dirname, './src/core/http/types'),
      '@layout': path.resolve(__dirname, './src/core/layout'),
      '@request': path.resolve(__dirname, './src/core/request'),
      '@routes': path.resolve(__dirname, './src/core/routes'),
      '@theme': path.resolve(__dirname, './src/core/theme'),
      '@utils': path.resolve(__dirname, './src/core/utils'),
      '@utils-constants': path.resolve(__dirname, './src/core/utils/constants'),
      '@utils-functions': path.resolve(__dirname, './src/core/utils/functions'),
      '@utils-labels': path.resolve(__dirname, './src/core/utils/labels'),
      '@features': path.resolve(__dirname, './src/features')
    }
  }
})
