(function () {
  "use strict";

  /* ---- Header shadow on scroll ---- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav toggle ---- */
  const navToggle = document.getElementById("navToggle");
  const actions = document.querySelector(".header-actions");
  if (navToggle && actions) {
    navToggle.addEventListener("click", () => {
      const open = actions.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* ---- Scroll reveal ---- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---- Mentors carousel: live data from the app, a 1:1 copy of its "Proponowani" carousel and MentorCard ---- */
  const APP_ORIGIN = "https://app.twojmentor.it";
  const MENTORS_API = APP_ORIGIN + "/api/public/promoted-mentors";
  const MAX_MENTORS = 9;
  const PILL_GAP = 4;
  const SVG_NS = "http://www.w3.org/2000/svg";

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  // Only https URLs (and, for links, only the app host) are rendered, so a bad payload cannot inject a foreign link.
  const safeUrl = (value, allowedOrigin) => {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:") return null;
      if (allowedOrigin && url.origin !== allowedOrigin) return null;
      return url.href;
    } catch (e) {
      return null;
    }
  };

  // Same rule as getInitials() in the app: the first letter of every word of the full name.
  const initials = (name) => name.split(" ").filter(Boolean).map((part) => part.charAt(0).toUpperCase()).join("");

  const svg = (viewBox, className, shapes) => {
    const root = document.createElementNS(SVG_NS, "svg");
    root.setAttribute("viewBox", viewBox);
    root.setAttribute("aria-hidden", "true");
    root.setAttribute("class", className);
    shapes.forEach(([tag, attrs]) => {
      const shape = document.createElementNS(SVG_NS, tag);
      Object.keys(attrs).forEach((key) => shape.setAttribute(key, attrs[key]));
      root.appendChild(shape);
    });
    return root;
  };

  // lucide-react Star, as used by MentorCard.
  const starIcon = () =>
    svg("0 0 24 24", "mc-star", [["polygon", { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" }]]);

  // IconGift from the app (src/components/ui/icons/gift.tsx).
  const giftIcon = () =>
    svg("0 0 25 24", "mc-gift", [
      "M20.4687 10H4.46875V18C4.46875 21 5.46875 22 8.46875 22H16.4688C19.4688 22 20.4687 21 20.4687 18V10Z",
      "M22 7V8C22 9.1 21.47 10 20 10H5C3.47 10 3 9.1 3 8V7C3 5.9 3.47 5 5 5H20C21.47 5 22 5.9 22 7Z",
      "M12.1427 5.00141H6.62271C6.28271 4.63141 6.29271 4.06141 6.65271 3.70141L8.07271 2.28141C8.44271 1.91141 9.05271 1.91141 9.42271 2.28141L12.1427 5.00141Z",
      "M18.3716 5.00141H12.8516L15.5716 2.28141C15.9416 1.91141 16.5516 1.91141 16.9216 2.28141L18.3416 3.70141C18.7016 4.06141 18.7116 4.63141 18.3716 5.00141Z",
      "M9.4375 10V15.14C9.4375 15.94 10.3175 16.41 10.9875 15.98L11.9275 15.36C12.2675 15.14 12.6975 15.14 13.0275 15.36L13.9175 15.96C14.5775 16.4 15.4675 15.93 15.4675 15.13V10H9.4375Z",
    ].map((d) => ["path", { d: d }]));

  const skillPill = (tag) => {
    const pill = el("li", "mc-pill");
    // Icons are the app's technology icons exported to /assets/img/tech/<name>.svg ("c#" and "c++" included, hence the encoding).
    if (/^[a-z0-9_+#-]+$/.test(tag.name)) {
      const icon = el("img", "mc-pill-icon");
      icon.src = "/assets/img/tech/" + encodeURIComponent(tag.name) + ".svg";
      icon.width = 16;
      icon.height = 16;
      icon.alt = "";
      icon.addEventListener("error", () => icon.remove());
      pill.appendChild(icon);
    }
    pill.appendChild(el("span", null, tag.title));
    return pill;
  };

  // Port of countFittingPills (src/components/cards/fit-pills.ts): as many pills as fit on one line, then "+N".
  const fitPills = (list) => {
    const pills = [...list.querySelectorAll(".mc-pill")];
    const prevMore = list.querySelector(".mc-pill-more");
    if (prevMore) prevMore.remove();
    pills.forEach((pill) => { pill.hidden = false; });
    if (!pills.length) return;

    const containerWidth = list.clientWidth;
    const widths = pills.map((pill) => pill.getBoundingClientRect().width);
    const widthOf = (count) => {
      let sum = 0;
      for (let i = 0; i < count; i++) sum += widths[i];
      return count > 0 ? sum + PILL_GAP * (count - 1) : 0;
    };
    if (containerWidth <= 0 || widthOf(pills.length) <= containerWidth) return;

    const more = el("li", "mc-pill mc-pill-more");
    list.appendChild(more);
    const moreWidthFor = (hidden) => {
      more.textContent = "+" + hidden;
      return more.getBoundingClientRect().width;
    };
    let shown = 1;
    for (let count = pills.length - 1; count >= 1; count--) {
      if (widthOf(count) + PILL_GAP + moreWidthFor(pills.length - count) <= containerWidth) {
        shown = count;
        break;
      }
    }
    pills.forEach((pill, i) => { pill.hidden = i >= shown; });
    more.textContent = "+" + (pills.length - shown);
  };

  const renderMentorCard = (m) => {
    const fullName = (m.firstName || "") + " " + (m.lastName || "");
    const profileUrl = safeUrl(m.profileUrl, APP_ORIGIN);
    if (!fullName.trim() || !profileUrl) return null;

    const slide = el("div", "mc-slide");
    const link = el("a", "mc-link");
    link.href = profileUrl;
    const card = el("div", "mc-card");

    const header = el("div", "mc-header");
    const row = el("div", "mc-row");
    const avatar = el("span", "mc-avatar");
    const fallback = () => avatar.appendChild(el("span", "mc-avatar-fallback", initials(fullName)));
    const avatarUrl = safeUrl(m.avatar);
    if (avatarUrl) {
      const img = el("img", "mc-avatar-img");
      img.src = avatarUrl;
      img.alt = fullName + " avatar";
      img.loading = "lazy";
      img.addEventListener("error", () => { img.remove(); fallback(); });
      avatar.appendChild(img);
    } else {
      fallback();
    }
    row.appendChild(avatar);

    const info = el("div", "mc-info");
    const names = el("div", "mc-names");
    names.appendChild(el("h3", "mc-name", fullName));
    names.appendChild(el("p", "mc-spec", m.specializationLabel || ""));
    info.appendChild(names);
    const meta = el("div", "mc-meta");
    if (m.reviewsCount > 0) {
      const rate = el("div", "mc-rate");
      rate.appendChild(el("span", "mc-rate-value", String(m.rating)));
      rate.appendChild(starIcon());
      rate.appendChild(el("span", null, "(" + m.reviewsCount + ")"));
      meta.appendChild(rate);
    }
    if (m.isTopMentor) meta.appendChild(el("span", "mc-badge", "Top mentor"));
    info.appendChild(meta);
    row.appendChild(info);
    header.appendChild(row);
    card.appendChild(header);

    const content = el("div", "mc-content");
    const tags = Array.isArray(m.skillTags) ? m.skillTags : [];
    if (tags.length) {
      const list = el("ul", "mc-pills");
      tags.forEach((tag) => list.appendChild(skillPill(tag)));
      content.appendChild(list);
    }
    content.appendChild(el("p", "mc-bio", m.bio || ""));
    const footer = el("div", "mc-footer");
    if (m.firstSessionFree) {
      const free = el("p", "mc-free");
      free.appendChild(giftIcon());
      free.appendChild(el("span", null, "Pierwsza darmowa"));
      footer.appendChild(free);
    }
    content.appendChild(footer);
    card.appendChild(content);

    link.appendChild(card);
    slide.appendChild(link);
    return slide;
  };

  const initMentorsCarousel = (viewport, prev, next) => {
    const update = () => {
      const max = viewport.scrollWidth - viewport.clientWidth;
      prev.disabled = viewport.scrollLeft <= 1;
      next.disabled = viewport.scrollLeft >= max - 1;
    };
    // One click moves one card, as Embla's scrollPrev/scrollNext does in the app.
    const step = (dir) => {
      const slide = viewport.querySelector(".mc-slide");
      if (!slide) return;
      const gap = parseFloat(getComputedStyle(slide.parentElement).columnGap) || 0;
      viewport.scrollBy({ left: dir * (slide.getBoundingClientRect().width + gap), behavior: "smooth" });
    };
    prev.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step(1));
    viewport.addEventListener("scroll", update, { passive: true });

    const refit = () => viewport.querySelectorAll(".mc-pills").forEach(fitPills);
    let rt;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => { refit(); update(); }, 100);
    });
    // Pill widths depend on the web font and the icons, so measure again once both have loaded.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);
    window.addEventListener("load", refit);
    refit();
    update();
  };

  const mentorsSection = document.getElementById("mentorzy");
  const mentorsViewport = document.getElementById("mentorsViewport");
  const mentorsTrack = document.getElementById("mentorsTrack");
  const mentorsNav = document.getElementById("mentorsNav");
  const prevMentor = document.getElementById("prevMentor");
  const nextMentor = document.getElementById("nextMentor");
  if (mentorsSection && mentorsViewport && mentorsTrack && mentorsNav && prevMentor && nextMentor && "fetch" in window) {
    fetch(MENTORS_API, { credentials: "omit" })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        const mentors = body && Array.isArray(body.data) ? body.data : [];
        const slides = mentors.slice(0, MAX_MENTORS).map(renderMentorCard).filter(Boolean);
        if (!slides.length) return;
        slides.forEach((slide) => mentorsTrack.appendChild(slide));
        mentorsNav.hidden = slides.length < 2;
        mentorsSection.hidden = false;
        initMentorsCarousel(mentorsViewport, prevMentor, nextMentor);
      })
      // A failed feed leaves the section hidden; nothing else on the page depends on it.
      .catch(() => {});
  }

  /* ---- Modal: Zapisz się ---- */
  const modal = document.getElementById("signupModal");
  const modalCloseBtn = document.getElementById("modalClose");
  const signupBtns = document.querySelectorAll(".js-signup-open");
  if (modal && signupBtns.length) {
    const openModal = () => {
      modal.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
      modalCloseBtn && modalCloseBtn.focus();
    };
    const closeModal = (trigger) => {
      modal.setAttribute("hidden", "");
      document.body.style.overflow = "";
      if (trigger) trigger.focus();
    };
    let lastTrigger = null;
    signupBtns.forEach((btn) => {
      btn.addEventListener("click", () => { lastTrigger = btn; openModal(); });
    });
    modalCloseBtn && modalCloseBtn.addEventListener("click", () => closeModal(lastTrigger));
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(lastTrigger); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hasAttribute("hidden")) closeModal(lastTrigger); });
  }

  /* ---- FAQ: accordion (one open at a time) ---- */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

})();
