const normalize = (value) => String(value || "")
  .toLocaleLowerCase("tr-TR")
  .replace(/ı/g, "i")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9+#]+/g, " ")
  .trim();

const strings = (items) => Array.isArray(items)
  ? items.filter((item) => typeof item === "string" && item.trim())
  : [];
const records = (items) => Array.isArray(items)
  ? items.filter((item) => item && typeof item === "object")
  : [];
const text = (value) => typeof value === "string" ? value.trim() : "";

const buildKnowledgeAnswer = (message, knowledgeBase) => {
  const data = knowledgeBase && typeof knowledgeBase === "object" ? knowledgeBase : {};
  const query = normalize(message);
  const contact = data.contact || {};
  const identity = data.identity || {};
  const contactDetails = [contact.email, contact.linkedin, contact.github].map(text).filter(Boolean);
  const unknown = `Bu konuda site içeriğinde doğrulanmış bilgi bulunmuyor. Arda'nın portfolyosu, projeleri, yetenekleri ve iletişim bilgileri hakkında yardımcı olabilirim.${contactDetails.length ? ` Arda'ya doğrudan ulaşabilirsin: ${contactDetails[0]}` : ""}`;

  if (/\b(cv|ozgecmis|resume)\b/.test(query)) {
    return text(contact.cv) ? `Arda'nın özgeçmişi: ${contact.cv}` : unknown;
  }

  if (/\b(iletisim\w*|ulas\w*|eposta|email|mail|telefon\w*|linkedin|instagram|contact)\b|\be posta\b/.test(query)) {
    const channel = /\btelefon\w*\b/.test(query) ? "phone"
      : /\b(eposta|email|mail)\b|\be posta\b/.test(query) ? "email"
        : /\blinkedin\b/.test(query) ? "linkedin"
          : /\binstagram\b/.test(query) ? "instagram" : null;
    const details = channel ? [text(contact[channel])].filter(Boolean) : contactDetails;
    return details.length ? `Arda'ya şu kanallardan ulaşabilirsin:\n${details.join("\n")}` : unknown;
  }

  const seen = new Set();
  const projects = [...records(data.selectedProjects), ...records(data.highlightedProjects)]
    .filter((project) => {
      const name = normalize(project.name);
      if (!name || seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  const namedProjects = projects.filter((project) => {
    const name = normalize(project.name);
    return name.length >= 3 && ` ${query} `.includes(` ${name} `);
  });
  const formatProject = (project) => [text(project.name), text(project.description), text(project.homepage) || text(project.url)]
    .filter(Boolean).join(" — ");
  if (namedProjects.length) {
    return namedProjects.slice(0, 2).map(formatProject).join("\n\n");
  }
  if (/\b(proje\w*|project\w*|github|portfolyo\w*|portfolio\w*)\b/.test(query)) {
    return projects.length ? `Arda'nın öne çıkan projeleri:\n${projects.slice(0, 3).map((project) => `• ${formatProject(project)}`).join("\n")}` : unknown;
  }

  if (/\b(egitim\w*|okul\w*|universite\w*|ogrenim\w*|nerede ok\w*|ne ok\w*)\b/.test(query)) {
    const education = records(data.education).map((item) => [text(item.school), text(item.program), text(item.period)].filter(Boolean).join(" — ")).filter(Boolean);
    return education.length ? `Arda'nın eğitim bilgileri:\n${education.join("\n")}` : unknown;
  }
  if (/\b(deneyim\w*|tecrube\w*|weatra|staj\w*|nerede calis\w*|calisma gecmisi)\b/.test(query)) {
    const experience = records(data.experience).map((item) => [text(item.title), text(item.label), text(item.description)].filter(Boolean).join(" — ")).filter(Boolean);
    return experience.length ? `Arda'nın deneyimi:\n${experience.slice(0, 3).join("\n")}` : unknown;
  }
  if (/\b(sertifika\w*|certificat\w*)\b/.test(query)) {
    const certifications = strings(data.certifications);
    return certifications.length ? `Sitede listelenen sertifikaları:\n${certifications.slice(0, 4).join("\n")}` : unknown;
  }
  if (/\b(musait\w*|uygun\w*|freelance|is birligi|isbirligi|birlikte calis\w*)\b/.test(query)) {
    return text(identity.availability) ? `${identity.availability}.${contactDetails.length ? ` İletişim: ${contactDetails[0]}` : ""}` : unknown;
  }
  if (/\b(hizmet\w*|fiyat\w*|ucret\w*|butce\w*|teklif\w*|ne kadar)\b/.test(query)) {
    const services = records(data.services).filter((service) => text(service.title));
    return services.length ? `Sitede listelenen hizmetleri:\n${services.slice(0, 4).map((service) => `• ${[text(service.title), text(service.price), text(service.url)].filter(Boolean).join(" — ")}`).join("\n")}` : unknown;
  }
  if (/\b(yetenek\w*|beceri\w*|teknoloji\w*|programlama\w*|hangi dil\w*|neler bili\w*|hangi arac\w*)\b/.test(query)) {
    const skills = data.skills && typeof data.skills === "object" ? Object.values(data.skills).flatMap(strings) : [];
    return skills.length ? `Arda'nın sitede listelenen yetenekleri: ${[...new Set(skills)].slice(0, 24).join(", ")}.` : unknown;
  }
  if (/\b(arda(?: altunel)? (?:kim\w*|hakkinda|ne is yap\w*)|who is arda)\b/.test(query) || /^(arda|kimdir|kendini tanit|ne is yapar|merhaba|selam|hello|hi)$/.test(query)) {
    const summary = text(identity.summary) || [text(identity.name), text(identity.title), text(identity.location)].filter(Boolean).join(" — ");
    return summary || unknown;
  }

  return unknown;
};

module.exports = { buildKnowledgeAnswer };
