(() => {
  const icons = {
    arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
    moon: '<path d="M20 13a8 8 0 0 1-9-9 8.5 8.5 0 1 0 9 9Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-16-2 20"/>'
  };
  window.icon = (name, size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.code}</svg>`;

  let saved;
  try { saved = localStorage.getItem('poop:theme'); } catch { /* Storage is optional. */ }
  document.documentElement.dataset.theme = saved === 'dark' || saved === 'light'
    ? saved
    : 'dark';

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('themeToggle');
    function updateButton() {
      const dark = document.documentElement.dataset.theme === 'dark';
      toggle.innerHTML = icon(dark ? 'sun' : 'moon');
      toggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
    }
    toggle.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('poop:theme', next); } catch { /* Storage is optional. */ }
      updateButton();
    });
    updateButton();
  });
})();
