# Production Architecture Guidelines

## 1. Zero Backend Proxy Rewrites on Vercel
- **Rule**: NEVER use `"rewrites"` in `vercel.json` to reverse-proxy backend traffic (e.g., `/api/:path*`).
- **Reason**: Every proxied call drains Vercel's 1M Edge Request quota and triggers account-wide `HTTP 402 DEPLOYMENT_DISABLED` lockouts.
- **Implementation**: The frontend MUST call backend APIs directly via environment variables (`VITE_API_BASE_URL=https://api.yourdomain.com`), and the backend must allow the frontend domain in CORS.

## 2. No Local or Campus Intranet IPs in Production
- **Rule**: NEVER point production traffic to residential, campus, or intranet IPs (e.g., `121.x.x.x:5050` or `172.x.x.x`).
- **Reason**: Enterprise hardware firewalls (e.g., Fortinet FortiGate) block non-standard ports and dynamic IPs. Power or campus Wi-Fi outages terminate global availability.
- **Implementation**: Host backends on managed cloud platforms (Render, Railway, Koyeb, Fly.io) on standard HTTPS (port 443) with valid TLS certificates.

## 3. Active Cold Start Mitigation
- **Rule**: Free cloud instances (Render, Koyeb) sleep after 15 minutes of inactivity.
- **Implementation**: Implement an automated 10-minute heartbeat ping via free uptime monitors (UptimeRobot, Cron-job.org, or Cloudflare Worker Cron Triggers) to maintain instance warm state.

## 4. Cloudflare Pages for High-Traffic Frontends
- **Rule**: For public, high-volume, or institutional traffic, deploy frontend static assets to Cloudflare Pages.
- **Reason**: Cloudflare Pages offers unlimited bandwidth and no edge request invocation caps on the free tier, preventing quota lockouts.
- **Configuration**: Use `_redirects` (`/* /index.html 200`) in `public/` for client-side routing.
