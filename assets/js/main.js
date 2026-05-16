(function () {
    "use strict";

    const navFixStyle = document.createElement("style");
    navFixStyle.textContent = `
        .nav-links a:hover:not(.is-active) {
            background: transparent !important;
            color: var(--text) !important;
            transform: none !important;
        }

        .nav-links a.is-active {
            color: var(--text) !important;
            background: var(--surface-hover) !important;
            transform: translateY(-1px) !important;
        }
    `;
    document.head.appendChild(navFixStyle);

    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");
    const themeToggle = document.querySelector(".theme-toggle");
    const siteHeader = document.querySelector(".site-header");
    const codeBlock = document.querySelector(".code-window code");
    const links = document.querySelectorAll(".nav-links a");
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    const sections = [...document.querySelectorAll("main section[id]")];
    const storedTheme = localStorage.getItem("theme");
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const hasTouch = navigator.maxTouchPoints > 0;
    const isSafari = /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(navigator.userAgent);
    const isDesktopSafari = isSafari && finePointer && !hasTouch;

    document.documentElement.classList.toggle("is-desktop-safari", isDesktopSafari);

    const headerOffset = () => (siteHeader ? siteHeader.offsetHeight : 0) + 18;

    const setActiveLink = (activeId) => {
        links.forEach((link) => {
            link.classList.toggle("is-active", Boolean(activeId) && link.getAttribute("href") === `#${activeId}`);
        });
    };

    const setTheme = (theme) => {
        const isLight = theme === "light";

        document.body.dataset.theme = theme;

        if (themeToggle) {
            themeToggle.setAttribute("aria-pressed", String(isLight));
            themeToggle.setAttribute("aria-label", isLight ? "Koyu temaya geç" : "Açık temaya geç");
            themeToggle.innerHTML = isLight ? '<i class="bi bi-moon"></i>' : '<i class="bi bi-sun"></i>';
        }
    };

    setTheme(storedTheme || (prefersLight ? "light" : "dark"));

    const updateActiveNav = () => {
        if (!sections.length || !links.length) {
            return;
        }

        const scrollPoint = window.scrollY + headerOffset() + 30;
        const pageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        const firstSectionTop = sections[0].offsetTop;
        let activeId = "";

        if (window.scrollY < firstSectionTop - headerOffset() - 80) {
            setActiveLink("");
            return;
        }

        if (pageBottom) {
            activeId = sections[sections.length - 1].id;
        } else {
            for (const section of sections) {
                if (section.offsetTop <= scrollPoint) {
                    activeId = section.id;
                }
            }
        }

        setActiveLink(activeId);
    };

    const updateScrollState = () => {
        if (siteHeader) {
            siteHeader.classList.toggle("is-scrolled", window.scrollY > 18);
        }

        updateActiveNav();
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
            localStorage.setItem("theme", nextTheme);
            setTheme(nextTheme);
        });
    }

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("is-open");
            document.body.classList.toggle("nav-open", isOpen);
            navToggle.setAttribute("aria-expanded", String(isOpen));
            navToggle.setAttribute("aria-label", isOpen ? "Menüyü kapat" : "Menüyü aç");
            navToggle.innerHTML = isOpen ? '<i class="bi bi-x"></i>' : '<i class="bi bi-list"></i>';
        });
    }

    const closeMobileNav = () => {
        if (!navLinks || !navToggle) {
            return;
        }

        navLinks.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Menüyü aç");
        navToggle.innerHTML = '<i class="bi bi-list"></i>';
    };

    const cleanHash = () => {
        if (window.location.hash) {
            history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
        }
    };

    const scrollToTarget = (target) => {
        const top = target === document.body ? 0 : target.getBoundingClientRect().top + window.scrollY - headerOffset();
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    };

    anchorLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");
            const target = targetId === "#top" ? document.body : document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();
            closeMobileNav();
            scrollToTarget(target);
            setActiveLink(targetId.replace("#", ""));
            window.setTimeout(updateActiveNav, 450);
            cleanHash();
        });
    });

    if (window.location.hash) {
        const initialTarget = document.querySelector(window.location.hash);

        if (initialTarget) {
            window.setTimeout(() => {
                scrollToTarget(initialTarget);
                updateScrollState();
                cleanHash();
            }, 0);
        } else {
            cleanHash();
        }
    }

    window.addEventListener("hashchange", () => {
        const hashTarget = window.location.hash ? document.querySelector(window.location.hash) : null;

        if (hashTarget) {
            scrollToTarget(hashTarget);
            window.setTimeout(updateScrollState, 260);
        }

        cleanHash();
    });

    const chatbot = document.querySelector("[data-chatbot]");

    if (chatbot) {
        const toggle = chatbot.querySelector(".chatbot-toggle");
        const panel = chatbot.querySelector(".chatbot-panel");
        const closeButton = chatbot.querySelector(".chatbot-close");
        const messages = chatbot.querySelector(".chatbot-messages");
        const form = chatbot.querySelector(".chatbot-form");
        const input = chatbot.querySelector("#chatbot-input");
        const submitButton = form ? form.querySelector("button[type='submit']") : null;
        const suggestions = chatbot.querySelectorAll(".chatbot-suggestions button");
        const conversation = [];
        let isSending = false;

        const getChatEndpoint = () => {
            const metaEndpoint = document.querySelector('meta[name="chat-api-url"]')?.getAttribute("content") || "";
            return window.ARDA_CHAT_API_URL || metaEndpoint || "/api/chat";
        };

        const setPanelOpen = (isOpen) => {
            if (!panel || !toggle) {
                return;
            }

            panel.hidden = !isOpen;
            toggle.setAttribute("aria-expanded", String(isOpen));
            toggle.setAttribute("aria-label", isOpen ? "Arda AI sohbetini kapat" : "Arda AI sohbetini aç");
            toggle.innerHTML = isOpen
                ? '<i class="bi bi-x-lg"></i>'
                : '<i class="bi bi-chat-dots"></i><span class="chatbot-pulse" aria-hidden="true"></span>';

            if (isOpen && input) {
                window.setTimeout(() => input.focus(), 80);
            }
        };

        const scrollMessages = () => {
            if (messages) {
                messages.scrollTop = messages.scrollHeight;
            }
        };

        const appendTextWithLinks = (container, text) => {
            const pattern = /(https?:\/\/[^\s)]+|mailto:[^\s)]+|[\w.+-]+@[\w-]+\.[\w.-]+)/g;
            let lastIndex = 0;

            String(text).replace(pattern, (match, _value, offset) => {
                if (offset > lastIndex) {
                    container.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
                }

                const link = document.createElement("a");
                const href = match.includes("@") && !match.startsWith("mailto:") ? `mailto:${match}` : match;
                link.href = href;
                link.textContent = match.replace(/^mailto:/, "");
                link.target = href.startsWith("http") ? "_blank" : "";
                link.rel = href.startsWith("http") ? "noopener nofollow" : "";
                container.appendChild(link);
                lastIndex = offset + match.length;
                return match;
            });

            if (lastIndex < text.length) {
                container.appendChild(document.createTextNode(text.slice(lastIndex)));
            }
        };

        const addMessage = (role, text, options = {}) => {
            if (!messages) {
                return null;
            }

            const item = document.createElement("div");
            const paragraph = document.createElement("p");
            item.className = `chatbot-message ${role}${options.error ? " error" : ""}`;

            if (options.typing) {
                const typing = document.createElement("span");
                typing.className = "chatbot-typing";
                typing.setAttribute("aria-label", "Yanıt hazırlanıyor");
                typing.innerHTML = "<span></span><span></span><span></span>";
                paragraph.appendChild(typing);
            } else {
                appendTextWithLinks(paragraph, text);
            }

            item.appendChild(paragraph);
            messages.appendChild(item);
            scrollMessages();
            return item;
        };

        const setSending = (state) => {
            isSending = state;

            if (input) {
                input.disabled = state;
            }

            if (submitButton) {
                submitButton.disabled = state;
            }
        };

        const autoResizeInput = () => {
            if (!input) {
                return;
            }

            input.style.height = "auto";
            input.style.height = `${Math.min(input.scrollHeight, 118)}px`;
        };

        const userFriendlyError = (status) => {
            if ([404, 405, 501].includes(status)) {
                return "Chatbot backend'i henüz yapılandırılmamış görünüyor. Site Vercel üzerinde /api/chat ile yayınlandığında veya chat API adresi tanımlandığında çalışır.";
            }

            if (status === 429) {
                return "Çok kısa sürede fazla mesaj gönderdin. Bir dakika sonra tekrar deneyebilirsin.";
            }

            return "Şu anda yanıt alınamıyor. Biraz sonra tekrar deneyebilir veya iletişim bölümünden Arda'ya ulaşabilirsin.";
        };

        const sendMessage = async (value) => {
            const message = String(value || "").trim();

            if (!message || isSending) {
                return;
            }

            const history = conversation.slice(-6);
            addMessage("user", message);
            conversation.push({ role: "user", content: message });
            setSending(true);

            if (input) {
                input.value = "";
                autoResizeInput();
            }

            const typingMessage = addMessage("bot", "", { typing: true });

            try {
                const response = await fetch(getChatEndpoint(), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ message, history }),
                });
                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(userFriendlyError(response.status));
                }

                if (typingMessage) {
                    typingMessage.remove();
                }

                const answer =
                    data.answer ||
                    "Bu konuda site içeriğinde net bir bilgi bulamadım. İletişim bölümünden Arda ile doğrudan görüşebilirsin.";
                addMessage("bot", answer);
                conversation.push({ role: "assistant", content: answer });
            } catch (error) {
                if (typingMessage) {
                    typingMessage.remove();
                }

                addMessage("bot", error.message || userFriendlyError(), { error: true });
            } finally {
                setSending(false);

                if (input && !panel.hidden) {
                    input.focus();
                }
            }
        };

        if (toggle) {
            toggle.addEventListener("click", () => {
                setPanelOpen(panel ? panel.hidden : false);
            });
        }

        if (closeButton) {
            closeButton.addEventListener("click", () => setPanelOpen(false));
        }

        suggestions.forEach((button) => {
            button.addEventListener("click", () => {
                setPanelOpen(true);
                sendMessage(button.textContent);
            });
        });

        if (input) {
            input.addEventListener("input", autoResizeInput);
            input.addEventListener("keydown", (event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    form.requestSubmit();
                }
            });
        }

        if (form) {
            form.addEventListener("submit", (event) => {
                event.preventDefault();
                sendMessage(input ? input.value : "");
            });
        }

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && panel && !panel.hidden) {
                setPanelOpen(false);
            }
        });
    }

    if (!reduceMotion) {
        const revealItems = [
            ".section-heading",
            ".lead-block",
            ".value-grid article",
            ".project-card",
            ".github-card",
            ".service-card",
            ".skill-panel",
            ".timeline article",
            ".note-grid a",
            ".contact-shell"
        ];

        document.querySelectorAll(revealItems.join(",")).forEach((item, index) => {
            item.classList.add("reveal");
            item.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 55}ms`);
        });

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: "0px 0px -12% 0px",
            threshold: 0.12
        });

        document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

        const interactiveCards = document.querySelectorAll(".project-card, .github-card, .service-card, .note-grid a, .hero-panel");
        const enablePointerEffects = !reduceMotion && !isDesktopSafari;

        if (enablePointerEffects) {
            interactiveCards.forEach((card) => {
                card.classList.add("tilt-card");

                card.addEventListener("mousemove", (event) => {
                    const rect = card.getBoundingClientRect();
                    const x = event.clientX - rect.left;
                    const y = event.clientY - rect.top;
                    const rotateY = ((x / rect.width) - 0.5) * 7;
                    const rotateX = -((y / rect.height) - 0.5) * 7;

                    card.style.setProperty("--spot-x", `${(x / rect.width) * 100}%`);
                    card.style.setProperty("--spot-y", `${(y / rect.height) * 100}%`);
                    card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
                });

                card.addEventListener("mouseleave", () => {
                    card.style.transform = "";
                });
            });

            document.querySelectorAll(".btn-primary, .btn-secondary, .theme-toggle, .nav-toggle").forEach((button) => {
                button.addEventListener("mousemove", (event) => {
                    const rect = button.getBoundingClientRect();
                    const x = (event.clientX - rect.left - rect.width / 2) * 0.18;
                    const y = (event.clientY - rect.top - rect.height / 2) * 0.18;

                    button.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
                });

                button.addEventListener("mouseleave", () => {
                    button.style.transform = "";
                });
            });

            let pointerFrame = null;

            window.addEventListener("pointermove", (event) => {
                document.body.classList.add("is-pointer-active");

                if (pointerFrame) {
                    cancelAnimationFrame(pointerFrame);
                }

                pointerFrame = requestAnimationFrame(() => {
                    document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
                    document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
                });
            }, { passive: true });
        }

        if (codeBlock) {
            const originalCode = codeBlock.textContent;
            codeBlock.textContent = "";

            let index = 0;
            const typeCode = () => {
                codeBlock.textContent = originalCode.slice(0, index);
                index += 1;

                if (index <= originalCode.length) {
                    window.setTimeout(typeCode, index < 24 ? 22 : 11);
                }
            };

            window.setTimeout(typeCode, 420);
        }
    } else {
        document.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
    }
})();
