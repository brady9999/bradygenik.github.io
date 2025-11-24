document.addEventListener('DOMContentLoaded', () => {
  /* Helpers */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* Elements */
  const hamburger = $('#nav-hamburger');
  const mobileMenu = $('#mobile-menu');
  const themeToggle = $('#theme-toggle');
  const canvas = $('#bg-canvas');
  const terminalEl = $('#terminal-lines');
  const projectCards = $$('.project-card');
  const caseButtons = $$('[data-case]');
  const modal = $('#modal');
  const modalClose = modal && $('.modal-close', modal);
  const modalContent = $('#modal-content');
  const contactForm = $('#contact-form');

  /*Mobile menu (accessible)*/
  if (hamburger && mobileMenu) {
    // Start closed
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.hidden = true;

    const FOCUSABLE = 'a, button, input, textarea, [tabindex]:not([tabindex="-1"])';
    const getFocusables = () => $$ (FOCUSABLE, mobileMenu).filter(el => !el.hasAttribute('disabled'));

    function openMenu() {
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.hidden = false;
      mobileMenu.classList.add('open');
      const focusables = getFocusables();
      if (focusables.length) focusables[0].focus();
      document.addEventListener('keydown', onMenuKeydown);
      document.addEventListener('focus', enforceFocus, true);
    }

    function closeMenu(returnFocus = true) {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
      // wait for CSS transition then hide to remove from tab order
      setTimeout(() => { if (!mobileMenu.classList.contains('open')) mobileMenu.hidden = true; }, 300);
      document.removeEventListener('keydown', onMenuKeydown);
      document.removeEventListener('focus', enforceFocus, true);
      if (returnFocus) hamburger.focus();
    }

    function enforceFocus(e) {
      if (mobileMenu.hidden) return;
      if (mobileMenu.contains(e.target)) return;
      const focusables = getFocusables();
      if (focusables.length) focusables[0].focus();
      else hamburger.focus();
      e.preventDefault();
      e.stopPropagation();
    }

    function onMenuKeydown(e) {
      if (e.key === 'Escape') { closeMenu(true); return; }
      if (e.key === 'Tab') {
        const focusables = getFocusables();
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    hamburger.addEventListener('click', () => {
      const open = hamburger.getAttribute('aria-expanded') === 'true';
      if (open) closeMenu(true);
      else openMenu();
    });

    // Close when a link in the menu is clicked (allow navigation)
    mobileMenu.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link) closeMenu(false);
    });

    // If viewport expands beyond mobile, ensure menu resets
    const mq = window.matchMedia('(min-width: 981px)');
    const onMQ = (ev) => {
      if (ev.matches) { mobileMenu.classList.remove('open'); mobileMenu.hidden = true; hamburger.setAttribute('aria-expanded', 'false'); }
    };
    if (mq.addEventListener) mq.addEventListener('change', onMQ); else mq.addListener(onMQ);
  }

  /*Canvas blobs background*/
  const ctx = canvas && canvas.getContext && canvas.getContext('2d');
  function resizeCanvas() { if (!canvas) return; canvas.width = canvas.clientWidth || canvas.offsetWidth; canvas.height = canvas.clientHeight || canvas.offsetHeight; }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const blobs = [];
  if (ctx) {
    for (let i = 0; i < 6; i++) {
      blobs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        rx: 40 + Math.random() * 140,
        ry: 30 + Math.random() * 120,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        hue: 190 + Math.random() * 40,
        a: 0.04 + Math.random() * 0.06
      });
    }
  }

  function drawBlobs() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const b of blobs) {
      b.x += b.vx; b.y += b.vy;
      if (b.x < -b.rx) b.x = canvas.width + b.rx;
      if (b.x > canvas.width + b.rx) b.x = -b.rx;
      if (b.y < -b.ry) b.y = canvas.height + b.ry;
      if (b.y > canvas.height + b.ry) b.y = -b.ry;
      const g = ctx.createRadialGradient(b.x, b.y, Math.min(b.rx, b.ry) * 0.1, b.x, b.y, Math.max(b.rx, b.ry));
      g.addColorStop(0, `hsla(${b.hue},70%,68%,${b.a * 1.2})`);
      g.addColorStop(1, `hsla(${b.hue},40%,10%,0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.rx, b.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(drawBlobs);
  }
  drawBlobs();

  /*Terminal typing lines*/
  if (terminalEl) {
    const lines = [
    '$ uname -a\n    \nLinux thebrady 5.15.0-89-generic #98-Ubuntu SMP x86_64 GNU/Linux\n',
    '$ pwd\n    \n/home/brady/projects/apollo\n',
    '$ ls -l\n    \ntotal 12\n-rw-r--r-- 1 brady brady 1234 Nov 24 10:12 notes.txt\n-rw-r--r-- 1 brady brady 532 Nov 23 21:47 todo.md\ndrwxr-xr-x 2 brady brady 4096 Nov 24 09:55 src\n',
    '$ git status\n    \nOn branch main\nYour branch is up to date with \'origin/main\'.\n\nnothing to commit, working tree clean\n',
    '$ df -h\n    \nFilesystem Size Used Avail Use% Mounted on\n/dev/sda1 50G 20G 28G 42% /\n/dev/sdb1 200G 150G 50G 75% /mnt/storage\n',
    '$ ps aux | grep flask\n    \nbrady 2134 0.3 2.1 45632 9876 ? S 10:12 0:01 python3 apollo.py\nbrady 2140 0.0 0.1 6432 512 pts/0 S+ 10:12 0:00 grep --color=auto flask\n',
    '$ exit\n    \nlogout'


    ];
    let li = 0, pos = 0, frame = null;
  function tick() {
    const text = lines[li];
    if (pos <= text.length) {
      terminalEl.textContent = text.slice(0, pos++);
      frame = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(frame);
      setTimeout(() => {
        li = (li + 1) % lines.length;
        pos = 0;
        requestAnimationFrame(tick);
      }, 900);
    }
  }
  requestAnimationFrame(tick);
  }

  /*Ring skill rendering*/
  $$('.ring').forEach(ring => {
    const v = Number(ring.dataset.value || 65);
    const gold = getComputedStyle(document.documentElement).getPropertyValue('--gold-2') || '#f2c86a';
    ring.style.background = `conic-gradient(${gold.trim()} ${v * 3.6}deg, rgba(255,255,255,0.04) 0deg)`;
    ring.setAttribute('aria-hidden', 'true');
  });

  
  /* Modal (case studies) */
     
  function openModal(html) {
    if (!modal) return;
    modalContent.innerHTML = html;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // focus close button for keyboard users
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modalContent.innerHTML = '';
    document.body.style.overflow = '';
  }
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  caseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.case || 'case';
      const html = `
        <h3 style="color:var(--gold-2);margin-top:0">${id} — Engagement summary</h3>
        <p class="muted">Overview of scope, findings, and recommended remediation.</p>
        <h4>Process</h4><p>Recon → Validate → Exploit PoC → Post-exploit → Report</p>
        <h4>Highlights</h4><ul><li>Verified RCE with PoC</li><li>Chained escalation to admin</li><li>Remediation playbook included</li></ul>
        <div style="margin-top:12px"><a class="btn outline" href="#" target="_blank" rel="noopener">Open repo</a></div>
      `;
      openModal(html);
    });
  });

// Testimonials
  const testimonials = [
    {
      text: 'Brady brought clarity and momentum to a complex project—calm under pressure, decisive, and collaborative.',
      who: 'Foti — Office Manager'
    },
    {
      text: 'Brady works so fast and efficent you would think he is on quack.',
      who: 'Walter — Co-worker'
    },
  ];

  const track = $('#testimonial-track');
  let idx = 0;
  const draw = i => {
    track.innerHTML = `
      <div class="testimonial" role="group" aria-roledescription="slide" aria-label="Testimonial ${i+1} of ${testimonials.length}">
        <p>“${testimonials[i].text}”</p>
        <div class="who">— ${testimonials[i].who}</div>
      </div>
    `;
  };
  draw(idx);
  $('.carousel-prev').addEventListener('click', () => { idx = (idx - 1 + testimonials.length) % testimonials.length; draw(idx); });
  $('.carousel-next').addEventListener('click', () => { idx = (idx + 1) % testimonials.length; draw(idx); });
  /* End DOMContentLoaded */
});
