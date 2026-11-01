# Arda AI Cloudflare backup

Live endpoint: https://arda-ai-backup.arifardaaltunel.workers.dev/api/chat

This independent Worker uses the `AI` Workers AI binding and the same portfolio
knowledge and reply logic as the Vercel endpoint. It requires no OpenAI API key.
If inference fails or times out, the shared service answers from the portfolio
knowledge base. Proxying back to this endpoint is explicitly disabled inside the
Worker.

Deploy from the repository root with Wrangler 4.36 or later:

```sh
npx wrangler login
npx wrangler deploy --config cloudflare/wrangler.jsonc
```

The configuration targets Arda's existing Cloudflare account. Change `account_id`
and the frontend backup URL when deploying a separate copy. API credentials belong
in Wrangler's local authentication store or CI secrets, never in frontend files.

`POST /api/chat` accepts `{ "message": "Arda kimdir?", "history": [] }`.
Messages must be strings of at most 500 characters; JSON bodies are capped at
12,000 bytes. Only the shared allowed origins receive CORS access. Responses are
marked `Cache-Control: no-store`.

The `CHAT_RATE_LIMITER` binding allows approximately 12 requests per minute per
client IP in each Cloudflare location. Requests proxied by Vercel share its egress
IP. A limiter outage returns 503; it never disables protection. The bounded
in-memory limiter is only a fallback for environments without that binding.

`cache/chatbot-context.json` is bundled into the Worker. Redeploy after updating
that file or the shared service. The Worker uses
`@cf/meta/llama-3.1-8b-instruct-fp8`; its model can be changed through
`CLOUDFLARE_AI_MODEL` in the Wrangler configuration.
