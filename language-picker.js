// Lucian UX/UI Prompt #448 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#448
const languages = [
  { key: 'ko', tag: 'ko', name: '한국어', menu: '언어 선택' },
  { key: 'en', tag: 'en', name: 'English', menu: 'Choose language' },
  { key: 'ja', tag: 'ja', name: '日本語', menu: '言語を選択' },
  { key: 'zh', tag: 'zh-Hans', name: '简体中文', menu: '选择语言' },
  { key: 'es', tag: 'es', name: 'Español', menu: 'Elegir idioma' },
];

export function mountLanguagePicker(button, onChange) {
  const root = button.closest('.language-picker');
  const menuId = button.id + '-options';
  const globeClip = button.id + '-globe';
  const meridians = [-13, -5, 3, 11, 19, 27].map(x =>
    `M${x} 2.4c-4.2 2.6-4.2 14.6 0 17.2M${x} 2.4c4.2 2.6 4.2 14.6 0 17.2`
  ).join('');

  button.classList.add('language-trigger');
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', menuId);
  button.innerHTML = `
    <span class="language-globe" aria-hidden="true"><svg viewBox="0 0 22 22">
      <defs><clipPath id="${globeClip}"><circle cx="11" cy="11" r="8.6"/></clipPath></defs>
      <circle cx="11" cy="11" r="8.6"/>
      <g clip-path="url(#${globeClip})"><path class="language-meridians" d="${meridians}"/><path d="M2.6 8.2h16.8M2.6 13.8h16.8"/></g>
    </svg></span>
    <span class="language-label" aria-hidden="true"></span>
    <svg class="language-chevron" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.6 6 7.6l3-3"/></svg>`;

  const globe = button.querySelector('.language-globe');
  const label = button.querySelector('.language-label');
  const list = document.createElement('ul');
  list.className = 'language-options';
  list.id = menuId;
  list.tabIndex = -1;
  list.inert = true;
  list.setAttribute('role', 'listbox');
  list.innerHTML = languages.map(({ key, tag, name }, index) => `
    <li id="${menuId}-${key}" role="option" lang="${tag}" style="--option-index:${index}">
      <span>${name}</span><small aria-hidden="true">${key.toUpperCase()}</small>
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-6.5"/></svg>
    </li>`).join('');
  root.append(list);
  const options = Array.from(list.children);
  let selected = -1;
  let active = 0;

  function highlight(index) {
    active = (index + options.length) % options.length;
    options.forEach((option, i) => option.classList.toggle('is-active', i === active));
    const option = options[active];
    list.setAttribute('aria-activedescendant', option.id);
    const bottom = option.offsetTop + option.offsetHeight;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
  }

  function open() {
    list.inert = false;
    root.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
    highlight(selected);
    list.focus({ preventScroll: true });
  }

  function close(restoreFocus = false) {
    if (list.inert) return;
    if (restoreFocus) button.focus({ preventScroll: true });
    list.inert = true;
    root.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
  }

  function select(index) {
    close(true);
    onChange(languages[index].key);
  }

  button.addEventListener('click', () => list.inert ? open() : close(true));
  button.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      open();
    }
  });
  options.forEach((option, index) => {
    option.addEventListener('pointerenter', () => highlight(index));
    option.addEventListener('click', () => select(index));
  });
  list.addEventListener('keydown', event => {
    switch (event.key) {
      case 'ArrowDown': highlight(active + 1); break;
      case 'ArrowUp': highlight(active - 1); break;
      case 'Home': highlight(0); break;
      case 'End': highlight(options.length - 1); break;
      case 'Enter':
      case ' ': select(active); break;
      case 'Escape': close(true); break;
      case 'Tab': close(true); return;
      default: return;
    }
    event.preventDefault();
    event.stopPropagation();
  });
  document.addEventListener('pointerdown', event => {
    if (!root.contains(event.target)) close();
  });
  root.addEventListener('focusout', event => {
    if (!root.contains(event.relatedTarget)) close();
  });

  function fitLabel() {
    const current = label.lastElementChild;
    if (current) label.style.width = Math.ceil(current.getBoundingClientRect().width) + 'px';
  }
  const labelObserver = new ResizeObserver(fitLabel);

  return function update(lang) {
    const index = languages.findIndex(item => item.key === lang);
    if (index < 0 || index === selected) return;
    const { name, tag, menu } = languages[index];
    const animate = selected !== -1;
    selected = index;
    options.forEach((option, i) => option.setAttribute('aria-selected', String(i === selected)));
    if (!list.inert) highlight(index);
    list.setAttribute('aria-label', menu);
    button.setAttribute('aria-label', menu + ' · ' + name);
    const next = document.createElement('span');
    next.lang = tag;
    next.textContent = name;
    if (animate) {
      label.querySelector('.is-out')?.remove();
      const old = label.lastElementChild;
      old.className = 'is-out';
      setTimeout(() => old.remove(), 420);
      next.className = 'is-in';
      globe.classList.remove('is-spinning');
      void globe.offsetWidth;
      globe.classList.add('is-spinning');
    }
    label.append(next);
    labelObserver.disconnect();
    labelObserver.observe(next);
    fitLabel();
  };
}
