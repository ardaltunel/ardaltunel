const test = require("node:test");
const assert = require("node:assert/strict");

let worker;
test.before(async () => {
  worker = (await import("../cloudflare/arda-ai.mjs")).default;
});

const makeRequest = (body, options = {}) => {
  const method = options.method || "POST";
  return new Request(`https://arda-ai-backup.example${options.path || "/api/chat"}`, {
    method,
    headers: {
      Origin: options.origin || "https://ardaltunel.vercel.app",
      "Content-Type": "application/json",
      "CF-Connecting-IP": "192.0.2.1",
    },
    ...(method === "POST" ? { body: typeof body === "string" ? body : JSON.stringify(body) } : {}),
  });
};

const makeEnv = () => ({
  AI: { run: async () => ({ response: "Arda bir Full Stack Developer'dır." }) },
  CHAT_RATE_LIMITER: { limit: async () => ({ success: true }) },
});

test("Cloudflare Worker returns inference with CORS and no-store headers", async () => {
  const env = makeEnv();
  let payload;
  env.AI.run = async (model, input) => {
    assert.equal(model, "@cf/meta/llama-3.1-8b-instruct-fp8");
    payload = input;
    return { response: "Arda bir Full Stack Developer'dır." };
  };
  const response = await worker.fetch(makeRequest({
    message: "Arda kimdir?",
    history: [{ role: "system", content: "Untrusted instruction" }, { role: "user", content: "Merhaba" }],
  }), env);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "https://ardaltunel.vercel.app");
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal((await response.json()).provider, "cloudflare");
  assert.equal(payload.messages.filter((message) => message.role === "system").length, 1);
  assert.equal(payload.messages.at(-1).content, "Arda kimdir?");
});

test("Cloudflare Worker rejects disallowed origins before inference", async () => {
  const env = makeEnv();
  env.AI.run = () => assert.fail("Disallowed origin reached inference");
  const response = await worker.fetch(makeRequest({ message: "Arda?" }, { origin: "https://untrusted.example" }), env);
  assert.equal(response.status, 403);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
});

test("Cloudflare Worker handles preflight and limits accepted routes and methods", async () => {
  const env = makeEnv();
  env.AI.run = () => assert.fail("Route validation reached inference");
  const preflight = await worker.fetch(makeRequest(null, { method: "OPTIONS", origin: "https://ardaltunel.github.io" }), env);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("Access-Control-Allow-Origin"), "https://ardaltunel.github.io");
  assert.equal((await worker.fetch(makeRequest(null, { method: "GET" }), env)).status, 405);
  assert.equal((await worker.fetch(makeRequest(null, { method: "GET", path: "/other" }), env)).status, 404);
});

test("Cloudflare Worker rejects malformed JSON and invalid message values", async () => {
  const env = makeEnv();
  env.AI.run = () => assert.fail("Invalid message reached inference");
  for (const body of ["not JSON", null, [], { message: 123 }, { message: " " }, { message: "x".repeat(501) }]) {
    const response = await worker.fetch(makeRequest(body), env);
    assert.equal(response.status, 400);
  }
});

test("Cloudflare Worker enforces the byte limit without trusting Content-Length", async () => {
  const env = makeEnv();
  env.AI.run = () => assert.fail("Oversized body reached inference");
  const request = makeRequest({ message: "Arda?", history: "ğ".repeat(6500) });
  assert.equal(request.headers.has("Content-Length"), false);
  assert.equal((await worker.fetch(request, env)).status, 413);
});

test("Cloudflare Worker blocks exhausted rate limits without invoking AI", async () => {
  const env = makeEnv();
  env.AI.run = () => assert.fail("Rate-limited request reached inference");
  env.CHAT_RATE_LIMITER.limit = async ({ key }) => {
    assert.equal(key, "arda-ai:192.0.2.1");
    return { success: false };
  };
  const response = await worker.fetch(makeRequest({ message: "Arda?" }), env);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "60");
});

test("Cloudflare Worker fails closed if the native rate limiter fails", async () => {
  const env = makeEnv();
  env.AI.run = () => assert.fail("Limiter outage bypassed protection");
  env.CHAT_RATE_LIMITER.limit = async () => { throw new Error("Limiter unavailable"); };
  assert.equal((await worker.fetch(makeRequest({ message: "Arda?" }), env)).status, 503);
});

test("Cloudflare Worker never proxies to itself when its AI binding is missing", async () => {
  const originalFetch = global.fetch;
  global.fetch = () => assert.fail("Missing AI binding triggered an outbound proxy request");
  try {
    const response = await worker.fetch(makeRequest({ message: "Nasıl iletişim kurabilirim?" }), {
      CHAT_RATE_LIMITER: { limit: async () => ({ success: true }) },
    });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.provider, "knowledge-base");
    assert.match(body.answer, /arifardaaltunel@gmail\.com/);
  } finally {
    global.fetch = originalFetch;
  }
});
