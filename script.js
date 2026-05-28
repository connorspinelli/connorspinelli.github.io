/* ============================================================
   Projects Dropdown
   ============================================================ */
const projectsDropdown = document.getElementById('nav-projects-dropdown');
const dropdownBtn      = projectsDropdown.querySelector('.nav-dropdown-btn');

dropdownBtn.addEventListener('click', e => {
  e.stopPropagation();
  const isOpen = projectsDropdown.hasAttribute('data-open');
  if (isOpen) {
    projectsDropdown.removeAttribute('data-open');
    dropdownBtn.setAttribute('aria-expanded', 'false');
  } else {
    projectsDropdown.setAttribute('data-open', '');
    dropdownBtn.setAttribute('aria-expanded', 'true');
  }
});

// Close dropdown when clicking outside
document.addEventListener('click', e => {
  if (!projectsDropdown.contains(e.target)) {
    projectsDropdown.removeAttribute('data-open');
    dropdownBtn.setAttribute('aria-expanded', 'false');
  }
});

// Close dropdown when a dropdown link is selected (on desktop)
projectsDropdown.querySelectorAll('.dropdown-menu a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth > 640) {
      projectsDropdown.removeAttribute('data-open');
      dropdownBtn.setAttribute('aria-expanded', 'false');
    }
  });
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    projectsDropdown.removeAttribute('data-open');
    dropdownBtn.setAttribute('aria-expanded', 'false');
  }
});

/* ============================================================
   Hamburger / Mobile Nav
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  const open = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', String(!open));
  navLinks.classList.toggle('open', !open);
});

// Close mobile menu when a non-dropdown nav link is clicked
navLinks.querySelectorAll('a:not(.dropdown-menu a)').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
  });
});

// Close mobile menu on outside click
document.addEventListener('click', e => {
  if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
    hamburger.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
  }
});

/* ============================================================
   Navbar scroll shadow
   ============================================================ */
const navbar = document.getElementById('navbar');

const onScroll = () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ============================================================
   Active nav link highlighting via IntersectionObserver
   ============================================================ */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

sections.forEach(s => sectionObserver.observe(s));

/* ============================================================
   Scroll-reveal animation
   ============================================================ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.ps-content, .stat-card, .skill-group, .about-text p'
).forEach((el, i) => {
  el.style.setProperty('--delay', `${i * 60}ms`);
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ============================================================
   Contact form — Formspree
   ============================================================ */
const form       = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

form.addEventListener('submit', async e => {
  e.preventDefault();

  const name    = form.name.value.trim();
  const email   = form.email.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !message) {
    setStatus('Please fill in all fields.', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    setStatus('Please enter a valid email address.', 'error');
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });

    if (response.ok) {
      setStatus("Message sent! I'll get back to you soon.", 'success');
      form.reset();
    } else {
      setStatus('Something went wrong. Please email me directly at cspin@udel.edu.', 'error');
    }
  } catch {
    setStatus('Something went wrong. Please email me directly at cspin@udel.edu.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  }
});

function setStatus(msg, type) {
  formStatus.textContent = msg;
  formStatus.className   = `form-note ${type}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ============================================================
   3D Model Viewer — dismiss hint on first interaction
   ============================================================ */
document.querySelectorAll('model-viewer').forEach(viewer => {
  const hint = viewer.closest('.ps-visual').querySelector('.ps-model-hint');
  if (!hint) return;
  viewer.addEventListener('camera-change', () => {
    hint.classList.add('hidden');
  }, { once: true });
});

/* ============================================================
   PDF Lightbox Modal
   ============================================================ */
const pdfModal      = document.getElementById('pdf-modal');
const pdfModalFrame = document.getElementById('pdf-modal-frame');
const pdfModalClose = document.getElementById('pdf-modal-close');
const pdfModalTitle = document.getElementById('pdf-modal-title');

document.querySelectorAll('.ps-pdf-expand').forEach(btn => {
  btn.addEventListener('click', () => {
    pdfModalFrame.src = btn.dataset.pdf;
    pdfModalTitle.textContent = btn.dataset.title || 'Document';
    pdfModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

pdfModalClose.addEventListener('click', closePdfModal);

pdfModal.addEventListener('click', e => {
  if (e.target === pdfModal) closePdfModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && pdfModal.classList.contains('open')) closePdfModal();
});

function closePdfModal() {
  pdfModal.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { pdfModalFrame.src = ''; }, 200);
}

/* ============================================================
   Inject reveal keyframes at runtime (avoids extra CSS parse)
   ============================================================ */
const style = document.createElement('style');
style.textContent = `
  .reveal {
    opacity: 0;
    transform: translateY(22px);
    transition: opacity 0.55s var(--delay, 0ms) ease,
                transform 0.55s var(--delay, 0ms) ease;
  }
  .reveal.visible {
    opacity: 1;
    transform: none;
  }
`;
document.head.appendChild(style);
