## Overview

* Resolve web push notification error by configuring `vapidPublicKey` and hardening registration on web.

* Fix product details page showing "Product not found" by tightening backend response semantics and making the frontend request more robust.

## Web Push Notifications

1. Configure Expo web push:

   * Add `notification.vapidPublicKey` in `myntra/app.json` under `expo.notification`.

     * File: `myntra/app.json:49–55`

     * Example:

       ```json
       {
         "expo": {
           "notification": {
             "icon": "./assets/images/myntra.jpg",
             "color": "#ff3f6c",
             "iosDisplayInForeground": true,
             "androidMode": "default",
             "androidCollapsedTitle": "#{unread_notifications} new notifications",
             "vapidPublicKey": "<YOUR_WEB_PUSH_VAPID_PUBLIC_KEY>"
           }
         }
       }
       ```

   * Ensure the app is served over HTTPS (or `http://localhost`) when testing web push.
2. Harden registration logic on web so it never throws when VAPID isn’t present:

   * Update `myntra/context/NotificationContext.tsx` to skip registration on web unless configured.

     * Import gating: simplify to only load notifications on native.

       * Change location: `myntra/context/NotificationContext.tsx:10–23`

     * Guard in `registerForPushNotifications()` to bail out on web if not configured.

       * Location: `myntra/context/NotificationContext.tsx:52–71, 74–79, 145–149`
3. Verify:

   * Run the web app, confirm no console error: "You must provide `notification.vapidPublicKey`".

   * Confirm token registration path executes on native and web only after VAPID is set.

## Product Page Not Found

1. Backend: return appropriate status when product is missing or ID is invalid.

   * Update `backend/routes/Productroutes.js`:

     * File: `backend/routes/Productroutes.js:15–23`

     * Add `mongoose` import and validate `req.params.id` before querying.

     * Return `404` when product isn’t found; return `400` for invalid ids; keep `500` for server errors.
2. Frontend: make fetch resilient and align UI with backend statuses.

   * `myntra/app/product/[id].tsx`:

     * Encode `id` in the request URL: `axios.get(`${API\_BASE\_URL}/product/${encodeURIComponent(String(id))}`)`.

       * Location: `myntra/app/product/[id].tsx:115–121`

     * Show "Product not found" only when a `404` occurs; show a friendly error for other failures.

       * Location: `myntra/app/product/[id].tsx:120–128, 220–228`

     * Optional: gate the not-found UI behind `!isLoading && !product` to avoid brief flicker.
3. Verify:

   * Navigate from Home and Categories to a known product (`_id` present in listings) and confirm details render.

   * Hit `GET ${API_BASE_URL}/product/<valid_id>` and `GET ${API_BASE_URL}/product/<invalid_or_missing_id>` to confirm `200` with product, `404` for missing, `400` for invalid.

## File References

* Notifications:

  * `myntra/app.json:49–55`

  * `myntra/context/NotificationContext.tsx:10–23`, `52–71`, `74–79`, `145–149`

* Product page:

  * \`myn

