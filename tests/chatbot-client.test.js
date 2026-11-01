const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../assets/js/main.js"), "utf8");

class Element {
    constructor() {
        this.children = [];
        this.handlers = {};
        this.style = {};
        this.dataset = {};
        this.textContent = "";
        this.classList = { add() {}, remove() {}, toggle() {} };
    }

    appendChild(child) {
        child.parent = this;
        this.children.push(child);
    }

    remove() {
        this.parent.children = this.parent.children.filter((child) => child !== this);
    }

    addEventListener(event, handler) { this.handlers[event] = handler; }
    setAttribute() {}
    focus() {}
}

const visibleText = (element) => element.textContent + element.children.map(visibleText).join("");
const flush = () => new Promise((resolve) => setImmediate(resolve));
const ok = (answer = "Arda bir geliştiricidir.") => ({ ok: true, json: async () => ({ answer }) });

function createChat({ hostname = "ardaltunel.vercel.app", metaEndpoint, override, metaFallbackEndpoint, fallbackOverride, fetchImpl = async () => ok() } = {}) {
    const panel = new Element();
    const messages = new Element();
    const input = new Element();
    const submitButton = new Element();
    const form = new Element();
    const chatbot = new Element();
    const timers = new Map();
    const requests = [];
    let timerId = 0;
    panel.hidden = false;
    form.querySelector = () => submitButton;
    const elements = {
        ".chatbot-panel": panel,
        ".chatbot-messages": messages,
        ".chatbot-form": form,
        "#chatbot-input": input,
    };
    chatbot.querySelector = (selector) => elements[selector] || null;
    chatbot.querySelectorAll = () => [];
    const document = {
        head: new Element(),
        body: new Element(),
        documentElement: new Element(),
        createElement: () => new Element(),
        createTextNode: (text) => Object.assign(new Element(), { textContent: text }),
        addEventListener() {},
        querySelectorAll: () => [],
        querySelector: (selector) => {
            if (selector === "[data-chatbot]") return chatbot;
            if (selector === 'meta[name="chat-api-url"]' && metaEndpoint) {
                return { getAttribute: () => metaEndpoint };
            }
            if (selector === 'meta[name="chat-fallback-api-url"]' && metaFallbackEndpoint) {
                return { getAttribute: () => metaFallbackEndpoint };
            }
            return null;
        },
    };
    const window = {
        location: { hostname, hash: "" },
        ARDA_CHAT_API_URL: override,
        ARDA_CHAT_FALLBACK_API_URL: fallbackOverride,
        matchMedia: (query) => ({ matches: query.includes("prefers-reduced-motion") }),
        addEventListener() {},
        setTimeout: (callback, delay) => {
            timers.set(++timerId, { callback, delay });
            return timerId;
        },
        clearTimeout: (id) => timers.delete(id),
    };
    vm.runInNewContext(source, {
        document,
        window,
        navigator: { userAgent: "test", maxTouchPoints: 0 },
        localStorage: { getItem: () => null },
        AbortController,
        fetch: (url, options) => {
            requests.push({ url, options });
            return fetchImpl(url, options);
        },
    });

    return {
        input, submitButton, messages, requests, timers,
        submit(message = "Arda kimdir?") {
            input.value = message;
            form.handlers.submit({ preventDefault() {} });
        },
        async settle() { await flush(); await flush(); },
    };
}

for (const [name, options, expected] of [
    ["same origin", {}, "/api/chat"],
    ["GitHub Pages", { hostname: "ardaltunel.github.io" }, "https://ardaltunel.vercel.app/api/chat"],
    ["meta override", { hostname: "ardaltunel.github.io", metaEndpoint: "https://example.com/chat" }, "https://example.com/chat"],
    ["window override", { metaEndpoint: "https://example.com/meta", override: "https://example.com/window" }, "https://example.com/window"],
]) {
    test(`uses the correct endpoint for ${name}`, async () => {
        const chat = createChat(options);
        chat.submit();
        await chat.settle();
        assert.equal(chat.requests[0].url, expected);
        assert.equal(visibleText(chat.messages.children.at(-1)), "Arda bir geliştiricidir.");
        assert.equal(chat.input.disabled, false);
        assert.equal(chat.submitButton.disabled, false);
        assert.equal(chat.timers.size, 0);
    });
}

for (const answer of [undefined, null, "", "   ", 12, { message: "invalid" }]) {
    test(`rejects invalid answer ${JSON.stringify(answer)}`, async () => {
        const chat = createChat({ fetchImpl: async () => ({ ok: true, json: async () => ({ answer }) }) });
        chat.submit();
        await chat.settle();
        assert.match(chat.messages.children.at(-1).className, /error/);
        assert.match(visibleText(chat.messages.children.at(-1)), /Şu anda yanıt alınamıyor/);
        assert.equal(chat.input.disabled, false);
        assert.equal(chat.timers.size, 0);
    });
}

test("rejects malformed JSON without presenting it as a successful answer", async () => {
    const chat = createChat({ fetchImpl: async () => ({ ok: true, json: async () => { throw new SyntaxError("bad JSON"); } }) });
    chat.submit();
    await chat.settle();
    assert.match(chat.messages.children.at(-1).className, /error/);
    assert.equal(chat.input.disabled, false);
});

test("preserves a friendly rate-limit message even when the response body is not JSON", async () => {
    const chat = createChat({ fetchImpl: async () => ({ ok: false, status: 429 }) });
    chat.submit();
    await chat.settle();
    assert.match(visibleText(chat.messages.children.at(-1)), /Bir dakika sonra/);
    assert.equal(chat.input.disabled, false);
    assert.equal(chat.requests.length, 1);
});

for (const phase of ["request", "response body"]) {
    test(`aborts a stalled primary ${phase} and succeeds using Cloudflare`, async () => {
        let attempt = 0;
        const chat = createChat({ fetchImpl: async (_url, { signal }) => {
            if (++attempt === 2) return ok("Yedek yanıt");
            const stalled = () => new Promise((_resolve, reject) => {
                signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
            });
            return phase === "request" ? stalled() : { ok: true, json: stalled };
        } });
        chat.submit();
        await chat.settle();
        assert.equal(chat.input.disabled, true);
        const timeout = [...chat.timers.values()].find((timer) => timer.delay === 18000);
        assert.ok(timeout);
        timeout.callback();
        await chat.settle();
        assert.equal(chat.requests[0].options.signal.aborted, true);
        assert.equal(visibleText(chat.messages.children.at(-1)), "Yedek yanıt");
        assert.equal(chat.requests.length, 2);
        assert.equal(chat.input.disabled, false);
        assert.equal(chat.submitButton.disabled, false);
        assert.equal(chat.timers.size, 0);
        assert.equal(chat.messages.children.length, 2);
    });
}

test("a network failure uses Turkish feedback and does not pollute later conversation history", async () => {
    let attempt = 0;
    const chat = createChat({ fetchImpl: async () => {
        if (++attempt <= 2) throw new Error("internal-network-detail");
        return ok();
    } });
    chat.submit("İlk soru");
    await chat.settle();
    assert.match(visibleText(chat.messages.children.at(-1)), /Şu anda yanıt alınamıyor/);
    assert.doesNotMatch(visibleText(chat.messages), /internal-network-detail/);
    chat.submit("İkinci soru");
    await chat.settle();
    assert.deepEqual(JSON.parse(chat.requests[2].options.body), { message: "İkinci soru", history: [] });
    chat.submit("Üçüncü soru");
    await chat.settle();
    assert.deepEqual(JSON.parse(chat.requests[3].options.body).history, [
        { role: "user", content: "İkinci soru" },
        { role: "assistant", content: "Arda bir geliştiricidir." },
    ]);
});

for (const status of [400, 401, 403, 429]) {
    test(`does not bypass HTTP ${status} by retrying against Cloudflare`, async () => {
        const chat = createChat({ fetchImpl: async () => ({ ok: false, status }) });
        chat.submit();
        await chat.settle();
        assert.equal(chat.requests.length, 1);
        assert.match(chat.messages.children.at(-1).className, /error/);
        assert.equal(chat.input.disabled, false);
    });
}

for (const failure of ["network", 404, 405, 500, 501, 502, 503, 504, "malformed JSON", "invalid answer"]) {
    test(`automatically uses the Cloudflare endpoint after ${failure}`, async () => {
        let attempt = 0;
        const chat = createChat({ fetchImpl: async () => {
            if (++attempt === 2) return ok("  Yedek\n  yanıt  ");
            if (failure === "network") throw new TypeError("Failed to fetch");
            if (failure === "malformed JSON") return { ok: true, json: async () => { throw new SyntaxError("bad JSON"); } };
            if (failure === "invalid answer") return ok(" ");
            return { ok: false, status: failure };
        } });
        chat.submit();
        await chat.settle();
        assert.deepEqual(chat.requests.map(({ url }) => url), [
            "/api/chat",
            "https://arda-ai-backup.arifardaaltunel.workers.dev/api/chat",
        ]);
        assert.equal(chat.requests[0].options.body, chat.requests[1].options.body);
        assert.equal(visibleText(chat.messages.children.at(-1)), "Yedek yanıt");
        assert.equal(chat.messages.children.length, 2);
        assert.equal(chat.input.disabled, false);
        assert.equal(chat.timers.size, 0);
    });
}

for (const [name, options, expected] of [
    ["meta", { metaFallbackEndpoint: "https://example.com/meta-backup" }, "https://example.com/meta-backup"],
    ["window", { metaFallbackEndpoint: "https://example.com/meta-backup", fallbackOverride: "https://example.com/window-backup" }, "https://example.com/window-backup"],
]) {
    test(`preserves the primary override and the ${name} fallback override`, async () => {
        const chat = createChat({
            ...options,
            override: "https://example.com/primary",
            fetchImpl: async () => ({ ok: false, status: 503 }),
        });
        chat.submit();
        await chat.settle();
        assert.deepEqual(chat.requests.map(({ url }) => url), ["https://example.com/primary", expected]);
    });
}

test("deduplicates primary and fallback URLs", async () => {
    const chat = createChat({ fallbackOverride: " /api/chat ", fetchImpl: async () => ({ ok: false, status: 503 }) });
    chat.submit();
    await chat.settle();
    assert.equal(chat.requests.length, 1);
});

test("recovers the UI when both primary and fallback requests time out", async () => {
    const chat = createChat({ fetchImpl: (_url, { signal }) => new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
    }) });
    chat.submit();
    [...chat.timers.values()].find((timer) => timer.delay === 18000).callback();
    await chat.settle();
    assert.equal(chat.requests.length, 2);
    assert.equal(chat.input.disabled, true);
    [...chat.timers.values()].find((timer) => timer.delay === 10000).callback();
    await chat.settle();
    assert.match(visibleText(chat.messages.children.at(-1)), /Yanıt beklenenden uzun sürdü/);
    assert.equal(chat.input.disabled, false);
    assert.equal(chat.submitButton.disabled, false);
    assert.equal(chat.messages.children.length, 2);
    assert.equal(chat.timers.size, 0);
});
