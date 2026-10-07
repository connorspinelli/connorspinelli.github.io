/* ============================================================
   Experience data — edit this list to update the timeline.
   Dates are 'YYYY-MM'. end: null means "present".
   type: education | research | work | leadership
   milestone: true draws a diamond at `start` instead of a bar.
   ============================================================ */
const EXPERIENCE = [
  { label: 'BS Biomedical Eng. (Honors)', title: 'BS Biomedical Engineering (Honors)', org: 'University of Delaware',
    type: 'education', start: '2023-08', end: '2027-05', note: 'Minor in Biomechanical Engineering' },
  { label: 'Warehouse Associate', title: 'Warehouse Associate', org: 'General Plumbing Supply',
    type: 'work', start: '2024-06', end: '2024-08', inList: false },
  { label: 'Human Robotics Lab', title: 'Assistant Researcher', org: 'Human Robotics Lab, UD',
    type: 'research', start: '2024-08', end: '2025-10', note: 'MRI-compatible robot hardware and EMG analysis for stroke rehab studies.' },
  { label: 'VP, Sigma Pi', title: 'Vice President', org: 'Sigma Pi, Iota-Beta Chapter',
    type: 'leadership', start: '2024-11', end: '2025-11', note: 'Managed 21 chair positions and their committees.' },
  { label: 'VP Judicial Affairs, IFC', title: 'VP of Judicial Affairs & Expansion', org: 'Interfraternity Council, UD',
    type: 'leadership', start: '2025-05', end: null, note: 'Compliance and policy for 29 chapters, 1,800+ members.' },
  { label: 'INBRE Summer Research', title: 'Undergraduate Researcher', org: 'Delaware INBRE',
    type: 'research', start: '2025-06', end: '2025-08', note: 'EMG pipeline comparison, presented as a poster.' },
  { label: 'Machine Shop TA', title: 'Machine Shop Teaching Assistant', org: 'Spencer Lab Design Studio, UD',
    type: 'work', start: '2025-08', end: null, note: '100+ students a semester; senior design builds for NASA, Merck, Bloom Energy, Under Armour.' },
  { label: 'Biomechanical Eng. Minor', title: 'Biomechanical Engineering Minor', org: 'University of Delaware',
    type: 'education', start: '2026-02', milestone: true, inList: false },
  { label: 'Proscia', title: 'AI Automation Intern', org: 'Proscia, Philadelphia',
    type: 'work', start: '2026-06', end: null, note: 'Agent pipelines and MCP connectors for the content team. Part-time during the school year.' },
  { label: 'Capstone, Terumo Medical', title: 'Capstone Design', org: 'Sponsored by Terumo Medical',
    type: 'education', start: '2026-08', end: '2027-05', inList: false },
  { label: '4+1 MS Robotics', title: 'MS Robotics (4+1)', org: 'University of Delaware',
    type: 'education', start: '2026-08', end: '2028-05', inList: false },
];

const AXIS_START = '2023-08';
const AXIS_END   = '2027-08';   // last month shown (inclusive)

/* ============================================================
   Date helpers
   ============================================================ */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const parseYM = s => { const [y, m] = s.split('-').map(Number); return { y, m }; };
const monthIdx = s => { const a = parseYM(AXIS_START), b = parseYM(s); return (b.y - a.y) * 12 + (b.m - a.m); };
const fmt = s => { const { y, m } = parseYM(s); return `${MONTHS[m - 1]} ${y}`; };

const now = new Date();
const todayYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
const todayPos = monthIdx(todayYM) + (now.getDate() - 1) / daysInMonth;   // in months
const TOTAL = monthIdx(AXIS_END) + 1;
const pct = months => `${(Math.max(0, Math.min(months, TOTAL)) / TOTAL) * 100}%`;

const dateRange = e => {
  if (e.milestone) return fmt(e.start);
  if (!e.end) return `${fmt(e.start)} to present`;
  const future = monthIdx(e.end) + 1 > todayPos;
  return `${fmt(e.start)} to ${fmt(e.end)}${future ? ' (expected)' : ''}`;
};

/* ============================================================
   Gantt chart
   ============================================================ */
function renderGantt() {
  const root = document.getElementById('gantt');
  if (!root) return;

  const axis = [];
  for (let i = 0; i < TOTAL; i++) {
    const { y, m } = parseYM(AXIS_START);
    const d = new Date(y, m - 1 + i, 1);
    const left = pct(i + 0.5);
    if (d.getMonth() === 0 || i === 0) axis.push(`<span class="g-year" style="left:${pct(i)}">${d.getFullYear()}</span>`);
    if (i % 2 === 0) axis.push(`<span class="g-month" style="left:${left}">${MONTHS[d.getMonth()]}</span>`);
  }

  const grid = [];
  for (let i = 0; i <= TOTAL; i++) {
    const { m } = parseYM(AXIS_START);
    const isYear = (m - 1 + i) % 12 === 0;
    grid.push(`<div class="g-gridline${isYear ? ' g-gridline--year' : ''}" style="left:${pct(i)}"></div>`);
  }

  const rows = EXPERIENCE.map((e, i) => {
    const s = monthIdx(e.start);
    let marks;
    if (e.milestone) {
      marks = `<div class="g-milestone" data-i="${i}" style="--l:${pct(s + 0.5)}"></div>`;
    } else {
      const end = e.end ? monthIdx(e.end) + 1 : todayPos;
      const split = Math.min(Math.max(todayPos, s), end);
      marks = '';
      if (split > s) marks += `<div class="g-bar${e.todo ? ' g-bar--todo' : ''}" data-i="${i}" style="--l:${pct(s)};--w:calc(${pct(split)} - ${pct(s)})"></div>`;
      if (end > split) marks += `<div class="g-bar g-bar--future" data-i="${i}" style="--l:${pct(split)};--w:calc(${pct(end)} - ${pct(split)})"></div>`;
    }
    return `<div class="g-row" data-type="${e.type}"><div class="g-label" title="${e.title}">${e.label}</div><div class="g-track">${marks}</div></div>`;
  }).join('');

  root.innerHTML = `
    <div class="g-row g-axis"><div></div><div class="g-track">${axis.join('')}</div></div>
    <div class="g-body">
      <div class="g-grid">${grid.join('')}
        <div class="g-today" style="left:${pct(todayPos)}"><span>Today</span></div>
      </div>
      ${rows}
    </div>
    <div class="g-tip" role="tooltip"></div>`;

  // Shared tooltip
  const tip = root.querySelector('.g-tip');
  root.querySelectorAll('[data-i]').forEach(el => {
    const show = () => {
      const e = EXPERIENCE[+el.dataset.i];
      tip.innerHTML = `<em>${dateRange(e)}</em><strong>${e.title}</strong>${e.org}${e.note ? `<br>${e.note}` : ''}`;
      const r = el.getBoundingClientRect(), box = root.getBoundingClientRect();
      tip.classList.add('is-visible');
      const tw = tip.offsetWidth;
      let x = r.left - box.left + r.width / 2 - tw / 2;
      x = Math.max(8, Math.min(x, box.width - tw - 8));
      tip.style.left = `${x}px`;
      tip.style.top = `${r.bottom - box.top + 8}px`;
    };
    el.addEventListener('mouseenter', show);
    el.addEventListener('mouseleave', () => tip.classList.remove('is-visible'));
  });
}

/* ============================================================
   Experience list (readable on every screen size)
   ============================================================ */
function renderXpList() {
  const list = document.getElementById('xp-list');
  if (!list) return;
  const sorted = EXPERIENCE.filter(e => e.inList !== false && e.type !== 'education').sort((a, b) => b.start.localeCompare(a.start));
  list.innerHTML = sorted.map(e => `
    <li class="xp-item${e.todo ? ' xp-item--todo' : ''}" data-type="${e.type}">
      <div>
        <span class="xp-date">${dateRange(e)}</span>
        <span class="xp-title">${e.title}</span>
        <span class="xp-org">${e.org}</span>
        ${e.note ? `<p class="xp-note">${e.note}</p>` : ''}
      </div>
    </li>`).join('');
}

renderGantt();
renderXpList();

/* ============================================================
   Nav: scrolled state, mobile menu, active section
   ============================================================ */
const nav = document.getElementById('nav');
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 12);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const setMenu = open => {
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  navLinks.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
};
navToggle.addEventListener('click', () => setMenu(navToggle.getAttribute('aria-expanded') !== 'true'));
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', e => {
  const wasOpen = navLinks.classList.contains('is-open');
  setMenu(false);
  // With the mobile menu open the page is scroll-locked, so jump to the section ourselves
  const target = wasOpen && link.hash && document.querySelector(link.hash);
  if (!target) return;
  e.preventDefault();
  requestAnimationFrame(() => {
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    history.pushState(null, '', link.hash);
  });
}));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
matchMedia('(min-width: 861px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

const navAnchors = [...navLinks.querySelectorAll('a[href^="#"]')];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navAnchors.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main > section[id]').forEach(s => sectionObserver.observe(s));

/* ============================================================
   Scroll reveal
   ============================================================ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

const revealGroups = [
  '.section-title', '.case', '.cards .card', '.about-photo', '.about-copy',
  '.gantt', '.xp-item', '.skills', '.mosaic .tile', '.contact-copy', '.contact-form'
];
revealGroups.forEach(sel => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.setProperty('--d', `${(i % 5) * 70}ms`);
    revealObserver.observe(el);
  });
});

/* ============================================================
   3D viewers — hide hint after first interaction
   ============================================================ */
document.querySelectorAll('model-viewer').forEach(viewer => {
  const hint = viewer.parentElement.querySelector('.media-hint');
  if (!hint) return;
  viewer.addEventListener('camera-change', e => {
    if (e.detail.source === 'user-interaction') hint.classList.add('is-hidden');
  });
});

/* ============================================================
   Wrist support: 3D model / annotated toggle
   ============================================================ */
document.querySelectorAll('[data-set-view]').forEach(btn => {
  btn.addEventListener('click', () => {
    const media = btn.closest('.case-media');
    media.dataset.view = btn.dataset.setView;
    media.querySelectorAll('[data-set-view]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
  });
});

/* ============================================================
   PDF modal (desktop); phones just open the PDF in a new tab
   ============================================================ */
const modal = document.getElementById('pdf-modal');
const modalFrame = document.getElementById('pdf-modal-frame');
const modalTitle = document.getElementById('pdf-modal-title');
const modalOpen = document.getElementById('pdf-modal-open');

document.querySelectorAll('[data-pdf]').forEach(link => {
  link.addEventListener('click', e => {
    if (window.innerWidth < 860 || typeof modal.showModal !== 'function') return;
    e.preventDefault();
    modalFrame.src = link.dataset.pdf;
    modalOpen.href = link.dataset.pdf;
    modalTitle.textContent = link.dataset.title || 'Document';
    modal.showModal();
    document.body.style.overflow = 'hidden';
  });
});
const closeModal = () => modal.close();
document.getElementById('pdf-modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
modal.addEventListener('close', () => {
  document.body.style.overflow = '';
  setTimeout(() => { modalFrame.src = 'about:blank'; }, 150);
});

/* ============================================================
   Contact form — Formspree
   ============================================================ */
const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const setStatus = (msg, type) => { formStatus.textContent = msg; formStatus.className = `form-status ${type}`; };

form.addEventListener('submit', async e => {
  e.preventDefault();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !message) return setStatus('Please fill in all fields.', 'error');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setStatus('Please enter a valid email address.', 'error');

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Sending…';
  try {
    const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error();
    setStatus("Thanks! I'll get back to you soon.", 'success');
    form.reset();
  } catch {
    setStatus('Something went wrong. Please email me directly at cspin@udel.edu.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send message';
  }
});

document.getElementById('year').textContent = new Date().getFullYear();
