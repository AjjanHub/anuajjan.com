// assets/script.js
(function () {
  // ----- One-time fade on first load -----
  if (!sessionStorage.getItem("seenOnce")) {
    document.documentElement.classList.add("preload");
    window.addEventListener("load", () => {
      // allow a frame so CSS can apply, then fade in
      requestAnimationFrame(() => {
        document.documentElement.classList.remove("preload");
        sessionStorage.setItem("seenOnce", "1");
      });
    });
  }

  // ----- Dock navigation -----
  const buttons = Array.from(document.querySelectorAll(".dock button"));
  const sections = Array.from(document.querySelectorAll("main > section"));
  const ids = sections.map((s) => "#" + s.id);
  buttons.forEach((b, i) => (b.dataset.target = ids[i]));
  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const t = document.querySelector(btn.dataset.target);
      if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const id = "#" + e.target.id;
          buttons.forEach((b) => b.classList.toggle("active", b.dataset.target === id));
          const rev = e.target.querySelector(".reveal");
          if (rev) rev.classList.add("in");
        }
      });
    },
    { threshold: 0.6 }
  );
  sections.forEach((sec) => io.observe(sec));

  // ----- Contact form AJAX with friendly messages -----
  const form = document.querySelector("#contact-form");
  if (!form) return;

  const statusEl = document.querySelector("#form-status");
  const submitBtn = form.querySelector('button[type="submit"]');

  function setStatus(message, ok) {
    if (!statusEl) return;
    statusEl.textContent = message || "";
    statusEl.classList.remove("is-ok", "is-err");
    statusEl.classList.add(ok ? "is-ok" : "is-err");
  }

  function disableForm(disabled) {
    Array.from(form.elements).forEach((el) => (el.disabled = disabled));
    if (submitBtn) submitBtn.disabled = disabled;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Basic front-end validation
    const fd = new FormData(form);
    if ((fd.get("website") || "").trim() !== "") {
      // Honeypot filled: silently pretend success.
      setStatus("Thanks — your message was sent.", true);
      form.reset();
      return;
    }
    if (!fd.get("consent")) {
      setStatus("Please check the consent box.", false);
      return;
    }

    // Build JSON payload
    const payload = {
      first_name: (fd.get("first_name") || "").trim(),
      last_name: (fd.get("last_name") || "").trim(),
      email: (fd.get("email") || "").trim(),
      organisation: (fd.get("organisation") || "").trim(),
      country: (fd.get("country") || "").trim(),
      message: (fd.get("message") || "").trim()
    };

    // Show sending state
    disableForm(true);
    setStatus("Sending…", true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin"
      });

      const isJSON = res.headers.get("content-type")?.includes("application/json");
      const data = isJSON ? await res.json() : {};

      if (res.ok && (data.ok === true || data.success === true)) {
        setStatus("Thanks — your message was sent. I’ll reply within two working days.", true);
        form.reset();

        // Optional: scroll to top after a short pause
        setTimeout(() => {
          const top = document.querySelector("#home");
          if (top) top.scrollIntoView({ behavior: "smooth" });
        }, 800);
      } else if (res.status === 422) {
        // Validation from server
        const msg = data?.error || "Please check your details and try again.";
        setStatus(msg, false);
      } else {
        const msg =
          data?.error ||
          "Sorry, something went wrong. Please email me directly at info@anuajjan.com.";
        setStatus(msg, false);
      }
    } catch (err) {
      setStatus("Network error. Please try again, or email info@anuajjan.com.", false);
    } finally {
      disableForm(false);
    }
  });
})();
