import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// GateWay (Spring Cloud Gateway) is the single entry point for every REST call.
// RealTimeService's WebSocket is reached directly (host:port returned by login),
// since it isn't proxied through the gateway.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
  },
});
