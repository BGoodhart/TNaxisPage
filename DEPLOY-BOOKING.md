# Public booking deployment

The website remains on its existing GitHub Pages host. Deploy the Node booking API from this repository using render.yaml.

1. Create the Render web service from the blueprint. It uses the free plan, server directory, npm ci, npm start, and /health.
2. Supply the five GOOGLE_* settings from the existing local server/.env through Render secret environment settings. Never commit .env.
3. After Render returns the actual HTTPS service URL, set window.TNAXIS_API_URL to that URL before booking.js runs in book-demo.html. Keep local development defaulting to window.location.origin.
4. Verify the deployed /api/availability endpoint against Google Calendar before publishing the frontend change to GitHub Pages.
5. Check https://tnaxisai.com/book-demo.html loads availability from Render. Only confirm a booking after /api/book returns success.

Production authorization routes are disabled. Renew Google authorization locally when necessary, then update the Render refresh-token secret. A single server instance protects concurrent bookings with an in-memory lock; multiple instances require a shared transactional booking store.
