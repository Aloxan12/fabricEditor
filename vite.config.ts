import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from "@originjs/vite-plugin-federation";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
      react(),
      federation({
        name: "todoListHome",
        remotes: {
          todoList: "https://vite-project-aloxan12s-projects.vercel.app/assets/remoteEntry.js",
        },
        shared: ["react", "react-dom", 'mobx', 'axios', 'mobx-react'],
      }),
  ],
  build: {
    modulePreload: false,
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
})
