const test = require("node:test");
const assert = require("node:assert/strict");
const knowledgeBase = require("../cache/chatbot-context.json");
const { buildKnowledgeAnswer } = require("../lib/knowledge-answer.js");

test("suggested identity question uses the verified profile summary", () => {
  assert.equal(buildKnowledgeAnswer("Arda kimdir?", knowledgeBase), knowledgeBase.identity.summary);
});

test("suggested projects question returns selected projects and their real links", () => {
  const answer = buildKnowledgeAnswer("Hangi projeleri var?", knowledgeBase);
  for (const project of knowledgeBase.selectedProjects) {
    assert.ok(answer.includes(project.name));
    assert.ok(answer.includes(project.url));
  }
});

test("suggested contact question returns verified communication channels", () => {
  const answer = buildKnowledgeAnswer("Nasıl iletişim kurabilirim?", knowledgeBase);
  assert.ok(answer.includes(knowledgeBase.contact.email));
  assert.ok(answer.includes(knowledgeBase.contact.linkedin));
});

test("a named project wins over the generic projects intent, including Turkish diacritics", () => {
  const answer = buildKnowledgeAnswer("EMLAK KRALİÇELERİ projesini anlat", knowledgeBase);
  assert.ok(answer.includes("https://emlakkraliceleri.com"));
  assert.ok(!answer.includes("Omni Tools"));
});

test("hyphenated project names match their natural language spelling", () => {
  const answer = buildKnowledgeAnswer("omni-tools projesi nedir?", knowledgeBase);
  assert.ok(answer.includes(knowledgeBase.selectedProjects[0].description));
  assert.ok(!answer.includes("Blog Platformu"));
});

test("phone and CV queries give only the requested verified detail", () => {
  assert.ok(buildKnowledgeAnswer("Telefon numarası?", knowledgeBase).includes(knowledgeBase.contact.phone));
  assert.ok(!buildKnowledgeAnswer("Telefon numarası?", knowledgeBase).includes(knowledgeBase.contact.email));
  assert.ok(buildKnowledgeAnswer("ÖZGEÇMİŞ nerede?", knowledgeBase).includes(knowledgeBase.contact.cv));
});

test("education, experience, skills, availability and services use supplied facts", () => {
  assert.ok(buildKnowledgeAnswer("Eğitimi ne?", knowledgeBase).includes(knowledgeBase.education[0].school));
  assert.ok(buildKnowledgeAnswer("İş deneyimi?", knowledgeBase).includes(knowledgeBase.experience[0].title));
  assert.ok(buildKnowledgeAnswer("Hangi teknolojileri biliyor?", knowledgeBase).includes("React.js"));
  assert.ok(buildKnowledgeAnswer("Freelance işe uygun mu?", knowledgeBase).includes(knowledgeBase.identity.availability));
  assert.ok(buildKnowledgeAnswer("Hizmet fiyatları neler?", knowledgeBase).includes(knowledgeBase.services[0].price));
});

test("unknown questions do not become biography answers just because they contain kim or what", () => {
  for (const question of ["Kimya nedir?", "Türkiye cumhurbaşkanı kimdir?", "What is quantum physics?"]) {
    const answer = buildKnowledgeAnswer(question, knowledgeBase);
    assert.ok(answer.includes("doğrulanmış bilgi bulunmuyor"), question);
    assert.ok(!answer.includes(knowledgeBase.identity.summary), question);
  }
});

test("missing knowledge fields never fabricate profile facts or contact details", () => {
  const minimal = { identity: { name: "Test Person", title: "Developer" } };
  assert.equal(buildKnowledgeAnswer("Arda kimdir?", minimal), "Test Person — Developer");
  for (const question of ["Projeleri?", "İletişim?", "CV", "Eğitimi?", "Yetenekleri?", "Hizmetleri?", "Deneyimi?", "Freelance uygun mu?"]) {
    const answer = buildKnowledgeAnswer(question, minimal);
    assert.ok(answer.includes("doğrulanmış bilgi bulunmuyor"), question);
    assert.ok(!answer.includes("undefined"), question);
    assert.ok(!answer.includes("arifardaaltunel@gmail.com"), question);
  }
  assert.ok(buildKnowledgeAnswer("Merhaba", null).length > 0);
});
