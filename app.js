(() => {
  "use strict";
  const q = (s, sc = document) => sc.querySelector(s);
  const qa = (s, sc = document) => sc.querySelectorAll(s);
  const raf = (cb) => requestAnimationFrame(cb);
  const prefersReduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function typewriter() {
    const title = q(".typewriter");
    const sub = q(".typewriter-subtitle");
    if (!title && !sub) return;
    if (prefersReduce) {
      if (title) title.textContent = title.dataset.text || "";
      if (sub) {
        const f = (sub.dataset.texts || "").split(",")[0];
        if (f) sub.textContent = f;
      }
      return;
    }
    if (title) {
      const text = title.dataset.text || "";
      let i = 0;
      const start = performance.now() + 600;
      const speed = 90;
      const step = (t) => {
        if (document.hidden) return raf(step);
        if (t < start) return raf(step);
        const tgt = Math.min(text.length, Math.floor((t - start) / speed));
        if (tgt !== i) {
          i = tgt;
          title.textContent = text.slice(0, i);
        }
        if (i < text.length) raf(step);
      };
      title.textContent = "";
      raf(step);
    }
    if (sub) {
      const words = (sub.dataset.texts || "")
        .split(",")
        .map((w) => w.trim())
        .filter(Boolean);
      if (!words.length) return;
      let wi = 0,
        chars = 0,
        del = false,
        pause = 0,
        last = performance.now();
      const loop = (t) => {
        if (document.hidden) {
          last = t;
          return raf(loop);
        }
        const dt = t - last;
        last = t;
        const w = words[wi];
        if (!del) {
          chars += dt / 140;
          if (chars >= w.length) {
            chars = w.length;
            del = true;
            pause = t + 1800;
          }
        } else if (t > pause) {
          chars -= dt / 110;
          if (chars <= 0) {
            chars = 0;
            del = false;
            wi = (wi + 1) % words.length;
          }
        }
        sub.textContent = w.slice(
          0,
          Math.floor(Math.max(0, Math.min(w.length, chars))),
        );
        raf(loop);
      };
      raf(loop);
    }
  }
  function navigation() {
    const hamburger = q("#hamburger");
    const menu = q("#nav-menu");
    const links = qa(".nav-link");
    const navbar = q(".navbar");
    if (hamburger && menu) {
      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        menu.classList.toggle("active");
        document.body.style.overflow = menu.classList.contains("active")
          ? "hidden"
          : "";
      });
      document.addEventListener("click", (e) => {
        if (!hamburger.contains(e.target) && !menu.contains(e.target)) {
          hamburger.classList.remove("active");
          menu.classList.remove("active");
          document.body.style.overflow = "";
        }
      });
    }
    links.forEach((a) =>
      a.addEventListener("click", (e) => {
        if (a.getAttribute("href") === "#") e.preventDefault();
        if (menu && menu.classList.contains("active")) {
          hamburger.classList.remove("active");
          menu.classList.remove("active");
          document.body.style.overflow = "";
        }
      }),
    );
    const sections = qa("section[id]");
    if (sections.length) {
      const io = new IntersectionObserver(
        (es) => {
          es.forEach((en) => {
            if (!en.isIntersecting) return;
            const id = en.target.id;
            links.forEach((l) => {
              const match = l.getAttribute("href") === `#${id}`;
              l.classList.toggle("active", match);
              match
                ? l.setAttribute("aria-current", "true")
                : l.removeAttribute("aria-current");
            });
          });
        },
        { threshold: 0.5 },
      );
      sections.forEach((s) => io.observe(s));
    }
    if (navbar) {
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        raf(() => {
          navbar.classList.toggle("navbar--scrolled", window.scrollY > 50);
          ticking = false;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
    let rT;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(rT);
        rT = setTimeout(() => {
          if (window.innerWidth > 768 && menu) {
            hamburger.classList.remove("active");
            menu.classList.remove("active");
            document.body.style.overflow = "";
          }
        }, 180);
      },
      { passive: true },
    );
    const resumeLink = q(".resume-link");
    if (resumeLink) {
      resumeLink.addEventListener("click", (e) => {
        e.preventDefault();
        const originalText = resumeLink.textContent;
        resumeLink.textContent = "Loading...";
        resumeLink.style.pointerEvents = "none";
        setTimeout(() => {
          window.open(resumeLink.href, "_blank");
          resumeLink.textContent = originalText;
          resumeLink.style.pointerEvents = "";
        }, 1000);
      });
    }
  }
  function parallax() {
    if (prefersReduce) return;
    const hero = q(".hero");
    if (!hero) return;
    const particles = qa(".particle", hero);
    let rect = hero.getBoundingClientRect();
    const upd = () => (rect = hero.getBoundingClientRect());
    window.addEventListener("resize", upd, { passive: true });
    let pmTick = false;
    hero.addEventListener(
      "pointermove",
      (e) => {
        if (pmTick) return;
        pmTick = true;
        raf(() => {
          if (document.hidden) {
            pmTick = false;
            return;
          }
          const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
          const y =
            (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
          particles.forEach((p, i) => {
            const f = (i % 2 ? 0.3 : 0.5) * ((i % 3) + 1);
            p.style.transform = `translate3d(${(x * 14 * f).toFixed(2)}px, ${(y * 10 * f).toFixed(2)}px,0)`;
          });
          pmTick = false;
        });
      },
      { passive: true },
    );
    hero.addEventListener("pointerleave", () =>
      particles.forEach((p) => (p.style.transform = "")),
    );
    let scTick = false;
    const onScroll = () => {
      if (scTick) return;
      scTick = true;
      raf(() => {
        if (window.innerWidth > 768 && !document.hidden) {
          const s = window.pageYOffset;
          if (s < window.innerHeight)
            hero.style.transform = `translateY(${(s * -0.09).toFixed(2)}px)`;
        }
        scTick = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    upd();
  }
  function horizontalScroll() {
    const defs = [
      [
        ".skills.skills--hscroll",
        ".skills.skills--hscroll .skills-grid-min",
        "--hscroll-height",
      ],
      [
        "#gaming.gaming-zone--hscroll",
        "#gaming.gaming-zone--hscroll .gaming-zone-grid",
        "--gaming-h",
      ],
    ];
    const navH = () => q(".navbar")?.offsetHeight || 70;
    const setup = (wrapSel, rowSel, cssVar) => {
      const wrap = q(wrapSel);
      const row = q(rowSel);
      if (!wrap || !row) return;
      let enabled = false,
        maxX = 0,
        start = 0,
        end = 0;
      function layout() {
        enabled = window.innerWidth > 900;
        if (!enabled) {
          wrap.style.removeProperty(cssVar);
          wrap.removeAttribute("data-hscroll-ready");
          row.style.transform = "";
          return;
        }
        const container = wrap.querySelector(".container");
        maxX = Math.max(0, row.scrollWidth - container.clientWidth);
        const travel = maxX * 1.8 + 300;
        wrap.style.setProperty(
          cssVar,
          `${Math.max(travel, window.innerHeight - navH() + 200)}px`,
        );
        wrap.setAttribute("data-hscroll-ready", "true");
        start = navH();
        end = window.innerHeight;
      }
      let tick = false;
      function onScroll() {
        if (!enabled || tick) return;
        tick = true;
        raf(() => {
          const r = wrap.getBoundingClientRect();
          const total = r.height - end + start;
          if (r.top <= start && r.bottom > end) {
            const prog = Math.min(
              1,
              Math.max(0, (start - r.top) / Math.max(1, total)),
            );
            row.style.transform = `translate3d(${-prog * maxX}px,0,0)`;
          } else if (r.top > start) {
            row.style.transform = "translate3d(0,0,0)";
          } else if (r.bottom <= end) {
            row.style.transform = `translate3d(${-maxX}px,0,0)`;
          }
          tick = false;
        });
      }
      layout();
      onScroll();
      window.addEventListener(
        "resize",
        () => {
          layout();
          onScroll();
        },
        { passive: true },
      );
      window.addEventListener("scroll", onScroll, { passive: true });
    };
    defs.forEach((d) => setup(...d));
  }
  function rippleDelegated() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn");
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const span = document.createElement("span");
      span.className = "ripple-circle";
      span.style.width = span.style.height = size + "px";
      span.style.left = e.clientX - r.left - size / 2 + "px";
      span.style.top = e.clientY - r.top - size / 2 + "px";
      btn.appendChild(span);
      setTimeout(() => span.remove(), 520);
    });
  }
  function contact() {
    const form = q("#contact-form");
    if (!form) return;
    function showNotification(message, type = "success") {
      const notification = document.createElement("div");
      notification.className = `notification notification--${type}`;
      notification.innerHTML = `
        <div class="notification-content">
          <span class="notification-message">${message}</span>
          <button class="notification-close" type="button">×</button>
        </div>
      `;
      document.body.appendChild(notification);
      requestAnimationFrame(() => {
        notification.classList.add("notification--visible");
      });
      setTimeout(() => {
        notification.classList.remove("notification--visible");
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 4000);
      notification
        .querySelector(".notification-close")
        .addEventListener("click", () => {
          notification.classList.remove("notification--visible");
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 300);
        });
    }
    document
      .getElementById("contact-form")
      .addEventListener("submit", function (e) {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const subject = document.getElementById("subject").value;
        const message = document.getElementById("message").value;
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";
        emailjs
          .send("portfolio_3xhyxub", "template_ivpcten", {
            name: name,
            email: email,
            subject: subject,
            message: message,
          })
          .then(
            function () {
              submitBtn.textContent = originalText;
              submitBtn.disabled = false;
              submitBtn.style.opacity = "1";
              showNotification(
                "Message sent successfully! I'll get back to you soon.",
                "success",
              );
              form.reset();
            },
            function (error) {
              submitBtn.textContent = originalText;
              submitBtn.disabled = false;
              submitBtn.style.opacity = "1";
              console.log(error);
              showNotification(
                "Failed to send message. Please try again later.",
                "error",
              );
            },
          );
      });
  }
  function themeToggle() {
    const toggle = q("#theme-toggle");
    if (!toggle) return;
    toggle.setAttribute("role", "button");
    if (!toggle.getAttribute("aria-label"))
      toggle.setAttribute("aria-label", "Toggle theme");
  }
  function fadeInSections() {
    const sections = qa(".fade-in-section");
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((en) => {
          en.target.classList.toggle("fade-in-visible", en.isIntersecting);
        });
      },
      { threshold: 0.1 },
    );
    sections.forEach((s) => io.observe(s));
  }
  document.addEventListener("DOMContentLoaded", () => {
    typewriter();
    navigation();
    themeToggle();
    contact();
    fadeInSections();
    (window.requestIdleCallback
      ? requestIdleCallback
      : (fn) => setTimeout(fn, 50))(() => {
      parallax();
      horizontalScroll();
      rippleDelegated();
    });
    document.body.classList.add("loaded");
  });
})();
const Theme = {
  init() {
    this.toggle = document.querySelector("#theme-toggle");
    if (!this.toggle) return;
    this.setInitialTheme();
    this.bindEvents();
    requestAnimationFrame(() => {
      this.toggle.style.opacity = "1";
    });
  },
  setInitialTheme() {
    const stored = localStorage.getItem("theme");
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const theme = stored || (systemDark ? "dark" : "light");
    this.applyTheme(theme, true);
  },
  bindEvents() {
    if (!this.toggle) return;
    this.toggle.addEventListener("click", () => {
      const currentTheme =
        document.documentElement.getAttribute("data-theme") || "light";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      this.applyTheme(newTheme);
    });
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem("theme")) {
          this.applyTheme(e.matches ? "dark" : "light");
        }
      });
  },
  applyTheme(theme, isInitial = false) {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (window && window.console) console.log(`Theme changed to: ${theme}`);
    if (!isInitial) {
      window.dispatchEvent(
        new CustomEvent("themechange", { detail: { theme } }),
      );
    }
  },
};
document.addEventListener("DOMContentLoaded", () => {
  Theme.init();
});
