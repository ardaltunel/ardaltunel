import knowledgeBase from "../cache/chatbot-context.json" with { type: "json" };
import chatService from "../lib/chat-service.js";

const { generateReply, normalizeHistory, isAllowedOrigin } = chatService;
const MAX_BODY_BYTES = 12000;
const localRateLimits = new Map();

const jsonResponse = (status, body, headers) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  },
});

const readBody = async (request) => {
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
    throw Object.assign(new Error("Request body is too large."), { status: 413 });
  }

  const reader = request.body?.getReader();
  if (!reader) {
    throw Object.assign(new Error("Invalid JSON body."), { status: 400 });
  }

  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw Object.assign(new Error("Request body is too large."), { status: 413 });
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw Object.assign(new Error("Invalid JSON body."), { status: 400 });
  }
};

const isRateLimited = async (request, env) => {
  const key = `arda-ai:${request.headers.get("cf-connecting-ip") || "unknown"}`;
  if (env.CHAT_RATE_LIMITER) {
    // Binding failures are handled as a service error, never as permission to skip the limit.
    const result = await env.CHAT_RATE_LIMITER.limit({ key });
    if (typeof result?.success !== "boolean") throw new Error("Rate limiter unavailable.");
    return !result.success;
  }

  // Local development fallback. Production uses the shared Cloudflare binding below.
  const now = Date.now();
  for (const [ip, bucket] of localRateLimits) {
    if (bucket.resetAt <= now) localRateLimits.delete(ip);
  }
  const bucket = localRateLimits.get(key);
  if (bucket) {
    bucket.count += 1;
    return bucket.count > 12;
  }
  if (localRateLimits.size >= 5000) return true;
  localRateLimits.set(key, { count: 1, resetAt: now + 60000 });
  return false;
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const allowed = isAllowedOrigin(origin, env);
    const headers = {
      "Cache-Control": "no-store",
      "Vary": "Origin",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (origin && allowed) headers["Access-Control-Allow-Origin"] = origin;

    if (!allowed) return jsonResponse(403, { error: "Origin is not allowed." }, headers);
    if (new URL(request.url).pathname !== "/api/chat") {
      return jsonResponse(404, { error: "Not found." }, headers);
    }
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") {
      return jsonResponse(405, { error: "Only POST requests are supported." }, {
        ...headers,
        Allow: "POST, OPTIONS",
      });
    }

    let body;
    try {
      body = await readBody(request);
    } catch (error) {
      return jsonResponse(error.status || 400, { error: error.message || "Invalid request body." }, headers);
    }
    if (!body || Array.isArray(body) || typeof body !== "object" || typeof body.message !== "string") {
      return jsonResponse(400, { error: "Message must be a string." }, headers);
    }
    const message = body.message.trim();
    if (!message || message.length > 500) {
      return jsonResponse(400, { error: message ? "Message is too long." : "Message is required." }, headers);
    }

    try {
      if (await isRateLimited(request, env)) {
        return jsonResponse(429, { error: "Too many messages. Please try again in a minute." }, {
          ...headers,
          "Retry-After": "60",
        });
      }

      const result = await generateReply({
        message,
        history: normalizeHistory(body.history),
        knowledgeBase,
        env,
        ai: env.AI,
        allowProxy: false,
      });
      return jsonResponse(200, result, headers);
    } catch (error) {
      console.error("Cloudflare chat unavailable", error?.name || "Error");
      return jsonResponse(503, { error: "Chat service is temporarily unavailable." }, headers);
    }
  },
};
