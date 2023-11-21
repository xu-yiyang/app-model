import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin, loadEnv } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default (({ mode }) => {
  // 获取环境变量
  const env = loadEnv(mode, process.cwd());

  return defineConfig({
    main: {
      envPrefix: 'RENDERER_VITE_ALL_',
      plugins: [externalizeDepsPlugin()],
    },
    preload: {
      envPrefix: 'RENDERER_VITE_ALL_',
      plugins: [externalizeDepsPlugin()],
    },
    renderer: {
      plugins: [react()],
      define: {
        'process.env': { ...env }
      },
      resolve: {
        alias: {
          '@': resolve('src/renderer/src'),
          '@renderer': resolve('src/renderer/src')
        },
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
      }
    }
  })

})