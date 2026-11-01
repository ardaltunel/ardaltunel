// Decorative, code-native graphics. Real project previews use existing captured assets.
const dots = '<span></span><span></span><span></span>';
const bars = (count) => "<i></i>".repeat(count);

export const visualIdentity = () => `<div class="portfolio-art is-identity" aria-hidden="true">
    <div class="portfolio-art-grid"></div>
    <div class="portfolio-orbit"><span></span><span></span></div>
    <div class="portfolio-id-pass">
        <div class="portfolio-id-top"><span>&lt;/&gt;</span><span>DEVELOPER PROFILE</span></div>
        <div class="portfolio-id-mark">AA</div>
        <div class="portfolio-id-name">Arda Altunel</div>
        <div class="portfolio-id-role">FULL STACK DEVELOPER</div>
        <div class="portfolio-id-footer"><span>İSTANBUL / TR</span><span class="portfolio-barcode">${"<i></i>".repeat(15)}</span></div>
    </div>
    <pre class="portfolio-code-slip"><code>const profile = {
  name: "Arda Altunel",
  focus: ["Frontend", "Backend"]
};</code></pre>
    <div class="portfolio-art-chip is-one"><b>&lt;/&gt;</b><span>Frontend</span></div>
    <div class="portfolio-art-chip is-two"><b>{ }</b><span>Backend</span></div>
</div>`;

const projectWindow = (position, slug, title, width, height) => `<div class="portfolio-art-window is-${position}">
    <div class="portfolio-art-windowbar"><span class="portfolio-window-dots">${dots}</span><span class="portfolio-art-windowtitle">${title}</span></div>
    <img src="/assets/img/projects/${slug}.webp" width="${width}" height="${height}" alt="" loading="${position === "main" ? "eager" : "lazy"}" decoding="async"${position === "main" ? ' fetchpriority="high"' : ""}>
</div>`;

export const visualProjects = () => `<div class="portfolio-art is-projects" aria-hidden="true">
    <div class="portfolio-art-grid"></div>
    ${projectWindow("back", "blog-platformu", "Blog Platformu", 1000, 625)}
    ${projectWindow("main", "omni-tools", "Omni Tools", 1000, 625)}
    ${projectWindow("front", "emlak-kraliceleri", "Emlak Kraliçeleri", 853, 791)}
    <div class="portfolio-art-label"><span>SELECTED WORK</span><span>01—03</span></div>
</div>`;

export const visualServices = () => `<div class="portfolio-art is-services" aria-hidden="true">
    <div class="portfolio-art-grid"></div>
    <span class="portfolio-art-wire is-one"></span><span class="portfolio-art-wire is-two"></span>
    <div class="portfolio-blueprint">
        <div class="portfolio-blueprint-bar"><span class="portfolio-window-dots">${dots}</span><span>WEB EXPERIENCE</span></div>
        <div class="portfolio-blueprint-layout">
            <div class="portfolio-blueprint-sidebar"><span class="portfolio-blueprint-brand"></span>${bars(4)}</div>
            <div class="portfolio-blueprint-content">
                <div class="portfolio-blueprint-hero"><span class="portfolio-blueprint-eyebrow"></span><span class="portfolio-blueprint-title"></span><span class="portfolio-blueprint-title is-short"></span><span class="portfolio-blueprint-button"></span></div>
                <div class="portfolio-blueprint-panels"><span>${bars(2)}</span><span>${bars(2)}</span><span>${bars(2)}</span></div>
            </div>
        </div>
    </div>
    <div class="portfolio-blueprint-code">&lt;/&gt;</div>
    <div class="portfolio-art-chip is-one"><b>01</b><span>ARAYÜZ</span></div>
    <div class="portfolio-art-chip is-two"><b>02</b><span>ENTEGRASYON</span></div>
</div>`;

const servicePreviews = {
    site: `<div class="portfolio-preview-sidebar">${bars(3)}</div><div class="portfolio-preview-body"><span class="portfolio-preview-title"></span><div class="portfolio-preview-lines">${bars(2)}</div><div class="portfolio-preview-tiles"><span></span><span></span><span></span></div></div>`,
    blog: `<div class="portfolio-preview-article"><span class="portfolio-preview-image"></span><div class="portfolio-preview-lines">${bars(3)}</div></div><div class="portfolio-preview-stack"><span></span><span></span></div>`,
    links: '<span class="portfolio-preview-avatar"></span><div class="portfolio-preview-linklist"><span></span><span></span><span></span></div>',
    fix: `<div class="portfolio-preview-code-lines">${bars(5)}</div><span class="portfolio-preview-tools">&lt;/&gt;</span>`,
};

export const visualServicePreview = (kind) => {
    const variant = Object.hasOwn(servicePreviews, kind) ? kind : "site";
    return `<div class="portfolio-service-preview is-${variant}" aria-hidden="true"><div class="portfolio-preview-bar">${dots}</div><div class="portfolio-preview-content">${servicePreviews[variant]}</div></div>`;
};
