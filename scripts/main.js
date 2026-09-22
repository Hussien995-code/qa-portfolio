(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==================== PREMIUM NAME TYPING ==================== */
  const siteMark = document.getElementById('site-mark');
  const markText = document.querySelector('.site-header__mark-text');
  const markCursor = document.querySelector('.site-header__mark-cursor');

  if (markText && siteMark) {
    const fullName = 'Hussien Altarabeen';

    if (prefersReducedMotion) {
      markText.textContent = fullName;
    } else {
      let currentIndex = 0;

      // Hide text initially, show cursor placeholder
      markText.textContent = '';

      // Typing animation: character by character
      const typeInterval = setInterval(() => {
        if (currentIndex < fullName.length) {
          markText.textContent += fullName[currentIndex];
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          // Typing complete - cursor will fade out via CSS animation
        }
      }, 70); // 70ms per character for premium feel

      // Subtle parallax on name after typing completes
      document.addEventListener('mousemove', (e) => {
        if (currentIndex === fullName.length) {
          const rect = siteMark.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const x = (e.clientX - centerX) * 0.003; // Very subtle: 0.3%
            const y = (e.clientY - centerY) * 0.003;
            siteMark.style.transform = `translate(${x}px, ${y}px)`;
          }
        }
      }, { passive: true });
    }
  }

  /* ==================== HERO PARALLAX ==================== */
  const hero = document.querySelector('.hero');
  const heroContent = document.querySelector('.hero__content');

  if (hero && heroContent && !prefersReducedMotion) {
    document.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const x = (e.clientX - rect.left - centerX) * 0.015;
        const y = (e.clientY - rect.top - centerY) * 0.015;
        heroContent.style.transform = `translate(${x}px, ${y}px)`;
      }
    }, { passive: true });
  }

  /* ==================== SKILL CARDS & SKILLS ==================== */
  const skills = document.querySelectorAll('.skill');
  const cards = document.querySelectorAll('.skill-card');
  const openSet = new Set();

  const closeSkill = (skill) => {
    skill.dataset.open = 'false';
    skill.querySelector('.skill__name').setAttribute('aria-expanded', 'false');
    skill.querySelector('.skill__test').setAttribute('aria-hidden', 'true');
  };

  const openSkill = (skill) => {
    skill.dataset.open = 'true';
    skill.querySelector('.skill__name').setAttribute('aria-expanded', 'true');
    skill.querySelector('.skill__test').setAttribute('aria-hidden', 'false');
  };

  const activateCard = (card) => {
    if (card.dataset.active === 'true') return;
    cards.forEach((c) => {
      if (c !== card) c.dataset.active = 'false';
    });
    openSet.forEach((skill) => {
      if (skill.closest('.skill-card') !== card) {
        closeSkill(skill);
        openSet.delete(skill);
      }
    });
    card.dataset.active = 'true';
  };

  const deactivateAll = () => {
    cards.forEach((c) => { c.dataset.active = 'false'; });
    openSet.forEach(closeSkill);
    openSet.clear();
  };

  cards.forEach((card) => {
    card.dataset.active = 'false';
    card.addEventListener('click', () => activateCard(card));
    card.addEventListener('mouseleave', () => {
      if (card.dataset.active === 'true') deactivateAll();
    });
  });

  skills.forEach((skill) => {
    const trigger = skill.querySelector('.skill__name');
    trigger.addEventListener('click', () => {
      const isOpen = skill.dataset.open === 'true';
      if (isOpen) {
        closeSkill(skill);
        openSet.delete(skill);
      } else {
        openSkill(skill);
        openSet.add(skill);
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.skill-card')) {
      deactivateAll();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') deactivateAll();
  });
})();

(() => {
  /* ==================== FOOTER YEAR ==================== */
  const footerYear = document.getElementById('footer-year');
  if (footerYear) footerYear.textContent = new Date().getFullYear();
})();

(() => {
  /* ==================== MOBILE NAV TOGGLE ==================== */
  const toggle = document.getElementById('site-nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  const closeNav = () => {
    nav.dataset.open = 'false';
    toggle.setAttribute('aria-expanded', 'false');
  };
  const openNav = () => {
    nav.dataset.open = 'true';
    toggle.setAttribute('aria-expanded', 'true');
  };

  nav.dataset.open = 'false';

  toggle.addEventListener('click', () => {
    if (nav.dataset.open === 'true') closeNav();
    else openNav();
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });

  document.addEventListener('click', (e) => {
    if (nav.dataset.open === 'true' && !e.target.closest('.site-nav') && !e.target.closest('.site-nav__toggle')) {
      closeNav();
    }
  });
})();

(() => {
  /* ==================== QA LAB: BUG TRIAGE ==================== */
  const root = document.getElementById('qa-lab-root');
  if (!root) return;

  const tickets = Array.from(root.querySelectorAll('.ticket'));
  const total = tickets.length;
  const currentEl = document.getElementById('qa-lab-current');
  const tallyEl = document.getElementById('qa-lab-tally');
  const progressFill = document.getElementById('qa-lab-progress-fill');
  const backBtn = document.getElementById('qa-lab-back');
  const nextBtn = document.getElementById('qa-lab-next');
  const nextLabel = document.getElementById('qa-lab-next-label');
  const notice = document.querySelector('.qa-notice');

  const VERDICT_LABELS = {
    defect: 'Genuine defect',
    expected: 'Expected behavior',
    'needs-info': 'Needs more information',
  };

  let index = 0;
  let noticeTimer = null;

  function scrollTicketIntoView() {
    const ticket = tickets[index];
    // Move focus to the new ticket's heading (preventScroll — a plain
    // .focus() here can't scroll on its own) — the useful landing point
    // for keyboard/AT users regardless of the scroll bug below.
    ticket.querySelector('.ticket__title')?.focus?.({ preventScroll: true });
    // scrollIntoView() called synchronously right after render() toggles
    // `hidden` was consistently landing partway into the ticket instead of
    // at its top — reproducible across both smooth and instant `behavior`,
    // and regardless of focus ordering, so it isn't an animation/focus
    // interruption. Deferring to the next frame and computing the target
    // manually sidesteps whatever stale-geometry timing caused it: by the
    // time this runs, the browser has fully committed the show/hide layout
    // change from render().
    requestAnimationFrame(() => {
      const scrollPaddingTop = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const targetY = window.scrollY + ticket.getBoundingClientRect().top - scrollPaddingTop;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'auto' });
    });
  }

  const showNotice = (text) => {
    if (!notice) return;
    notice.textContent = text;
    notice.dataset.visible = 'true';
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => { notice.dataset.visible = 'false'; }, 2600);
  };

  const isSubmitted = (ticket) => ticket.querySelector('.ticket__resolution').hidden === false;

  function updateTally() {
    const submitted = tickets.filter(isSubmitted);
    if (submitted.length === 0) {
      tallyEl.hidden = true;
      return;
    }
    const matched = submitted.filter((t) => t.querySelector('.ticket__resolution').dataset.match === 'true').length;
    tallyEl.hidden = false;
    tallyEl.textContent = `Verdict matched the actual resolution on ${matched} of ${submitted.length} so far`;
  }

  function render() {
    tickets.forEach((t, i) => { t.hidden = i !== index; });
    currentEl.textContent = String(index + 1);
    progressFill.style.width = `${((index + 1) / total) * 100}%`;
    backBtn.disabled = index === 0;

    const current = tickets[index];
    const submitted = isSubmitted(current);
    const isLast = index === total - 1;

    if (isLast && submitted) {
      nextLabel.textContent = 'Restart exercise';
      nextBtn.dataset.mode = 'restart';
      nextBtn.disabled = false;
    } else {
      nextLabel.textContent = 'Next report';
      nextBtn.dataset.mode = 'next';
      nextBtn.disabled = !submitted;
    }
  }

  function evaluateSubmitEnabled(ticket, idx) {
    const submitBtn = ticket.querySelector('.ticket__submit');
    const verdict = ticket.querySelector(`input[name="verdict-${idx}"]:checked`);
    if (!verdict) { submitBtn.disabled = true; return; }
    if (verdict.value === 'defect') {
      const severity = ticket.querySelector(`input[name="severity-${idx}"]:checked`);
      submitBtn.disabled = !severity;
    } else {
      submitBtn.disabled = false;
    }
  }

  function submitTicket(ticket) {
    const idx = ticket.dataset.index;
    const verdictInput = ticket.querySelector(`input[name="verdict-${idx}"]:checked`);
    if (!verdictInput) return;
    const verdict = verdictInput.value;
    const match = verdict === ticket.dataset.correctVerdict;

    ticket.querySelectorAll('input[type="radio"]').forEach((input) => { input.disabled = true; });

    const resolution = ticket.querySelector('.ticket__resolution');
    ticket.querySelector('.ticket__resolution-you-value').textContent = VERDICT_LABELS[verdict];
    resolution.dataset.match = String(match);
    resolution.hidden = false;
    ticket.querySelector('.ticket__submit').hidden = true;

    showNotice(`Assessment logged — Report ${idx} of ${total}`);
    updateTally();
    render();

    const heading = resolution.querySelector('.ticket__resolution-heading');
    if (heading) heading.focus();
  }

  function restart() {
    tickets.forEach((ticket) => {
      const idx = ticket.dataset.index;
      ticket.querySelectorAll('input[type="radio"]').forEach((input) => {
        input.checked = false;
        input.disabled = false;
      });
      ticket.querySelector('.ticket__field--severity').hidden = true;
      const resolution = ticket.querySelector('.ticket__resolution');
      resolution.hidden = true;
      delete resolution.dataset.match;
      const submitBtn = ticket.querySelector('.ticket__submit');
      submitBtn.hidden = false;
      submitBtn.disabled = true;
    });
    index = 0;
    tallyEl.hidden = true;
    render();
    scrollTicketIntoView();
    root.querySelector('.qa-lab__progress-label')?.focus?.({ preventScroll: true });
  }

  tickets.forEach((ticket) => {
    const idx = ticket.dataset.index;
    const severityField = ticket.querySelector('.ticket__field--severity');
    const severityInputs = ticket.querySelectorAll(`input[name="severity-${idx}"]`);

    ticket.querySelectorAll(`input[name="verdict-${idx}"]`).forEach((input) => {
      input.addEventListener('change', () => {
        const isDefect = input.checked && input.value === 'defect';
        severityField.hidden = !isDefect;
        if (!isDefect) severityInputs.forEach((s) => { s.checked = false; });
        evaluateSubmitEnabled(ticket, idx);
      });
    });

    severityInputs.forEach((input) => {
      input.addEventListener('change', () => evaluateSubmitEnabled(ticket, idx));
    });

    ticket.querySelector('.ticket__submit').addEventListener('click', () => submitTicket(ticket));
  });

  backBtn.addEventListener('click', () => {
    if (index > 0) { index -= 1; render(); scrollTicketIntoView(); }
  });

  nextBtn.addEventListener('click', () => {
    if (nextBtn.dataset.mode === 'restart') { restart(); return; }
    if (index < total - 1) { index += 1; render(); scrollTicketIntoView(); }
  });

  render();
})();
