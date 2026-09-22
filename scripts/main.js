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
