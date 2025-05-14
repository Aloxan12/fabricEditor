// vite.config.ts
import { defineConfig } from "file:///C:/Users/Aleksey/Desktop/git/test/vite-host/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Aleksey/Desktop/git/test/vite-host/node_modules/@vitejs/plugin-react/dist/index.mjs";
import federation from "file:///C:/Users/Aleksey/Desktop/git/test/vite-host/node_modules/@originjs/vite-plugin-federation/dist/index.mjs";
import svgr from "file:///C:/Users/Aleksey/Desktop/git/test/vite-host/node_modules/@svgr/rollup/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    svgr({
      svgo: true,
      svgoConfig: {
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: { removeViewBox: false }
            }
          }
        ]
      },
      titleProp: true,
      ref: true
    }),
    federation({
      name: "todoListHome",
      remotes: {
        todoList: "https://vite-project-aloxan12s-projects.vercel.app/assets/remoteEntry.js"
      },
      shared: ["react", "react-dom", "mobx", "axios", "mobx-react"]
    })
  ],
  build: {
    modulePreload: false,
    target: "esnext",
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 4e3
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBbGVrc2V5XFxcXERlc2t0b3BcXFxcZ2l0XFxcXHRlc3RcXFxcdml0ZS1ob3N0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBbGVrc2V5XFxcXERlc2t0b3BcXFxcZ2l0XFxcXHRlc3RcXFxcdml0ZS1ob3N0XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9BbGVrc2V5L0Rlc2t0b3AvZ2l0L3Rlc3Qvdml0ZS1ob3N0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHtkZWZpbmVDb25maWd9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgZmVkZXJhdGlvbiBmcm9tIFwiQG9yaWdpbmpzL3ZpdGUtcGx1Z2luLWZlZGVyYXRpb25cIjtcbmltcG9ydCBzdmdyIGZyb20gJ0BzdmdyL3JvbGx1cCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgICByZWFjdCgpLFxuICAgICAgc3Zncih7XG4gICAgICAgICAgc3ZnbzogdHJ1ZSxcbiAgICAgICAgICBzdmdvQ29uZmlnOiB7XG4gICAgICAgICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAncHJlc2V0LWRlZmF1bHQnLFxuICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBvdmVycmlkZXM6IHsgcmVtb3ZlVmlld0JveDogZmFsc2UgfSxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRpdGxlUHJvcDogdHJ1ZSxcbiAgICAgICAgICByZWY6IHRydWUsXG4gICAgICB9KSxcbiAgICAgIGZlZGVyYXRpb24oe1xuICAgICAgICBuYW1lOiBcInRvZG9MaXN0SG9tZVwiLFxuICAgICAgICByZW1vdGVzOiB7XG4gICAgICAgICAgdG9kb0xpc3Q6IFwiaHR0cHM6Ly92aXRlLXByb2plY3QtYWxveGFuMTJzLXByb2plY3RzLnZlcmNlbC5hcHAvYXNzZXRzL3JlbW90ZUVudHJ5LmpzXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHNoYXJlZDogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIiwgJ21vYngnLCAnYXhpb3MnLCAnbW9ieC1yZWFjdCddLFxuICAgICAgfSksXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgbW9kdWxlUHJlbG9hZDogZmFsc2UsXG4gICAgdGFyZ2V0OiBcImVzbmV4dFwiLFxuICAgIG1pbmlmeTogZmFsc2UsXG4gICAgY3NzQ29kZVNwbGl0OiBmYWxzZSxcbiAgfSxcbiAgc2VydmVyOntcbiAgICBwb3J0OiA0MDAwXG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlVLFNBQVEsb0JBQW1CO0FBQzVWLE9BQU8sV0FBVztBQUNsQixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLFVBQVU7QUFHakIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sS0FBSztBQUFBLE1BQ0QsTUFBTTtBQUFBLE1BQ04sWUFBWTtBQUFBLFFBQ1IsU0FBUztBQUFBLFVBQ0w7QUFBQSxZQUNJLE1BQU07QUFBQSxZQUNOLFFBQVE7QUFBQSxjQUNKLFdBQVcsRUFBRSxlQUFlLE1BQU07QUFBQSxZQUN0QztBQUFBLFVBQ0o7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUFBLE1BQ0EsV0FBVztBQUFBLE1BQ1gsS0FBSztBQUFBLElBQ1QsQ0FBQztBQUFBLElBQ0QsV0FBVztBQUFBLE1BQ1QsTUFBTTtBQUFBLE1BQ04sU0FBUztBQUFBLFFBQ1AsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLFFBQVEsQ0FBQyxTQUFTLGFBQWEsUUFBUSxTQUFTLFlBQVk7QUFBQSxJQUM5RCxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLElBQ2YsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBLElBQ1IsY0FBYztBQUFBLEVBQ2hCO0FBQUEsRUFDQSxRQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsRUFDUjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
