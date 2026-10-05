/* Abas com teclado e acordeões exclusivos. Reutilizável em páginas HTML. */
(() => {
  'use strict';
  const all = (selector, root = document) => [...root.querySelectorAll(selector)];
  all('.blips').forEach(root => {
all('[role="tablist"]', root).forEach(list => {
  const tabs = all('[role="tab"]', list);
  function activate(tab, focus = false) {
    tabs.forEach(button => {
      const selected = tab === button;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      document.getElementById(button.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      const key = event.key;
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(key)) return;
      event.preventDefault();
      const next = key === 'Home' ? 0 : key === 'End' ? tabs.length - 1 : (index + (key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      activate(tabs[next], true);
    });
  });
});
all('[data-single-open]', root).forEach(group => {
  all('details', group).forEach(detail => detail.addEventListener('toggle', () => {
    if (detail.open) all('details', group).filter(other => other !== detail).forEach(other => other.open = false);
  }));
});
  });
})();
