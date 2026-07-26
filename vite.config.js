import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { handleChatRequest } from './src/server/chatHandler.js'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true
  },
  plugins: [
    {
      name: 'amanah-api-server',
      configureServer(server) {
        server.middlewares.use('/api/chat', (req, res) => {
          handleChatRequest(req, res);
        });

        server.middlewares.use('/api/mcps-pdf', async (req, res) => {
          try {
            const pdfRes = await fetch("https://ww2.montgomeryschoolsmd.org/departments/forms/pdf/560-51.pdf");
            if (!pdfRes.ok) {
              res.statusCode = pdfRes.status;
              return res.end("Failed to fetch official MCPS PDF");
            }
            const buffer = await pdfRes.arrayBuffer();
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.end(Buffer.from(buffer));
          } catch (err) {
            console.error("Error proxying MCPS PDF:", err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      }
    },
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    react(),
  ]
});
