# vercel-discord-webhook-translator

Vibe-coded translator from Vercel Webhook payloads to Discord Webhook message.

Prompt:
```
Set up a minimal TypeScript app. It's logic should be to receive a webhook in one format (an example of whose body you can see in `EXAMPLE_INPUT_FORMAT.json`) and translate it into `EXAMPLE_OUTPUT_FORMAT.json`).

The logic should be configurable by two environment variables:
* `TARGET_URL`, which is the location that the transformed data should be forwarded to
* `SECRET`, which is a secret that should be asserted for in the incoming requests' headers. If the secret is absent or incorrect, don't handle the incoming request.

The outgoing request should be a POST request, with headers "Accept: application/json" and "Content-Type: application/json"
```

I grabbed the `EXAMPLE_INPUT_FORMAT.json` by using ngrok and a(nother vibe-coded) logging server.
