'use strict';
const LOCAL_PROJECTS = [
  { name: 'Diarrhea', description: 'The bad case of diarrhea video experience.', pageUrl: 'diarrhea.html', emoji: '💩' },
  { name: 'Login Demo', description: 'A playful login page showcasing bad design concepts.', pageUrl: 'login.html', emoji: '🔐' },
  { name: 'Valentine', description: 'A playful Valentine page.', pageUrl: 'valentine.html', emoji: '💖' }
].map(project => ({ ...project, sourceUrl: 'https://github.com/phoenixthrush/poop' }));

const URL_OVERRIDES = {
  'windows-activator': 'https://www.phoenixthrush.com/windows-activator/site/index.html',
  '16-9': 'https://www.phoenixthrush.com/16-9/site/',
  'ballsack': 'https://www.phoenixthrush.com/ballsack/site/',
  'fake-captive-portal': 'https://www.phoenixthrush.com/Fake-Captive-Portal/hotspot-detect.html',
  'nekofy': 'https://www.phoenixthrush.com/Nekofy/popup.html',
  'node-stranger-chat': 'https://www.phoenixthrush.com/Node-Stranger-Chat/src/public/index.html',
  'shrimp-detector': 'https://www.phoenixthrush.com/Shrimp-Detector/src/site/index.html'
};

const ICONS = {
  'gist-explorer': '📝', 'blog': '📚', 'brainrot': '🧠', 'love-tester': '💕',
  'windows-activator': '🔑', 'aniworld-downloader': '📺', 'dont-press-the-button': '🚫',
  'shrimp-detector': '🦐', 'hackme': '🔓', 'powershell-encoder': '⚡', 'blocklist': '🛡️',
  'phoenixthrush.github.io': '🏠', 'minecraft': '⛏️', '16-9': '🖥️', 'ballsack': '📱',
  'chrome-dino': '🦕', 'durian': '🍈', 'fake-captive-portal': '📶', 'nekofy': '🐱',
  'node-stranger-chat': '💬', 'spinning-chip': '🌀', 'wolf': '🐺', 'the-evil-book': '📖'
};
let projects = [...LOCAL_PROJECTS];
const grid = document.getElementById('project-grid');
const message = document.getElementById('load-message');
const retry = document.getElementById('retry');
const search = document.getElementById('project-search');

function createCard(project, index) {
  const card = document.createElement('article');
  card.className = 'project-card';
  const top = document.createElement('div');
  top.className = 'card-top';
  const emoji = document.createElement('span');
  emoji.className = 'project-icon';
  emoji.dataset.color = index % 5;
  emoji.setAttribute('aria-hidden', 'true');
  emoji.textContent = project.emoji;
  top.append(emoji);
  if (Number.isFinite(project.stars)) {
    const stars = document.createElement('span');
    stars.className = 'project-stars';
    stars.setAttribute('aria-label', `${project.stars} GitHub ${project.stars === 1 ? 'star' : 'stars'}`);
    stars.title = 'Repository stars on GitHub';
    stars.textContent = `☆ ${project.stars.toLocaleString('en-US')}`;
    top.append(stars);
  }

  const title = document.createElement('h2');
  title.className = 'project-title';
  title.textContent = project.name;
  const description = document.createElement('p');
  description.className = 'project-description';
  description.textContent = project.description;
  const links = document.createElement('div');
  links.className = 'project-links';
  const live = document.createElement('a');
  live.href = project.pageUrl;
  live.target = '_blank';
  live.rel = 'noopener noreferrer';
  live.setAttribute('aria-label', `Open ${project.name} live site`);
  live.innerHTML = `Live site ${icon('arrow', 14)}`;
  const source = document.createElement('a');
  source.className = 'source-link';
  source.href = project.sourceUrl;
  source.target = '_blank';
  source.rel = 'noopener noreferrer';
  source.setAttribute('aria-label', `View ${project.name} repository`);
  source.innerHTML = `${icon('code', 14)} Repository`;
  links.append(live, source);
  card.append(top, title, description);
  if (project.warning) {
    const warning = document.createElement('p');
    warning.className = 'project-warning';
    warning.id = `project-warning-${index}`;
    warning.textContent = project.warning;
    live.setAttribute('aria-describedby', warning.id);
    card.append(warning);
  }
  card.append(links);
  return card;
}

function render() {
  const query = search.value.trim().toLowerCase();
  const cards = projects.flatMap((project, index) =>
    `${project.name} ${project.description}`.toLowerCase().includes(query)
      ? [createCard(project, index)]
      : []
  );
  grid.replaceChildren(...cards);
  document.getElementById('project-count').textContent = query
    ? `${cards.length} of ${projects.length} projects`
    : `${projects.length} projects`;
  document.getElementById('empty-state').hidden = cards.length > 0;
}

const CACHE_KEY = 'poop:github-pages:v2';
function validRepositories(value) {
  return Array.isArray(value) && value.every(repo => repo && typeof repo.name === 'string' && typeof repo.html_url === 'string' && repo.html_url.startsWith('https://github.com/phoenixthrush/') && (repo.description == null || typeof repo.description === 'string') && Number.isFinite(repo.stargazers_count));
}
function cachedRepositories() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    const age = Date.now() - cached?.savedAt;
    if (cached && age >= 0 && age < 86400000 && validRepositories(cached.repositories)) return cached.repositories;
  } catch { /* Invalid or unavailable storage is a cache miss. */ }
  return null;
}
async function fetchRepositories() {
  const repositories = [];
  for (let page = 1; ; page++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let current;
    try {
      const response = await fetch(`https://api.github.com/users/phoenixthrush/repos?per_page=100&page=${page}`, { signal: controller.signal });
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
      current = await response.json();
      if (!Array.isArray(current)) throw new Error('Unexpected repository response');
    } finally { clearTimeout(timeout); }
    repositories.push(...current.filter(repo => repo.has_pages).map(repo => ({ name: repo.name, description: repo.description, html_url: repo.html_url, stargazers_count: repo.stargazers_count })));
    if (current.length < 100) break;
  }
  if (!validRepositories(repositories)) throw new Error('Invalid repository data');
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), repositories })); } catch { /* Cache is optional. */ }
  return repositories;
}

function repositoryToProject(repo) {
  const slug = repo.name.toLowerCase();
  const match = Object.keys(ICONS).find(key => slug.includes(key));
  return {
    name: repo.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    description: repo.description || 'A web project by phoenixthrush.',
    pageUrl: URL_OVERRIDES[slug] || (slug === 'phoenixthrush.github.io'
      ? 'https://www.phoenixthrush.com/'
      : `https://www.phoenixthrush.com/${encodeURIComponent(repo.name)}/`),
    sourceUrl: repo.html_url,
    stars: repo.stargazers_count,
    warning: slug === 'dont-press-the-button'
      ? 'Warning: disruptive prank site. Avoid opening it in your main browser.'
      : null,
    emoji: match ? ICONS[match] : '🌐'
  };
}

async function loadProjects() {
  retry.hidden = true;
  message.textContent = 'Loading more projects from GitHub…';
  try {
    const repositories = cachedRepositories() ?? await fetchRepositories();
    const localRepository = repositories.find(repo => repo.name.toLowerCase() === 'poop');
    projects = [
      ...repositories
        .filter(repo => repo.name.toLowerCase() !== 'poop')
        .sort((a, b) => b.stargazers_count - a.stargazers_count || a.name.localeCompare(b.name))
        .map(repositoryToProject),
      ...LOCAL_PROJECTS.map(project => ({ ...project, stars: localRepository?.stargazers_count }))
    ];
    render();
    message.textContent = '';
  } catch {
    message.textContent = 'Couldn’t load GitHub projects. Local projects are still available.';
    retry.hidden = false;
  }
}

retry.addEventListener('click', loadProjects);
search.addEventListener('input', render);
render();
loadProjects();
