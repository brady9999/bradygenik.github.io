// Project data (fix typos as needed)
const projects = [
  {
    title: 'Athena',
    tag: 'Powered By OpenAI',
    meta: 'Python • Node • AI',
    desc: "an AI assistant who isn't scared to share her opinions.",
    links: { demo: 'https://athena.bradygenik.com/', code: 'https://github.com/brady9999/Athena' }
  },
  {
    title: 'Apollo',
    tag: 'Powered By OpenAI',
    meta: 'Python • Node • AI',
    desc: 'A place for song writers to work on their song lyrics',
    links: { demo: 'https://apollo.bradygenik.com/', code: 'https://github.com/brady9999/Apollo' }
  },
  {
    title: 'Hermes',
    tag: 'Fun Projects',
    meta: 'HTML • JavaScript • CSS',
    desc: 'A note taking project that will soon have Apollo implemented.',
    links: { demo: 'Hermes/Main.html', code: 'https://github.com/brady9999/Hermes' }
  },
  {
    title: 'Hephaestus',
    tag: 'Fun Projects',
    meta: 'HTML • JavaScript • CSS',
    desc: 'An art studio where you can draw and be creative.',
    links: { demo: '/Hephaestus/Main.html', code: 'https://github.com/brady9999/Hephaestus' }
  }
];

// Helpers
const grid = document.getElementById('projects-grid'); // matches your HTML id
if (!grid) throw new Error('Missing #projects-grid element');

const sanitizeUrl = (u) => (typeof u === 'string' && u.startsWith('http') ? u : u);

// Render function using DOM APIs
const render = list => {
  grid.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'project-card'; // match your CSS
    card.tabIndex = 0;
    card.setAttribute('role', 'listitem');

    // media
    const media = document.createElement('div');
    media.className = 'project-media';
    if (p.image) {
      const img = document.createElement('img');
      img.src = p.image;
      img.alt = `${p.title} project cover`;
      img.loading = 'lazy';
      img.decoding = 'async';
      media.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'project-placeholder';
      placeholder.textContent = p.title.charAt(0) || '?';
      media.appendChild(placeholder);
    }

    // body
    const body = document.createElement('div');
    body.className = 'project-body';

    const h3 = document.createElement('h3');
    h3.className = 'project-title';
    h3.textContent = p.title;

    const meta = document.createElement('div');
    meta.className = 'project-meta muted';
    meta.textContent = p.meta || '';

    const desc = document.createElement('p');
    desc.className = 'project-desc';
    desc.textContent = p.desc || '';

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const demoLink = document.createElement('a');
    demoLink.className = 'btn ghost';
    demoLink.textContent = 'Demo';
    demoLink.href = sanitizeUrl(p.links.demo) || '#';
    demoLink.target = '_blank';
    demoLink.rel = 'noopener noreferrer';
    demoLink.setAttribute('aria-label', `View ${p.title} demo`);

    const codeLink = document.createElement('a');
    codeLink.className = 'btn';
    codeLink.textContent = 'Code';
    codeLink.href = sanitizeUrl(p.links.code) || '#';
    codeLink.target = '_blank';
    codeLink.rel = 'noopener noreferrer';
    codeLink.setAttribute('aria-label', `View ${p.title} source`);
    

    actions.appendChild(demoLink);
    actions.appendChild(codeLink);

    // tags
    const tagsWrap = document.createElement('div');
    tagsWrap.className = 'tags';
    (p.meta || '').split('•').map(s => s.trim()).filter(Boolean).forEach(t => {
      const span = document.createElement('span');
      span.textContent = t;
      tagsWrap.appendChild(span);
    });

    // assemble
    body.appendChild(h3);
    body.appendChild(meta);
    body.appendChild(desc);
    body.appendChild(tagsWrap);
    body.appendChild(actions);

    card.appendChild(media);
    card.appendChild(body);
    grid.appendChild(card);
  });
};

render(projects);

// Filtering (assumes filter buttons have class .filter and data-filter value)
document.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tag = (btn.dataset.filter || 'all').toLowerCase();
    if (tag === 'all') render(projects);
    else render(projects.filter(p => (p.tag || '').toLowerCase() === tag));
  });
});