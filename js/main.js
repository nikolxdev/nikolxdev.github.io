/* © 2026 Nikola Vojvodić · https://nikolxdev.github.io/ · All rights reserved, see LICENSE. [nv:75f96b7b26] */

const FORM_URL = "https://formspree.io/f/mppqglyp";
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const EN = {
  "nav.aria": "Navigation", "nav.home": "Nikola Vojvodić, home", "nav.projects": "Projects", "nav.about": "About", "nav.tools": "Tools", "nav.contact": "Contact",
  "hero.lead": "Full-stack developer from Čačak, Serbia. <br>Four projects below, live and with code.",
  "hero.cta2": "Send a message", "f.toparia": "Back to top", "cv.dl": "Download CV",
  "proj.title": "Projects",
  "btn.live": "Live preview", "btn.gh": "Code on GitHub",
  "re.altm": "Rebound, picking a time slot on a phone", "re.altd": "Rebound, home page", "re.meta": "Full-stack booking system, 2026",
  "re.desc": "Court booking for a made-up padel club in Čačak. Pick a court, a day and a time, and you get a booking code and a cancel link. Staff have their own page with the day's schedule. The server is on a free plan, so the first visit after a break takes about half a minute.",
  "re.f1": "Two bookings on the same court can't overlap. The database itself checks it, even when two people click in the same second",
  "re.f2": "Staff schedule: drag bookings to move them, block courts for tournaments. The demo login is shown on the sign-in page",
  "re.f5": "16 tests in GitHub Actions, the API tests run against a real PostgreSQL database",
  "k.altm": "Knjigoteka on a phone", "k.altd": "Knjigoteka, home page", "k.meta": "PWA, bachelor thesis graded 10/10, 2026",
  "k.desc": "A progressive web app for searching books in the Open Library catalogue and keeping a personal reading shelf. It works offline and installs on phone and desktop like a native app.",
  "k.f2": "A shelf drawn as a real bookcase, with ratings, notes and reading stats",
  "k.f3": "Service worker with three caching strategies, fully usable offline",
  "k.f5": "40 unit and 34 end-to-end tests, with automated accessibility checks and a real offline run",
  "le.altm": "Last Ember on a phone", "le.altd": "Last Ember, home page", "le.meta": "Restaurant website concept, 2026",
  "le.desc": "A website for a late-night burger bar in Belgrade, with a menu, cart and table booking. Everything runs in the browser, with no framework and no build step.",
  "le.f1": "A burger that builds itself as you scroll, with a static version for reduced motion",
  "le.f3": "Cart with delivery, promo codes, tips and pickup time slots",
  "le.f4": "Table booking and a live open / closed status",
  "mo.altm": "Morrow on a phone", "mo.altd": "Morrow, home page", "mo.meta": "3D brand concept, 2026",
  "mo.desc": "A site for a fictional cold-pressed juice brand from the Morava valley. The cans are 3D, built in code with Three.js, with no ready-made models or photos.",
  "mo.f2": "Clicking a can turns it around and opens its details: taste, nutrition and price",
  "mo.f4": "A harvest calendar based on today's date and a bag that is remembered",
  "mo.f5": "8 Playwright tests on desktop and mobile, with no retries for failed tests",
  "ab.title": "About me",
  "ab.p1": "I'm Nikola Vojvodić, from Čačak, Serbia. I graduated in 2026, and my thesis project was Knjigoteka, a book app that also works offline.",
  "ab.p2": "I work in JavaScript and TypeScript. So far I've built a booking system with its own server and database, an app that works offline, a 3D site for a juice brand and a site for a burger bar. All four are on this page, with their code and tests.",
  "ab.k6": "Education", "ab.v6": "Information Technology, Faculty of Technical Sciences Čačak, 2022–2026. Bachelor thesis graded 10/10.",
  "ab.k4": "Languages", "ab.v4": "Serbian (native), English (professional working proficiency)",
  "t.title": "Tools & technologies", "t.lead": "Only what you can see at work in the projects above.",
  "t.k1": "Core", "t.v2": "React, Tailwind CSS, Three.js, GSAP, PWAs and service workers", "t.k4": "Testing & tools",
  "c.title": "Let's<br>talk.",
  "c.lead": "Got a job, a project or just a question? Send me a message and I'll reply within a day or two.", "c.copy": "Copy",
  "c.name": "Name", "c.nameph": "Your name", "c.emailph": "name@example.com", "c.subj": "Subject", "c.subjph": "Job, project, collaboration…",
  "c.msg": "Message", "c.msgph": "Tell me what it's about", "c.send": "Send message"
};

const MESSAGES = {
  sr: { sending: "Šaljem…", empty: "Upiši ime i poruku.", email: "Upiši ispravnu email adresu da bih mogao da ti odgovorim.",
        sent: "Hvala! Poruka je poslata, javiću ti se uskoro.", failed: "Poruka nije poslata. Proveri internet vezu i pokušaj ponovo.",
        light: "Uključi svetlu temu", dark: "Uključi tamnu temu", copied: "Email adresa je kopirana" },
  en: { sending: "Sending…", empty: "Please enter your name and a message.", email: "Please enter a valid email address so I can reply.",
        sent: "Thanks! Your message was sent, I'll get back to you soon.", failed: "Message not sent. Check your internet connection and try again.",
        light: "Switch to light mode", dark: "Switch to dark mode", copied: "Email address copied" }
};
let lang = "en";
const message = key => MESSAGES[lang][key];

const I18N_ATTRS = { "data-i18n": "innerHTML", "data-i18n-ph": "placeholder", "data-i18n-aria": "aria-label", "data-i18n-alt": "alt" };
const SR = {};

function eachTranslatable(fn) {
  for (const [attr, prop] of Object.entries(I18N_ATTRS)) {
    $$(`[${attr}]`).forEach(el => fn(el, el.getAttribute(attr), prop));
  }
}
const readProp = (el, prop) => prop === "aria-label" ? el.getAttribute(prop) : el[prop];
const writeProp = (el, prop, value) => prop === "aria-label" ? el.setAttribute(prop, value) : (el[prop] = value);

function setLang(newLang) {
  lang = newLang;
  const dict = lang === "en" ? EN : SR;
  eachTranslatable((el, key, prop) => { if (dict[key] != null) writeProp(el, prop, dict[key]); });
  root.lang = lang === "en" ? "en" : "sr-Latn";
  $$(".lang-switch button").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang));
  updateModeLabel();
  $("#form-msg").textContent = "";
}
$$(".lang-switch button").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));

let mode = root.dataset.mode || "dark";

function updateModeLabel() {
  const button = $("#mode-btn");
  button.title = message(mode === "light" ? "dark" : "light");
  button.setAttribute("aria-label", button.title);
}
function applyMode() {
  root.dataset.mode = mode;
  try { localStorage.setItem("pf-mode", mode); } catch (e) {}
  updateModeLabel();
}

$("#mode-btn").addEventListener("click", e => {
  mode = mode === "light" ? "dark" : "light";
  if (!document.startViewTransition || reduceMotion || document.hidden) return applyMode();

  const r = e.currentTarget.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.classList.add("theming");
  const transition = document.startViewTransition(applyMode);
  transition.ready.then(() => root.animate(
    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
    { duration: 700, easing: "cubic-bezier(.65, 0, .35, 1)", pseudoElement: "::view-transition-new(root)" }
  )).catch(() => {});
  transition.finished.finally(() => root.classList.remove("theming"));
});

const toTop = $("#to-top");
addEventListener("scroll", () => toTop.classList.toggle("show", scrollY > 700), { passive: true });
toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

const navLinks = $$(".nav ul a");
const sectionSpy = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) navLinks.forEach(a => a.setAttribute("aria-current", a.hash === "#" + entry.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
["hero", "projekti", "o-meni", "alati", "kontakt"].forEach(id => sectionSpy.observe(document.getElementById(id)));

function startReels() {
  const reels = $$(".screen img.reel");
  const visible = new Set();
  let frame = 0;

  const update = () => {
    frame = 0;
    for (const img of visible) {
      const screen = img.parentElement;
      const box = screen.getBoundingClientRect();
      const start = innerHeight * 0.9, end = innerHeight * 0.1;
      const travel = img.offsetHeight - screen.clientHeight;
      const distance = start - end + box.height;
      const span = Math.min(distance, travel);
      const scrolled = start - box.top - (distance - span) / 2;
      const progress = Math.min(1, Math.max(0, scrolled / span));
      const eased = progress < .5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2;
      img.style.transform = `translate3d(0, ${-travel * eased}px, 0)`;
    }
  };
  const request = () => { if (!frame) frame = requestAnimationFrame(update); };

  const watcher = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
    request();
  });
  reels.forEach(img => {
    watcher.observe(img);
    img.addEventListener("load", request);
  });
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", request);
}

let toastTimer = 0;
function toast(text) {
  const box = $("#toast");
  box.textContent = text;
  box.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove("show"), 2200);
}

function copyEmail() {
  const email = $("#mail").textContent;
  if (navigator.clipboard) navigator.clipboard.writeText(email).then(() => toast(message("copied")), () => toast(email));
  else toast(email);
}
$("#copy-mail").addEventListener("click", copyEmail);

$("#contact-form").addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.currentTarget;
  const button = $("#f-submit");
  const status = $("#form-msg");
  const say = (text, kind = "") => { status.textContent = text; status.className = "form-msg " + kind; };
  const { ime, email, poruka } = form.elements;

  if (!ime.value.trim() || !poruka.value.trim()) return say(message("empty"), "err");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { email.focus(); return say(message("email"), "err"); }

  const label = button.textContent;
  button.disabled = true;
  button.textContent = message("sending");
  say("");
  try {
    const response = await fetch(FORM_URL, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(response.status);
    form.reset();
    say(message("sent"), "ok");
  } catch (err) {
    say(message("failed"), "err");
  } finally {
    button.disabled = false;
    button.textContent = label;
  }
});

eachTranslatable((el, key, prop) => { SR[key] = readProp(el, prop); });
setLang("en");
if (!reduceMotion) startReels();

console.log(
  "%c👋 Hej, developeru!%c\nOvaj sajt radi bez frejmvorka i bez build koraka. Kod: https://github.com/nikolxdev/nikolxdev.github.io\nHi there! No framework, no build step. Source: https://github.com/nikolxdev/nikolxdev.github.io",
  "font: 700 16px system-ui; color: #ce2e2e;", "font: 12px ui-monospace, monospace; color: #a89f96;"
);

(function () {
  var HOMES = ["nikolxdev.github.io", "localhost", "127.0.0.1", "[::1]", ""];
  var host = location.hostname;
  if (HOMES.indexOf(host) > -1 || /\.localhost$/.test(host)) return;
  var link = document.createElement("a");
  link.className = "nv-original";
  link.href = "https://nikolxdev.github.io/";
  link.textContent = "Original work by Nikola Vojvodić";
  link.setAttribute("data-nv", "nv:75f96b7b26");
  document.body.appendChild(link);
  console.warn("This page is a copy of work by Nikola Vojvodić (© 2026, all rights reserved): https://nikolxdev.github.io/ [nv:75f96b7b26]");
})();
