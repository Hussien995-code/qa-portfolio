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
  // One state object drives the whole exercise; every transition updates it
  // and calls render(), so panels, buttons, progress and each report's
  // locked/revealed state always agree. The answer key lives on each
  // <article> (data-correct-verdict / data-correct-severity) and is the only
  // source used by feedback, the score and the results summary.
  //
  // Scoring: a report scores when the verdict matches the resolution.
  // Severity is required for a "Genuine defect" verdict (real triage needs
  // it) but is only compared, never scored: the resolutions themselves treat
  // severity as a judgment call ("for discussion").
  const root = document.getElementById('qa-lab-root');
  if (!root) return;

  const VERDICTS = {
    defect: 'Genuine defect',
    expected: 'Expected behavior',
    'needs-info': 'Needs more information',
  };
  const SEVERITIES = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };

  const panels = {
    intro: root.querySelector('[data-stage-panel="intro"]'),
    run: root.querySelector('[data-stage-panel="run"]'),
    results: root.querySelector('[data-stage-panel="results"]'),
  };
  const tickets = Array.from(root.querySelectorAll('.ticket'));
  const total = tickets.length;
  const el = {
    start: document.getElementById('qa-lab-start'),
    title: document.getElementById('qa-lab-title'),
    mode: document.getElementById('qa-lab-mode'),
    current: document.getElementById('qa-lab-current'),
    steps: Array.from(document.querySelectorAll('#qa-lab-steps li')),
    toResults: document.getElementById('qa-lab-to-results'),
    back: document.getElementById('qa-lab-back'),
    next: document.getElementById('qa-lab-next'),
    nextLabel: document.getElementById('qa-lab-next-label'),
    resultsTitle: document.getElementById('qa-lab-results-title'),
    score: document.getElementById('qa-lab-score'),
    summary: document.getElementById('qa-lab-summary'),
    review: document.getElementById('qa-lab-review'),
    restart: document.getElementById('qa-lab-restart'),
  };

  const key = tickets.map((t) => ({
    verdict: t.dataset.correctVerdict,
    severity: t.dataset.correctSeverity || null,
    title: t.querySelector('.ticket__title').lastChild.textContent.trim(),
  }));

  const state = {
    stage: 'intro', // 'intro' | 'run' | 'results'
    reviewing: false,
    index: 0,
    answers: new Array(total).fill(null), // { verdict, severity } once checked
  };

  const isChecked = (i) => state.answers[i] !== null;
  const isCorrect = (i) => isChecked(i) && state.answers[i].verdict === key[i].verdict;
  const score = () => key.filter((_, i) => isCorrect(i)).length;
  const describe = (a) => VERDICTS[a.verdict] + (a.verdict === 'defect' && a.severity ? ` · ${SEVERITIES[a.severity]} severity` : '');

  // The in-progress (not yet checked) selection lives in the radios.
  function draft(i) {
    const t = tickets[i];
    const verdict = t.querySelector(`input[name="verdict-${i + 1}"]:checked`)?.value || null;
    const severity = t.querySelector(`input[name="severity-${i + 1}"]:checked`)?.value || null;
    return { verdict, severity, complete: !!verdict && (verdict !== 'defect' || !!severity) };
  }

  function fillResolution(i) {
    const t = tickets[i];
    const a = state.answers[i];
    const k = key[i];
    const correct = isCorrect(i);
    const outcome = t.querySelector('.ticket__outcome');
    outcome.dataset.status = correct ? 'correct' : 'incorrect';
    t.querySelector('.ticket__outcome-text').textContent = correct ? 'Correct verdict' : 'Incorrect verdict';
    t.querySelector('.ticket__compare-yours').textContent = describe(a);
    t.querySelector('.ticket__compare-resolution').textContent = describe(k);
    const note = t.querySelector('.ticket__severity-note');
    if (a.verdict === 'defect' && k.verdict === 'defect') {
      note.hidden = false;
      note.textContent = a.severity === k.severity
        ? 'Your severity matches the resolution.'
        : `Your severity differs from the resolution (${SEVERITIES[a.severity]} vs ${SEVERITIES[k.severity]}). Severity isn't scored — the reasoning below explains the call.`;
    } else {
      note.hidden = true;
      note.textContent = '';
    }
  }

  function renderTicket(i) {
    const t = tickets[i];
    const checked = isChecked(i);
    t.hidden = !(state.stage === 'run' && i === state.index);
    t.dataset.checked = String(checked);
    t.querySelectorAll('input').forEach((input) => { input.disabled = checked; });
    const verdict = checked ? state.answers[i].verdict : draft(i).verdict;
    t.querySelector('.ticket__field--severity').hidden = verdict !== 'defect';
    t.querySelector('.ticket__resolution').hidden = !checked;
  }

  function buildSummary() {
    el.summary.textContent = '';
    key.forEach((k, i) => {
      const a = state.answers[i];
      const correct = isCorrect(i);
      const li = document.createElement('li');
      li.className = 'qa-lab__summary-row';
      li.dataset.status = correct ? 'correct' : 'incorrect';

      const main = document.createElement('div');
      main.className = 'qa-lab__summary-main';
      const title = document.createElement('p');
      title.className = 'qa-lab__summary-title';
      title.textContent = k.title;
      const detail = (label, text) => {
        const line = document.createElement('p');
        line.className = 'qa-lab__summary-detail';
        const name = document.createElement('span');
        name.textContent = `${label}: `;
        line.append(name, text);
        return line;
      };
      main.append(title, detail('Your answer', describe(a)), detail('Resolution', describe(k)));

      const outcome = document.createElement('span');
      outcome.className = 'qa-lab__summary-outcome';
      outcome.textContent = correct ? 'Correct' : 'Incorrect';

      const review = document.createElement('button');
      review.type = 'button';
      review.className = 'qa-lab__link qa-lab__summary-review';
      review.textContent = 'Review';
      review.setAttribute('aria-label', `Review report ${i + 1}: ${k.title}`);
      review.addEventListener('click', () => openReview(i));

      li.append(main, outcome, review);
      el.summary.append(li);
    });
  }

  function render() {
    Object.entries(panels).forEach(([name, panel]) => { panel.hidden = state.stage !== name; });
    tickets.forEach((_, i) => renderTicket(i));

    if (state.stage === 'run') {
      const i = state.index;
      const checked = isChecked(i);
      const isLast = i === total - 1;
      el.current.textContent = String(i + 1);
      el.mode.textContent = state.reviewing ? 'Reviewing' : 'QA Lab';
      el.toResults.hidden = !state.reviewing;
      el.steps.forEach((step, n) => {
        step.dataset.checked = String(isChecked(n));
        step.dataset.current = String(n === i);
      });
      el.back.disabled = i === 0;
      if (state.reviewing) {
        el.nextLabel.textContent = isLast ? 'Back to results' : 'Next report';
        el.next.disabled = false;
      } else if (!checked) {
        el.nextLabel.textContent = 'Check verdict';
        el.next.disabled = !draft(i).complete;
      } else {
        el.nextLabel.textContent = isLast ? 'See results' : 'Next report';
        el.next.disabled = false;
      }
    }

    if (state.stage === 'results') {
      el.score.textContent = String(score());
      buildSummary();
    }
  }

  // Keep the active panel's top in view, then move focus to the heading a
  // screen reader should hear next (without a second scroll jump).
  function show(target, scrollTo) {
    (scrollTo || target).scrollIntoView({ block: 'start' });
    target.focus({ preventScroll: true });
  }
  const ticketHeading = (i) => tickets[i].querySelector('.ticket__title');

  function goTo(i) {
    state.index = i;
    render();
    show(ticketHeading(i), panels.run);
  }

  function openReview(i) {
    state.stage = 'run';
    state.reviewing = true;
    goTo(i);
  }

  function showResults() {
    state.stage = 'results';
    state.reviewing = false;
    render();
    show(el.resultsTitle, panels.results);
  }

  // The primary button changes meaning after a check ("Check verdict" →
  // "Next report"); ignore a second activation straight after, so a
  // double-click can't skip past the feedback it just revealed.
  let lockedUntil = 0;

  el.start.addEventListener('click', () => {
    state.stage = 'run';
    goTo(0);
  });

  el.next.addEventListener('click', () => {
    if (performance.now() < lockedUntil) return;
    const i = state.index;
    if (state.reviewing) {
      if (i < total - 1) goTo(i + 1); else showResults();
      return;
    }
    if (!isChecked(i)) {
      const d = draft(i);
      if (!d.complete) return;
      state.answers[i] = { verdict: d.verdict, severity: d.verdict === 'defect' ? d.severity : null };
      fillResolution(i);
      render();
      const resolution = tickets[i].querySelector('.ticket__resolution');
      resolution.scrollIntoView({ block: 'start' });
      resolution.querySelector('.ticket__outcome').focus({ preventScroll: true });
      lockedUntil = performance.now() + 500;
      return;
    }
    if (i < total - 1) goTo(i + 1); else showResults();
  });

  el.back.addEventListener('click', () => {
    if (state.index > 0) goTo(state.index - 1);
  });

  el.toResults.addEventListener('click', showResults);
  el.review.addEventListener('click', () => openReview(0));

  el.restart.addEventListener('click', () => {
    state.answers.fill(null);
    state.reviewing = false;
    tickets.forEach((t) => {
      t.querySelectorAll('input').forEach((input) => { input.checked = false; });
      t.querySelector('.ticket__resolution').hidden = true;
    });
    state.stage = 'run';
    goTo(0);
  });

  tickets.forEach((t, i) => {
    t.addEventListener('change', (e) => {
      if (isChecked(i)) return;
      if (e.target.name === `verdict-${i + 1}` && e.target.value !== 'defect') {
        t.querySelectorAll(`input[name="severity-${i + 1}"]`).forEach((s) => { s.checked = false; });
      }
      render();
    });
  });

  // Links to the lab (hero CTA, header nav) move keyboard and screen-reader
  // focus into it, not just the scroll position.
  document.querySelectorAll('a[href="#qa-lab"]').forEach((link) => {
    link.addEventListener('click', () => {
      const target = state.stage === 'intro' ? el.title
        : state.stage === 'results' ? el.resultsTitle
        : ticketHeading(state.index);
      // After the browser's own fragment navigation, which resets focus.
      setTimeout(() => target.focus({ preventScroll: true }), 0);
    });
  });

  render();
})();
