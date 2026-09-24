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
  // Each card holds one piece of state: the index of its open skill, or -1.
  // Every interaction only changes that number and re-renders the whole card
  // from it, so at most one skill per card can ever be open and the visual
  // state, aria-expanded and panel visibility cannot drift apart. Cards are
  // independent of each other.
  const cards = document.querySelectorAll('.skill-card');

  cards.forEach((card) => {
    const skills = Array.from(card.querySelectorAll('.skill'));
    if (!skills.length) return;
    let openIndex = -1;

    skills.forEach((skill, i) => {
      const trigger = skill.querySelector('.skill__name');
      const panel = skill.querySelector('.skill__test');
      panel.id = `skill-${card.dataset.id}-${i + 1}`;
      trigger.setAttribute('aria-controls', panel.id);
      panel.inert = true;
      trigger.addEventListener('click', () => {
        openIndex = openIndex === i ? -1 : i;
        render();
      });
    });

    function render() {
      skills.forEach((skill, i) => {
        const open = i === openIndex;
        skill.dataset.open = String(open);
        if (open) skill.dataset.viewed = 'true';
        skill.querySelector('.skill__name').setAttribute('aria-expanded', String(open));
        const panel = skill.querySelector('.skill__test');
        panel.setAttribute('aria-hidden', String(!open));
        panel.inert = !open;
      });
      card.dataset.hasOpen = String(openIndex !== -1);
    }

    // Escape closes this card's open skill only, and only while focus is in it.
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && openIndex !== -1) {
        openIndex = -1;
        render();
      }
    });

    render();

    // The case count comes from the list itself, so it cannot go stale.
    const index = card.querySelector('.skill-card__index');
    if (index) {
      const count = document.createElement('span');
      count.className = 'skill-card__count';
      count.textContent = ` · ${skills.length} ${skills.length === 1 ? 'case' : 'cases'}`;
      index.append(count);
    }
  });

  // One-time discovery hint: the first time the Skills grid is mostly in view,
  // the first skill's ring and chevron rehearse the open state once. Skipped
  // for reduced motion, once per session, and if the visitor has already
  // opened something.
  const hintSkill = document.querySelector('.skill-card .skill');
  const HINT_KEY = 'skills-hint-shown';
  let hintShown = false;
  try { hintShown = sessionStorage.getItem(HINT_KEY) === '1'; } catch (_) { /* storage blocked */ }
  if (hintSkill && !prefersReducedMotion && !hintShown && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      io.disconnect();
      try { sessionStorage.setItem(HINT_KEY, '1'); } catch (_) { /* storage blocked */ }
      if (document.querySelector('.skill[data-viewed="true"]')) return;
      hintSkill.classList.add('is-hinting');
      hintSkill.addEventListener('animationend', (e) => {
        if (e.animationName === 'skill-hint-ring') hintSkill.classList.remove('is-hinting');
      });
    }, { threshold: 0.6 });
    io.observe(hintSkill.closest('.skill-card'));
  }
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
  const progressBlock = root.querySelector('.qa-lab__progress');
  const ticketsWrap = root.querySelector('.qa-lab__tickets');
  const navWrap = root.querySelector('.qa-lab__nav');
  const backBtn = document.getElementById('qa-lab-back');
  const nextBtn = document.getElementById('qa-lab-next');
  const nextLabel = document.getElementById('qa-lab-next-label');
  const notice = document.querySelector('.qa-notice');
  const completePanel = document.getElementById('qa-lab-complete');
  const completeScoreEl = document.getElementById('qa-lab-complete-score');
  const completeTitle = completePanel.querySelector('.qa-lab__complete-title');
  const reviewBtn = document.getElementById('qa-lab-review-btn');

  const VERDICT_LABELS = {
    defect: 'Genuine defect',
    expected: 'Expected behavior',
    'needs-info': 'Needs more information',
  };

  const SEVERITY_LABELS = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };

  let index = 0;
  let noticeTimer = null;
  let completed = false;
  let reviewing = false;

  function scrollTicketIntoView() {
    const ticket = tickets[index];
    ticket.querySelector('.ticket__title')?.focus?.({ preventScroll: true });
    ticket.scrollIntoView({ behavior: 'auto', block: 'start' });
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

  function matchedCount() {
    return tickets.filter((t) => t.querySelector('.ticket__resolution').dataset.match === 'true').length;
  }

  function render() {
    const showTickets = !completed || reviewing;
    progressBlock.hidden = !showTickets;
    ticketsWrap.hidden = !showTickets;
    navWrap.hidden = !showTickets;
    completePanel.hidden = showTickets;

    if (!showTickets) return;

    tickets.forEach((t, i) => { t.hidden = i !== index; });
    currentEl.textContent = String(index + 1);
    progressFill.style.width = `${((index + 1) / total) * 100}%`;
    backBtn.disabled = index === 0;

    const current = tickets[index];
    const submitted = isSubmitted(current);
    const isLast = index === total - 1;

    if (completed) {
      if (isLast) {
        nextLabel.textContent = 'Back to summary';
        nextBtn.dataset.mode = 'summary';
        nextBtn.disabled = false;
      } else {
        nextLabel.textContent = 'Next report';
        nextBtn.dataset.mode = 'next';
        nextBtn.disabled = false;
      }
    } else if (isLast && submitted) {
      nextLabel.textContent = 'See your results';
      nextBtn.dataset.mode = 'finish';
      nextBtn.disabled = false;
    } else {
      nextLabel.textContent = 'Next report';
      nextBtn.dataset.mode = 'next';
      nextBtn.disabled = !submitted;
    }
  }

  function goToSummary() {
    completed = true;
    reviewing = false;
    completeScoreEl.textContent = String(matchedCount());
    render();
    completeTitle?.focus?.({ preventScroll: true });
    completePanel.scrollIntoView({ behavior: 'auto', block: 'start' });
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

    const statusEl = resolution.querySelector('.ticket__resolution-status');
    statusEl.dataset.status = match ? 'correct' : 'incorrect';
    statusEl.querySelector('.ticket__resolution-status-text').textContent = match ? 'Correct' : 'Incorrect';

    const correctAnswerEl = resolution.querySelector('.ticket__resolution-correct-answer');
    correctAnswerEl.hidden = match;
    if (!match) {
      correctAnswerEl.querySelector('.ticket__resolution-correct-verdict-value').textContent = VERDICT_LABELS[ticket.dataset.correctVerdict];
      const severityWrap = correctAnswerEl.querySelector('.ticket__resolution-correct-severity-wrap');
      const correctSeverity = ticket.dataset.correctSeverity;
      if (ticket.dataset.correctVerdict === 'defect' && correctSeverity) {
        severityWrap.hidden = false;
        severityWrap.querySelector('.ticket__resolution-correct-severity-value').textContent = SEVERITY_LABELS[correctSeverity];
      } else {
        severityWrap.hidden = true;
      }
    }

    showNotice(`Assessment logged — Report ${idx} of ${total}`);
    updateTally();
    render();

    const heading = resolution.querySelector('.ticket__resolution-heading');
    if (heading) heading.focus();
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
    const mode = nextBtn.dataset.mode;
    if (mode === 'finish' || mode === 'summary') { goToSummary(); return; }
    if (index < total - 1) { index += 1; render(); scrollTicketIntoView(); }
  });

  reviewBtn.addEventListener('click', () => {
    reviewing = true;
    index = 0;
    render();
    scrollTicketIntoView();
  });

  render();
})();
