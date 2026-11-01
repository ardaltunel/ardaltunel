const fs = require("node:fs");
const path = require("node:path");
const { generateReply, normalizeHistory, isAllowedOrigin } = require("../lib/chat-service.js");

const rateLimitBuckets = new Map();
const MAX_BODY_BYTES = 12000;
const fallbackContext = {
  identity: {
    name: "Arda Altunel",
    title: "Full Stack Developer",
    location: "Tuzla, İstanbul, Türkiye",
    summary: "Arda Altunel React, JavaScript, PHP, MySQL ve Supabase ile responsive web uygulamaları geliştiren, WEATRA deneyimine sahip bir Full Stack Developer.",
  },
  contact: {
    email: "arifardaaltunel@gmail.com",
    linkedin: "https://linkedin.com/in/ardaltunel/",
    github: "https://github.com/ardaltunel/",
    bionluk: "https://bionluk.com/ardaltunel",
  },
};

const jsonResponse = (response, statusCode, body) => {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
};

const readRequestBody = async (request) => {
  let rawBody;
  if (request.body !== undefined) {
    rawBody = typeof request.body === "string" ? request.body : JSON.stringify(request.body);
  } else {
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
      const buffer = Buffer.from(chunk);
      size += buffer.length;
      if (size > MAX_BODY_BYTES) throw new Error("Request body is too large");
      chunks.push(buffer);
    }
    rawBody = Buffer.concat(chunks).toString("utf8");
  }
  if (Buffer.byteLength(rawBody || "") > MAX_BODY_BYTES) throw new Error("Request body is too large");
  const body = JSON.parse(rawBody || "{}");
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid JSON object");
  return body;
};

const loadKnowledgeBase = () => {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, "..", "cache", "chatbot-context.json"), "utf8"));
  } catch {
    return fallbackContext;
  }
};

const isRateLimited = (request) => {
  const now = Date.now();
  const configuredLimit = Number(process.env.CHAT_RATE_LIMIT_PER_MINUTE || 12);
  const maxRequests = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : 12;
  const forwarded = request.headers["x-forwarded-for"];
  const key = String(Array.isArray(forwarded) ? forwarded[0] : forwarded || request.socket?.remoteAddress || "unknown").split(",")[0].trim();
  for (const [ip, bucket] of rateLimitBuckets) {
    if (bucket.resetAt <= now) rateLimitBuckets.delete(ip);
  }
  const bucket = rateLimitBuckets.get(key) || { count: 0, resetAt: now + 60000 };
  bucket.count += 1;
  if (!rateLimitBuckets.has(key) && rateLimitBuckets.size >= 10000) return true;
  rateLimitBuckets.set(key, bucket);
  return bucket.count > maxRequests;
};

module.exports = async (request, response) => {
  const origin = request.headers.origin;
  const corsAllowed = isAllowedOrigin(origin, process.env);
  response.setHeader("Vary", "Origin");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (origin && corsAllowed) response.setHeader("Access-Control-Allow-Origin", origin);

  if (!corsAllowed) return jsonResponse(response, 403, { error: "Origin is not allowed." });
  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
    return jsonResponse(response, 405, { error: "Only POST requests are supported." });
  }
  if (isRateLimited(request)) {
    response.setHeader("Retry-After", "60");
    return jsonResponse(response, 429, { error: "Too many messages. Please try again in a minute." });
  }

  let body;
  try {
    body = await readRequestBody(request);
  } catch {
    return jsonResponse(response, 400, { error: "Invalid or oversized JSON body." });
  }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return jsonResponse(response, 400, { error: "Message is required." });
  if (message.length > 500) return jsonResponse(response, 400, { error: "Message is too long." });

  const reply = await generateReply({
    message,
    history: normalizeHistory(body.history),
    knowledgeBase: loadKnowledgeBase(),
    env: process.env,
  });
  jsonResponse(response, 200, reply);
};
