// script.js
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

document.addEventListener('DOMContentLoaded', () => {
  // Year
  $('#year').textContent = new Date().getFullYear();

  // Theme toggle
  const toggle = $('.theme-toggle');
  toggle.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme;
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
    toggle.querySelector('.icon').textContent = next === 'dark' ? '🌙' : '☀️';
  });

  // Reveal on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.1 });
  $$('.section, .card, .hero-inner').forEach(el => { el.classList.add('reveal'); observer.observe(el); });

  // Scroll spy
  const sections = ['home', 'work', 'skills', 'about', 'testimonials', 'contact'];
  const links = sections.map(id => ({ id, el: document.querySelector(`.nav a[href="#${id}"]`) }));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.el?.classList.toggle('active', l.id === e.target.id));
      }
    });
  }, { rootMargin: '-50% 0px -45% 0px' });
  sections.forEach(id => spy.observe(document.getElementById(id)));

  // Project data
  const projects = [

    //Powered By Athena
    {
      title: 'Athena',
      tag: 'Powered By Athena',
      meta: 'Python • Node • AI',
      desc: 'A mean, sassy and commanding AI assistant who isnt scared to share his opinions.',
      image: 'Images/Athena.png',
      links: { demo: 'https://bradygenik.com/athena', code: 'https://github.com/brady9999/Athena' }
    },
    {
      title: 'Apollo',
      tag: 'Powered By Athena',
      meta: 'Python • Node • AI',
      desc: 'A place for song writers to work on their song lryics',
      image: 'Images/Apollo.png',
      links: { demo: 'https://bradygenik.com/apollo', code: 'https://github.com/brady9999/Apollo' }
    },

    //Fun Projects
    {
      title: 'Hermes',
      tag: 'Fun Projects',
      meta: 'HTML • JavaScript • CSS',
      desc: 'A note taking project that will soon have Apollo implemented.',
      image: 'Images/Hermes.png',
      links: { demo: 'Hermes/Main.html', code: 'https://github.com/brady9999/Hermes' }
    },
    {
      title: 'Hephaestus',
      tag: 'Fun Projects',
      meta: 'HTML • JavaScript • CSS',
      desc: 'An art studio where you can draw and be creative.',
      image: 'Images/Hephaestus.png',
      links: { demo: '/Hepheastus/Main.html', code: 'https://github.com/brady9999/Hepheastus' }
    },

    //Poseidon
    {
      title: 'Poseidon',
      tag: 'Poseidon',
      meta: 'Pose • I • Don',
      desc: 'To be fully honest I have no idea what to make Poseidon but i just like the name you could say it is current in pre developement, I guess ',
      image: 'Images/NFY.png',
      links: { demo: '#', code: '#' }
    },

    //Helpful Projects
    {
      title: 'Dionysus',
      tag: 'Helpful Projects',
      meta: 'HTML • Json • CSV',
      desc: 'Soon Very Soon.',
      image: 'Images/NFY.png',
      links: { demo: '#', code: '#' }
    }
  ];

  const grid = $('#project-grid');
  const render = list => {
    grid.innerHTML = '';
    list.forEach(p => {
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `
        <div class="card-media">${p.image ? `<img src="${p.image}" alt="${p.title} project cover" loading="lazy">` : ''}</div>
        <div class="card-body">
          <h3 class="card-title">${p.title}</h3>
          <div class="card-meta">${p.meta}</div>
          <p class="card-desc">${p.desc}</p>
          <div class="card-actions">
            <a class="btn ghost" href="${p.links.demo}" aria-label="View ${p.title} demo">Demo</a>
            <a class="btn" href="${p.links.code}" aria-label="View ${p.title} source">Code</a>
          </div>
        </div>
      `;
      grid.appendChild(el);
    });
  };
  render(projects);

  // Filtering
  const filters = $$('.filter');
  filters.forEach(f => f.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    f.classList.add('active');
    const tag = f.dataset.filter;
    render(tag === 'all' ? projects : projects.filter(p => p.tag === tag));
  }));

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

  // Contact form validation + stub submit
  const form = $('#contact-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const note = $('#form-note');
    const name = $('#name');
    const email = $('#email');
    const message = $('#message');

    let valid = true;
    const setError = (el, msg) => { el.nextElementSibling.textContent = msg || ''; if (msg) valid = false; };

    setError(name, name.value.trim() ? '' : 'Please enter your name.');
    setError(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ? '' : 'Please enter a valid email.');
    setError(message, message.value.trim().length >= 12 ? '' : 'Please add a bit more detail (12+ characters).');

    if (!valid) return;

    note.textContent = 'Sending…';
    try {
      // Replace with your backend endpoint (e.g., Netlify Forms, Formspree, Cloudflare Workers)
      await new Promise(res => setTimeout(res, 600)); // Simulated network delay
      note.textContent = 'Thanks—your message has been sent. I’ll reply soon.';
      form.reset();
    } catch {
      note.textContent = 'Something went wrong. Please try again or email hello@thebrady.ca.';
    }
  });
});

  function toggleMenu() {
    document.querySelector(".nav-links").classList.toggle("show");
    document.querySelector(".hamburger").classList.toggle("open");
  }