# Telegram Notification Configuration Guide

This guide explains how to wire the Cargo Broker Telegram integration for end-to-end order notifications. All backend and frontend plumbing ships with the repository—admins only need to supply Telegram credentials and point the UI at the correct chat.

## 1. Prerequisites

1. **Install dependencies and build assets**
   - `cd apps/server && npm install`
   - `cd ../web && npm install`
2. **Create a Telegram bot**
   - Open Telegram and message [`@BotFather`](https://t.me/BotFather).
   - Run `/newbot`, follow the prompts, and copy the generated **Bot Token**.

## 2. Configure the Express backend

The server uses the Bot Token to authenticate outgoing requests.

1. Export the token before starting the API (replace the placeholder with your BotFather secret):

   ```bash
   export TELEGRAM_BOT_TOKEN="123456789:ABCDEF..."
   cd apps/server
   npm start
   ```

   > The Express app listens on `http://localhost:3000` by default. Adjust the `PORT` environment variable if you need a different port.

2. (Optional) Run behind a process manager such as PM2 or configure the variable in your deployment platform's secret store when hosting remotely.

## 3. Obtain the admin chat ID

The UI stores a single chat ID. Most teams target either a private admin chat with the bot or a small team group.

1. Send a `/start` message to your bot from the admin chat (or add the bot to a group and send any message).
2. Call the Telegram `getUpdates` endpoint in your browser or via curl to discover the chat ID:

   ```bash
   curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates"
   ```

   In the JSON response look for `message.chat.id` and copy the numeric value (it may be negative for groups).

## 4. Save the chat ID in the admin UI

1. Start the Angular frontend with the proxy so it talks to the API:

   ```bash
   cd apps/web
   npm start
   ```

   The dev server reads `proxy.conf.json` and forwards `/api` requests to `http://localhost:3000` so the admin flow works locally.

2. Navigate to `http://localhost:4200/admin/telegram`.
3. Paste the chat ID into the **Telegram chat ID** field and click **Save**.
   - The page validates the format (digits with an optional leading dash).
   - Successful updates show a green toast and persist to `apps/server/src/data/settings.json`.

## 5. Trigger a notification test

1. Complete the customer flow in the UI (Landing → Order → Delivery → Review).
2. On the review screen, submit the order. The front end calls `/api/notifications/order`, which formats a localized summary and sends it to Telegram.
3. Confirm that the message appears in the configured chat.

If you need to rotate the bot token or target a different chat, repeat sections 2–4.
