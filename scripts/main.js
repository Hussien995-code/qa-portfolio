(() => {
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
