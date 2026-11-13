// Display copy for every integration: card text, guide steps and credential fields.
export const INTEGRATION_CATALOG = [
  {
    id: "ai",
    name: "Claude / AI",
    requirement: "Required",
    blurb: "Powers ideation, thumbnail direction, channel analysis and the Discord agent.",
    minutes: "~2 min",
    intro:
      "Your AI runs on the Base44 AI gateway that comes with the app, so there is no Anthropic account or key to paste. One test confirms every AI feature can reach it.",
    steps: [
      {
        title: "Nothing to install",
        body: "The gateway is already wired into every AI call: ideation chats, thumbnail direction, client channel analysis, title and idea suggestions, and the Discord status agent. It bills to your app's AI credits.",
      },
      {
        title: "Run the check",
        body: "Press Test Connection below. A one-word prompt goes through the same path the features use, so a pass means all of them are ready.",
      },
    ],
    note: "Heavier AI work — thumbnail direction, channel analysis, the Discord scan — uses more integration credits than a plain reply.",
    fields: [],
  },
  {
    id: "higgsfield",
    name: "Higgsfield",
    requirement: "Recommended",
    blurb: "Renders the thumbnail images the AI writes the direction for.",
    minutes: "~3 min",
    intro:
      "Higgsfield turns the AI's image prompt into a finished 4K thumbnail. You need the key ID and the secret that come as a pair.",
    steps: [
      {
        title: "Create an API key",
        body: "Sign in to the Higgsfield cloud dashboard, open API keys and create a new key. Copy both the key ID and the secret now — the secret is only shown once.",
        code: "cloud.higgsfield.ai  →  API keys  →  Create key",
      },
      {
        title: "Paste both values",
        body: "Add the key ID and the secret in the fields below. Both are stored on this app's private settings, never in the browser.",
      },
      {
        title: "Test the credentials",
        body: "Press Test Connection. Higgsfield answers with a live authenticated call, so a pass means generation will work.",
      },
    ],
    note: "Thumbnails need the AI integration as well: the AI writes the direction and prompt, Higgsfield renders the image.",
    fields: [
      { key: "apiKey", label: "Key ID", placeholder: "key_…" },
      { key: "apiSecret", label: "Secret", placeholder: "••••••••" },
    ],
  },
  {
    id: "youtube",
    name: "YouTube Data API",
    requirement: "Recommended",
    blurb: "Pulls views, subscribers and recent uploads for each client channel.",
    minutes: "~5 min",
    intro:
      "Analytics reads public channel numbers straight from Google. Watch time and CTR aren't exposed by the public API, so those stay on manual snapshots.",
    steps: [
      {
        title: "Open the YouTube Data API page",
        body: "Sign in to Google Cloud Console with the account that should own the key.",
        code: "https://console.cloud.google.com/apis/library/youtube.googleapis.com",
      },
      {
        title: "Enable the API",
        body: "Pick or create a project, then press Enable on the YouTube Data API v3 page. Wait a minute for it to propagate.",
      },
      {
        title: "Create an API key",
        body: "Go to APIs & Services → Credentials → Create credentials → API key.",
        code: "APIs & Services  →  Credentials  →  Create credentials  →  API key",
      },
      {
        title: "Leave the key unrestricted",
        body: "The key must have no website or IP restrictions — the app reads YouTube from a server, so restricted keys are rejected.",
      },
      {
        title: "Paste the key and test",
        body: "Add the key below and press Test Connection. It runs a live channel lookup against YouTube.",
      },
    ],
    note: "Each channel pull costs quota. 10,000 units a day is enough for roughly 40 channel syncs.",
    fields: [{ key: "apiKey", label: "API key", placeholder: "AIza…" }],
  },
  {
    id: "discord",
    name: "Discord bot",
    requirement: "Recommended",
    blurb: "Keeps every client's production stage current from the team's Discord servers.",
    minutes: "~5 min",
    intro:
      "A bot reads recent messages in each client's server so the status agent can work out which production stage that client is at, and posts a message to your team channel whenever a client reaches In review or Published. Sending messages is the only thing it can do there.",
    steps: [
      {
        title: "Create the application",
        body: "Open the Discord developer portal and press New Application. Name it anything, e.g. Agency Status Agent.",
        code: "https://discord.com/developers/applications",
      },
      {
        title: "Turn on MESSAGE CONTENT INTENT",
        body: "On the Bot page, scroll to Privileged Gateway Intents and switch Message Content Intent on, then save. Without it the bot receives messages with empty text.",
        code: "Bot  →  Privileged Gateway Intents  →  MESSAGE CONTENT INTENT  ✅",
      },
      {
        title: "Give it the permissions it needs",
        body: "Invite the bot with View Channels, Read Message History and Send Messages — enough to read the client servers and post in your team channel, and nothing more.",
        code: "permissions=68608",
      },
      {
        title: "Invite it into each client server",
        body: "Name each Discord server after its client in this app (for example “Peak Form Fitness”). Servers are matched to clients by name, so there are no server IDs to paste.",
      },
      {
        title: "Add your team channel ID",
        body: "In Discord open Settings → Advanced → Developer Mode, right-click the channel that should receive the updates and choose Copy Channel ID. Paste it in the second field.",
        code: "Channel  →  right-click  →  Copy Channel ID",
      },
      {
        title: "Paste the bot token and test",
        body: "Bot → Reset Token → Copy, then paste it below. The test reports the bot name and how many servers it can see.",
      },
    ],
    note: "The status agent runs every ~30 minutes and writes each matched client's stage. Whenever a stage becomes In review or Published, a notification is posted to your team channel.",
    fields: [
      { key: "botToken", label: "Bot token", placeholder: "MTIz…" },
      { key: "teamChannelId", label: "Team channel ID", placeholder: "1234567890123456789" },
    ],
  },
  {
    id: "notion",
    name: "Notion",
    requirement: "Optional",
    blurb: "Optional token for pulling client docs and briefs from a Notion workspace.",
    minutes: "~4 min",
    intro: "Optional. Nothing in the app depends on Notion yet — connect it only if you keep client docs and briefs there.",
    steps: [
      {
        title: "Create an internal integration",
        body: "Open your Notion integrations, press New integration, and give it read access.",
        code: "https://www.notion.so/my-integrations",
      },
      {
        title: "Copy the secret",
        body: "On the integration page, copy the Internal Integration Secret.",
      },
      {
        title: "Share the pages you need",
        body: "In Notion, open a page → ••• → Connections → add your integration. Only shared pages are visible to it.",
      },
      {
        title: "Paste the token and test",
        body: "Add the token below and press Test Connection to confirm Notion accepts it.",
      },
    ],
    note: "Optional integration — skipping it leaves the rest of the workspace untouched.",
    fields: [{ key: "token", label: "Internal integration token", placeholder: "secret_…" }],
  },
];

export const catalogById = Object.fromEntries(INTEGRATION_CATALOG.map((entry) => [entry.id, entry]));