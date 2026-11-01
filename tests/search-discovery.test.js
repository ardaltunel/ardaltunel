const test = require("node:test");
const assert = require("node:assert/strict");

let createIndexNowPayload, submitIndexNow, main, config;
test.before(async () => {
  ({ createIndexNowPayload, submitIndexNow, main } = await import("../scripts/submit-indexnow.mjs"));
  ({ indexNowConfig: config } = await import("../content/search-discovery.mjs"));
});
const xml = (...urls) => `<urlset>${urls.map((url) => `<url><loc>${url}</loc></url>`).join("")}</urlset>`;
const home = "https://ardaltunel.vercel.app/";

test("IndexNow payload keeps canonical public URLs and deduplicates the sitemap", () => {
  const payload = createIndexNowPayload(xml(home, home + "projeler/", home));
  assert.deepEqual(payload, { ...config, urlList: [home, home + "projeler/"] });
});

test("IndexNow rejects foreign hosts, credentials, noncanonical and internal URLs", () => {
  for (const url of [
    "http://ardaltunel.vercel.app/", "https://unrelated.example/", "https://user@ardaltunel.vercel.app/",
    home + "?tracking=1", home + "#hakkimda", home + "index.html", home + "projeler",
    home + "cache/", home + "api/", home + "assets/", home + "projeler/../", home + "%70rojeler/",
  ]) assert.throws(() => createIndexNowPayload(xml(url)), /canonical public HTML/);
  assert.throws(() => createIndexNowPayload("<urlset></urlset>"), /1–10,000/);
});

for (const status of [200, 202]) {
  test(`IndexNow verifies the public key before accepting HTTP ${status} as a receipt`, async () => {
    const payload = createIndexNowPayload(xml(home));
    const calls = [];
    const result = await submitIndexNow(payload, { fetchImpl: async (url, request) => {
      calls.push({ url, request });
      return calls.length === 1 ? new Response(config.key) : new Response(null, { status });
    } });
    assert.equal(calls[0].url, config.keyLocation);
    assert.equal(calls[0].request.method, "GET");
    assert.equal(calls[1].url, "https://api.indexnow.org/indexnow");
    assert.equal(calls[1].request.method, "POST");
    assert.deepEqual(JSON.parse(calls[1].request.body), payload);
    assert.equal(result.status, status);
    assert.equal(result.verificationPending, status === 202);
    assert.match(result.message, /does not guarantee/);
  });
}

test("IndexNow never submits if ownership proof does not match exactly", async () => {
  let calls = 0;
  await assert.rejects(submitIndexNow(createIndexNowPayload(xml(home)), {
    fetchImpl: async () => { calls += 1; return new Response(config.key + "\n"); },
  }), /does not exactly match/);
  assert.equal(calls, 1);
});

test("IndexNow validates direct-call URL lists before any request", async () => {
  const payload = createIndexNowPayload(xml(home));
  await assert.rejects(submitIndexNow({ ...payload, urlList: [home + "</loc><loc>" + home] }, {
    fetchImpl: () => assert.fail("Invalid direct-call URLs reached the network"),
  }), /canonical public HTML/);
});

test("IndexNow rejects a provider error instead of reporting successful indexing", async () => {
  let calls = 0;
  await assert.rejects(submitIndexNow(createIndexNowPayload(xml(home)), {
    fetchImpl: async () => ++calls === 1 ? new Response(config.key) : new Response(null, { status: 403 }),
  }), (error) => error.status === 403 && /ownership verification rejected/.test(error.message));
});

test("IndexNow deadline includes reading a stalled ownership response body", async () => {
  const result = submitIndexNow(createIndexNowPayload(xml(home)), {
    timeoutMs: 10,
    fetchImpl: async () => ({ status: 200, text: () => new Promise(() => {}) }),
  });
  await assert.rejects(result, (error) => error.name === "TimeoutError");
});

test("IndexNow dry run validates generated pages without any network request", async () => {
  const messages = [];
  const result = await main(["--dry-run"], {
    fetchImpl: () => assert.fail("Dry run attempted a network request"),
    output: (message) => messages.push(message),
  });
  assert.equal(result.dryRun, true);
  assert.equal(result.networkRequests, 0);
  assert.ok(result.urlCount >= 4);
  assert.equal(messages.length, 1);
});
