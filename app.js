import { SUPABASE_URL, SUPABASE_KEY, BUCKET } from './config.js';
import { LivePreviews, previewUrl } from './live-previews.js?v=sugar-vault-2';
import { cardDemo, demoHint, mountCardDemo, mountCoverPreview } from './card-demos.js?v=2';

const sb = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const UI = {
  zh: {
    title: 'Sugar 的仓库',
    sub: '我的交互作品、设计实验与开源收藏。',
    works: '作品', browse: '浏览作品', categories: '作品分类',
    search: '搜索作品', clear: '清空搜索', showAll: '查看全部作品',
    noResults: '没有找到匹配的作品', noSaved: '还没有收藏作品',
    savedWork: '收藏作品', bookmark: '收藏', unsave: '取消收藏',
    pin: '置顶', pinned: '已置顶', unpin: '取消置顶', unpinned: '已取消置顶',
    pinSessionOnly: '本次浏览有效，未能保存设置',
    dark: '切换深色模式', light: '切换浅色模式',
    preview: '实时预览', film: '视频', draft: '草稿',
    coverToggle: '切换实时预览和封面',
    filters: { all: '全部', '3d': '3D 场景', '2d': '2D 交互', video: '视频', other: '其它' },
    status: { live: '已上线', wip: '制作中', idea: '点子' },
    count: n => `${n} 件作品`, play: '去玩', open: '在线体验', view: '查看', openResource: '查看工具', source: '源码', watch: '观看', openVideo: '新窗口播放', tutorial: '教程',
    type: '类型', tech: '技术', host: '托管', year: '年份', close: '关闭', details: '查看详情：',
    add: '导入新创意',
    offline: '暂时连不上数据库，显示的是内置数据',
    login: '管理员登录', signOut: '退出', notAdmin: '未授权', importBtn: '导入',
    edit: '编辑', remove: '删除', confirmDelete: name => `确定删除「${name}」吗？图片也会一起删除，无法恢复。`,
    deleted: '已删除', saved: '已发布', savedDraft: '已保存为草稿',
    loginTitle: '管理员登录',
    email: '邮箱', password: '密码', signIn: '登录', signUp: '首次注册',
    pwShort: '密码至少 8 位', needEmail: '请填写邮箱和密码',
    signUpDone: '注册成功。请去邮箱点确认链接（确认后跳转的页面打不开也没关系），然后回到这里登录。',
    notAdminTitle: '已登录，但还不是管理员', notAdminHint: '把下面这串账号 ID 发给 Claude（或在 Supabase 里把它加入 vault_admins 表），之后刷新页面就能导入创意。',
    copy: '复制', copied: '已复制',
    editorNew: '导入新创意', editorEdit: '编辑创意',
    secImages: '图片', dropTitle: '拖入图片，或点击选择',
    cover: '封面', moveUp: '前移', del: '移除',
    secBasic: '基本信息', titleZh: '中文标题 *', titleEn: 'English title', category: '分类', statusL: '状态', yearL: '年份', hue: '主色',
    secCopy: '文案', kindZh: '类型', kindEn: 'Type (EN)', lineZh: '一句话介绍', lineEn: 'One-liner (EN)',
    leadZh: '详细介绍', leadEn: 'Description (EN)', tagsZh: '标签', tagsEn: 'Tags (EN)',
    secFacts: '数据亮点', factN: '数字', factZh: '中文说明', factEn: 'English label',
    secLinks: '链接', url: '在线地址', repo: '源码地址', techL: '技术', hostL: '托管平台',
    publish: '发布',
    jsonImport: '从 JSON 导入', jsonExport: '导出全部 JSON', jsonTemplate: '下载 JSON 模板',
    cancel: '取消', save: '保存', saving: '保存中…', uploading: (i, n) => `上传图片 ${i}/${n}…`,
    needTitle: '请填写中文标题', badUrl: '链接需要以 http:// 或 https:// 开头', tooMany: '最多 6 张图片',
    notImage: '只能上传图片文件', tooBig: '单张图片不能超过 20 MB',
    jsonBad: 'JSON 格式不对', jsonBatch: n => `文件里有 ${n} 条创意，全部直接导入吗？（图片需要是网址）`, jsonDone: n => `已导入 ${n} 条`,
    jsonFilled: '已从 JSON 填入表单，检查后保存'
  },
  en: {
    title: "Sugar's Vault",
    sub: 'My interactive projects, design experiments, and open-source finds.',
    works: 'Work', browse: 'Browse work', categories: 'Project category',
    search: 'Search projects', clear: 'Clear search', showAll: 'Show all projects',
    noResults: 'No matching projects', noSaved: 'No saved projects yet',
    savedWork: 'Saved projects', bookmark: 'Save', unsave: 'Remove from saved',
    pin: 'Pin', pinned: 'Pinned', unpin: 'Unpin', unpinned: 'Unpinned',
    pinSessionOnly: 'For this visit only; preferences could not be saved',
    dark: 'Switch to dark mode', light: 'Switch to light mode',
    preview: 'Live preview', film: 'Video', draft: 'Draft',
    coverToggle: 'Switch between live preview and cover',
    filters: { all: 'All', '3d': '3D scenes', '2d': '2D interaction', video: 'Films', other: 'Other' },
    status: { live: 'Live', wip: 'In progress', idea: 'Idea' },
    count: n => `${n} ${n === 1 ? 'project' : 'projects'}`, play: 'Play', open: 'Play online', view: 'View', openResource: 'View tool', source: 'Source', watch: 'Watch', openVideo: 'Open in new tab', tutorial: 'Tutorial',
    type: 'Type', tech: 'Tech', host: 'Hosting', year: 'Year', close: 'Close', details: 'View details: ',
    add: 'Import a new idea',
    offline: 'Database unreachable — showing built-in data',
    login: 'Admin sign in', signOut: 'Sign out', notAdmin: 'Not authorised', importBtn: 'Import',
    edit: 'Edit', remove: 'Delete', confirmDelete: name => `Delete "${name}"? Its images go too, and this can't be undone.`,
    deleted: 'Deleted', saved: 'Published', savedDraft: 'Saved as draft',
    loginTitle: 'Admin sign in',
    email: 'Email', password: 'Password', signIn: 'Sign in', signUp: 'First-time sign up',
    pwShort: 'Password needs at least 8 characters', needEmail: 'Enter your email and password',
    signUpDone: 'Signed up. Open the confirmation link in your email (it is fine if the page it lands on fails to load), then come back and sign in.',
    notAdminTitle: 'Signed in, but not an admin yet', notAdminHint: 'Send this account ID to Claude (or add it to the vault_admins table in Supabase), then reload to start importing.',
    copy: 'Copy', copied: 'Copied',
    editorNew: 'Import a new idea', editorEdit: 'Edit idea',
    secImages: 'Images', dropTitle: 'Drop images here, or click to choose',
    cover: 'Cover', moveUp: 'Move earlier', del: 'Remove',
    secBasic: 'Basics', titleZh: 'Chinese title *', titleEn: 'English title', category: 'Category', statusL: 'Status', yearL: 'Year', hue: 'Accent colour',
    secCopy: 'Copy', kindZh: 'Type (中文)', kindEn: 'Type (EN)', lineZh: 'One-liner (中文)', lineEn: 'One-liner (EN)',
    leadZh: 'Description (中文)', leadEn: 'Description (EN)', tagsZh: 'Tags (中文)', tagsEn: 'Tags (EN)',
    secFacts: 'Key numbers', factN: 'Number', factZh: 'Label (中文)', factEn: 'Label (EN)',
    secLinks: 'Links', url: 'Live URL', repo: 'Source URL', techL: 'Tech', hostL: 'Hosting',
    publish: 'Publish',
    jsonImport: 'Import JSON', jsonExport: 'Export all as JSON', jsonTemplate: 'JSON template',
    cancel: 'Cancel', save: 'Save', saving: 'Saving…', uploading: (i, n) => `Uploading image ${i}/${n}…`,
    needTitle: 'Enter a Chinese title', badUrl: 'Links must start with http:// or https://', tooMany: 'Up to 6 images',
    notImage: 'Only image files can be uploaded', tooBig: 'Each image must be under 20 MB',
    jsonBad: 'That JSON could not be read', jsonBatch: n => `The file has ${n} ideas. Import them all now? (Images must be URLs.)`, jsonDone: n => `Imported ${n}`,
    jsonFilled: 'Filled the form from JSON — check it, then save'
  }
};

const FIELDS = ['sort', 'published', 'category', 'status', 'year', 'hue', 'url', 'repo', 'images', 'title_zh', 'title_en', 'kind_zh', 'kind_en', 'line_zh', 'line_en', 'lead_zh', 'lead_en', 'tags_zh', 'tags_en', 'facts', 'tech', 'host'];
const MAX_PICS = 6;

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } }
};
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const isHttp = u => /^https?:\/\/\S+$/i.test(u || '');
const imgSrc = p => (isHttp(p) || /^assets\/[\w./-]+$/.test(p || '')) ? p : '';
// 在线地址是 mp4 时当作视频作品：详情里直接播放，封面用同名的 .jpg
const isVideo = u => isHttp(u) && /\.mp4(?=$|[?#])/i.test(u);

const state = {
  lang: store.get('vault-lang') === 'en' ? 'en' : 'zh',
  filter: 'all',
  ideas: [],
  source: 'db',
  user: null,
  isAdmin: false
};
const t = () => UI[state.lang];
const pick = (idea, f) => (state.lang === 'en' && idea[`${f}_en`]) || idea[`${f}_zh`] || '';
const tagsOf = idea => (state.lang === 'en' && idea.tags_en?.length ? idea.tags_en : idea.tags_zh) || [];

/* ---------------- 数据 ---------------- */

async function loadIdeas() {
  if (sb) {
    const { data, error } = await sb.from('vault_ideas').select('*').order('sort').order('created_at');
    if (!error) { const featured = {"sort":5,"published":true,"category":"2d","status":"live","year":2026,"hue":"#628e85","url":"https://sugarvei.github.io/idea-vault/qinglian/","repo":"https://github.com/SugarVei/idea-vault/tree/main/qinglian","images":["assets/qinglian-cover.svg"],"title_zh":"轻练 · 四日训练","title_en":"Qinglian · Four-Day Training","kind_zh":"健身计划与记录","kind_en":"Workout Planner","line_zh":"按自己的节奏，安排训练、记录每一次进步。","line_en":"Plan your week and track your progress at your own pace.","lead_zh":"适合不同性别与训练基础的四日分化训练工具，支持拖拽安排一周、查看动作示范、调整训练组数、记录训练与备份数据。","lead_en":"A flexible four-day workout planner for different experience levels, with a draggable weekly schedule, exercise demonstrations, adjustable sets, training records and backups.","tags_zh":["训练计划","动作示范","记录与统计"],"tags_en":["Weekly plan","Exercise demos","Progress tracking"],"facts":[{"n":"4","zh":"个训练日","en":"training days"},{"n":"14","zh":"个动作示范","en":"exercise demos"},{"n":"1–4","zh":"组可调","en":"sets per exercise"}],"tech":"HTML · CSS · JavaScript","host":"GitHub Pages"}; state.ideas = data.some(item => item.url === featured.url) ? data : [featured, ...data]; state.source = 'db'; return; }
    console.warn('vault: load failed', error);
  }
  state.ideas = await loadSeed();
  state.source = 'seed';
}

// 作品教程：按作品链接对应，放在 data/tutorials.json，有教程的作品详情里才出现“教程”按钮
let tutorials = {};
fetch('data/tutorials.json').then(r => r.ok ? r.json() : {}).then(d => { tutorials = d || {}; }).catch(() => {});

async function loadSeed() {
  try { return await (await fetch('data/seed.json')).json(); } catch { return []; }
}

async function refreshAuth(session) {
  state.user = session?.user ?? null;
  state.isAdmin = false;
  if (state.user && sb) {
    const { data } = await sb.from('vault_admins').select('user_id').eq('user_id', state.user.id).maybeSingle();
    state.isAdmin = !!data;
  }
}

/* ---------------- 页面 ---------------- */

const icons = {
  pin: '<path d="m16 3 5 5-4 1-4 4-1 4-5-5 4-1 4-4 1-4Z"/><path d="m7 17-4 4"/>',
  bookmark: '<path d="M7 4.75h10a1 1 0 0 1 1 1v14l-6-3.9-6 3.9v-14a1 1 0 0 1 1-1Z"/>',
  moon: '<path d="M19.7 15a8.2 8.2 0 0 1-10.7-10.7A8.25 8.25 0 1 0 19.7 15Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19m0-14-1.5 1.5m-11 11L5 19"/>',
  play: '<path d="M8 5.5 18 12 8 18.5Z" fill="currentColor" stroke="none"/>',
  image: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m6 17 5-4 2 2 3-3 2 2"/>'
};
const icon = name => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icons[name] + '</svg>';
const search = $('#search');
const grid = $('#grid');
const livePreviews = new LivePreviews();
const searchText = value => String(value ?? '').normalize('NFKC').toLowerCase();
const bookmarkKey = idea => idea.url || idea.id || idea.title_zh;
const searchIndex = idea => searchText([
  idea.title_zh, idea.title_en, idea.kind_zh, idea.kind_en,
  idea.line_zh, idea.line_en, idea.lead_zh, idea.lead_en,
  idea.tags_zh, idea.tags_en, idea.tech, idea.host
].flat().join(' '));

function readBookmarks() {
  try {
    const saved = JSON.parse(store.get('vault-bookmarks'));
    return new Set(Array.isArray(saved) ? saved : []);
  } catch { return new Set(); }
}
const bookmarks = readBookmarks();
const PIN_STORAGE_KEY = 'vault-pins';
function readPins() {
  try {
    const saved = JSON.parse(store.get(PIN_STORAGE_KEY));
    return Array.isArray(saved) ? [...new Set(saved.filter(key => typeof key === 'string' && key.length))] : [];
  } catch { return []; }
}
let pins = readPins();
let theme = store.get('vault-theme') === 'dark' ? 'dark' : 'light';
let savedOnly = false;
let indexedIdeas = [];

function renderTheme() {
  document.documentElement.dataset.theme = theme;
  const dark = theme === 'dark';
  $('meta[name="theme-color"]').content = dark ? '#151516' : '#ffffff';
  const toggle = $('#theme');
  toggle.innerHTML = icon(dark ? 'sun' : 'moon');
  toggle.setAttribute('aria-label', dark ? t().light : t().dark);
  toggle.title = dark ? t().light : t().dark;
}

function renderStatic() {
  const s = t();
  document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
  document.title = s.title + ' · SugarV';
  document.querySelectorAll('[data-t]').forEach(el => { el.textContent = s[el.dataset.t]; });
  search.placeholder = s.search;
  search.setAttribute('aria-label', s.search);
  $('#search-clear').setAttribute('aria-label', s.clear);
  $('#works').setAttribute('aria-label', s.works);
  $('#chips').setAttribute('aria-label', s.categories);
  const language = $('#language');
  language.textContent = state.lang === 'zh' ? 'EN' : '中';
  language.setAttribute('aria-label', state.lang === 'zh' ? 'Switch to English' : '切换到中文');
  $('#saved').innerHTML = icon('bookmark');
  $('#saved').setAttribute('aria-label', s.savedWork);
  $('#saved').title = s.savedWork;
  const cats = ['all', '3d', '2d', 'video'];
  if (state.ideas.some(idea => idea.category === 'other')) cats.push('other');
  if (!cats.includes(state.filter)) state.filter = 'all';
  $('#chips').innerHTML = cats.map(key =>
    '<button type="button" class="chip" data-filter="' + key + '" aria-pressed="' + (key === state.filter) + '">' + s.filters[key] + '</button>'
  ).join('');
  renderTheme();
  renderAdminBar();
}


function renderAdminBar() {
  const s = t(), bar = $('#adminBar');
  let html = '';
  if (state.user && state.isAdmin) {
    html = `<button type="button" class="pill solid" data-act="add">＋ ${s.importBtn}</button>
      <button type="button" class="pill" data-act="signout">${s.signOut}</button>`;
  } else if (state.user) {
    html = `<button type="button" class="pill" data-act="login">${s.notAdmin}</button>
      <button type="button" class="pill" data-act="signout">${s.signOut}</button>`;
  } else if (location.hash === '#admin' && sb) {
    html = `<button type="button" class="pill" data-act="login">${s.login}</button>`;
  }
  bar.innerHTML = html;
  bar.hidden = !html;
}

function cardHtml(idea, index) {
  const s = t();
  const title = pick(idea, 'title');
  const cover = (idea.images || []).map(imgSrc).find(Boolean);
  const film = isVideo(idea.url);
  const url = previewUrl(idea.url, film);
  const demo = film ? undefined : cardDemo(url);
  const kind = url ? (film ? 'film' : 'site') : 'cover';
  const details = esc(s.details + title);
  const previewTitle = esc(s.preview + ' · ' + title);
  const active = bookmarks.has(bookmarkKey(idea));
  const bookmarkLabel = esc((active ? s.unsave : s.bookmark) + ' · ' + title);
  const pinned = pins.includes(bookmarkKey(idea));
  const pinLabel = esc((pinned ? s.unpin : s.pin) + ' · ' + title);
  const poster = cover
    ? '<img src="' + esc(cover) + '" alt="" decoding="async"' + (index > 5 ? ' loading="lazy"' : '') + '>'
    : '<span class="cover-letter" aria-hidden="true">' + esc(title.slice(0, 1)) + '</span>';
  const control = kind === 'film'
    ? '<button class="video-start" type="button" aria-label="' + esc(s.watch + ' · ' + title) + '">' + icon('play') + '</button>'
    : kind === 'site'
      ? '<button class="preview-toggle" type="button" aria-label="' + esc(s.coverToggle) + '" title="' + esc(s.coverToggle) + '" aria-pressed="false" hidden>' + icon('image') + '</button>'
      : '';
  const media = demo
    ? '<div class="card-demo" data-demo="' + demo + '"></div>'
    : '<div class="project-frame" data-kind="' + kind + '" data-preview-url="' + esc(url) + '" data-title="' + previewTitle + '" data-preview-state="cover">' + poster + control + '</div>';
  const hint = idea.published === false ? s.draft : demo ? demoHint(demo, state.lang) : kind === 'film' ? s.film : kind === 'site' ? s.preview : s.cover;
  return '<article class="project-card" data-index="' + index + '">' +
    '<div class="stage">' +
      '<button type="button" class="stage-details" data-card-details aria-label="' + details + '"></button>' +
      media +
      '<button type="button" class="pin-button" data-pin aria-pressed="' + pinned + '" aria-label="' + pinLabel + '" title="' + pinLabel + '">' + icon('pin') + '<span>' + esc(pinned ? s.pinned : s.pin) + '</span></button>' +
      '<button type="button" class="bookmark icon-button" data-bookmark aria-pressed="' + active + '" aria-label="' + bookmarkLabel + '" title="' + bookmarkLabel + '">' + icon('bookmark') + '</button>' +
    '</div>' +
    '<div class="card-caption"><h2><button type="button" class="project-title" data-card-details aria-label="' + details + '">' + esc(title) + '</button></h2>' +
    '<span class="project-kind">' + esc(hint) + '</span></div>' +
  '</article>';
}

function renderGrid() {
  indexedIdeas = state.ideas.map(searchIndex);
  grid.innerHTML = state.ideas.map(cardHtml).join('') +
    (state.isAdmin ? '<button type="button" class="stage import-card" data-act="add"><span aria-hidden="true">+</span>' + esc(t().add) + '</button>' : '');
  grid.removeAttribute('aria-busy');
  applyPinOrder();
  for (const card of grid.querySelectorAll('.project-card')) {
    const demo = card.querySelector('.card-demo');
    if (demo) {
      mountCardDemo(demo, state.lang);
    } else {
      const host = card.querySelector('.project-frame');
      if (host.dataset.kind === 'film') continue;
      const idea = state.ideas[Number(card.dataset.index)];
      mountCoverPreview(host, (idea.images || []).map(imgSrc).filter(Boolean), state.lang);
    }
  }
  livePreviews.reset(grid.querySelectorAll('.project-frame[data-preview-url]:not([data-kind="cover"])'));
  applyFilter();
}

function applyFilter() {
  const query = searchText(search.value).trim();
  const terms = query ? query.split(/\s+/) : [];
  let count = 0;
  grid.querySelectorAll('.project-card').forEach(card => {
    const index = Number(card.dataset.index);
    const idea = state.ideas[index];
    const shown = (state.filter === 'all' || idea.category === state.filter) &&
      (!savedOnly || bookmarks.has(bookmarkKey(idea))) &&
      terms.every(term => indexedIdeas[index].includes(term));
    card.hidden = !shown;
    if (shown) count++;
    else card.querySelector('video')?.pause();
  });
  const importing = grid.querySelector('.import-card');
  if (importing) importing.hidden = savedOnly || Boolean(query);
  $('.intro').hidden = savedOnly || Boolean(query);
  $('#works').classList.toggle('filtered', savedOnly || Boolean(query));
  $('#search-clear').hidden = !search.value;
  $('#shortcut').classList.toggle('shortcut-hidden', Boolean(search.value));
  $('#saved').setAttribute('aria-pressed', String(savedOnly));
  document.querySelectorAll('[data-filter]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.filter === state.filter));
  });
  const ready = !grid.hasAttribute('aria-busy');
  $('#count').textContent = ready ? t().count(count) : '';
  $('#empty-results').hidden = !ready || count > 0 || (importing && !importing.hidden);
  $('#empty-message').textContent = savedOnly && !bookmarks.size ? t().noSaved : t().noResults;
  livePreviews.schedule();
}

function resetFilters() {
  state.filter = 'all';
  search.value = '';
  savedOnly = false;
  applyFilter();
}

function toggleBookmark(button, idea) {
  const key = bookmarkKey(idea);
  const active = !bookmarks.has(key);
  if (active) bookmarks.add(key);
  else bookmarks.delete(key);
  store.set('vault-bookmarks', JSON.stringify([...bookmarks]));
  const label = (active ? t().unsave : t().bookmark) + ' · ' + pick(idea, 'title');
  button.setAttribute('aria-pressed', String(active));
  button.setAttribute('aria-label', label);
  button.title = label;
  if (savedOnly) applyFilter();
}

function applyPinOrder() {
  const ranks = new Map(pins.map((key, rank) => [key, rank]));
  const rankOf = card => ranks.get(bookmarkKey(state.ideas[Number(card.dataset.index)])) ?? Infinity;
  const cards = [...grid.querySelectorAll('.project-card')].sort((a, b) =>
    rankOf(a) - rankOf(b) || Number(a.dataset.index) - Number(b.dataset.index));
  const focused = grid.contains(document.activeElement) ? document.activeElement : null;
  let next = grid.firstElementChild;
  for (const card of cards) {
    if (card === next) next = next.nextElementSibling;
    // Move existing cards so their demos and controls keep their state. DOM order
    // matches visual order for keyboard and screen-reader navigation.
    else if (typeof grid.moveBefore === 'function') grid.moveBefore(card, next);
    else grid.insertBefore(card, next);
  }
  if (focused && document.activeElement !== focused) focused.focus({ preventScroll: true });
  livePreviews.schedule();
}

function updatePinButtons() {
  for (const button of grid.querySelectorAll('[data-pin]')) {
    const idea = state.ideas[Number(button.closest('.project-card').dataset.index)];
    const active = pins.includes(bookmarkKey(idea));
    const label = (active ? t().unpin : t().pin) + ' · ' + pick(idea, 'title');
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', label);
    button.title = label;
    button.querySelector('span').textContent = active ? t().pinned : t().pin;
  }
}

function togglePin(button, idea) {
  const key = bookmarkKey(idea);
  const active = !pins.includes(key);
  pins = pins.filter(saved => saved !== key);
  if (active) pins.unshift(key);
  const persisted = store.set(PIN_STORAGE_KEY, JSON.stringify(pins));
  updatePinButtons();
  applyPinOrder();
  // Keep the activated control in view after its card moves, including when
  // using Enter / Space to pin or unpin a card deep in the gallery.
  button.focus({ preventScroll: true });
  button.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  toast((active ? t().pinned : t().unpinned) + ' · ' + pick(idea, 'title') +
    (persisted ? '' : ' · ' + t().pinSessionOnly));
}

function renderAll() { renderStatic(); renderGrid(); }


/* ---------------- 详情 ---------------- */

const sheet = $('#sheet');
function openSheet(idea, origin) {
  grid.querySelectorAll('video').forEach(video => video.pause());
  const s = t();
  const title = pick(idea, 'title');
  const imgs = (idea.images || []).map(imgSrc).filter(Boolean);
  const facts = (idea.facts || []).filter(f => f && f.n);
  const meta = [[s.type, pick(idea, 'kind')], [s.tech, idea.tech], [s.host, idea.host], [s.year, idea.year]].filter(([, v]) => v);
  const video = isVideo(idea.url);
  const mainHtml = video
    ? `<video src="${esc(idea.url)}" ${imgs.length ? `poster="${esc(imgs[0])}"` : ''} controls playsinline preload="metadata" aria-label="${esc(title)}"></video>`
    : imgs.length ? `<img src="${esc(imgs[0])}" alt="${esc(title)}">` : `<div class="media" style="--hue:${esc(idea.hue)}"><span class="cover-letter">${esc(title.slice(0, 1))}</span></div>`;
  sheet.innerHTML = `<div class="sheet-in">
    <div class="gallery">
      <div class="main${video ? ' video' : ''}">${mainHtml}</div>
      ${imgs.length > 1 && !video ? `<div class="thumbs">${imgs.map((src, j) => `<button type="button" aria-label="${j + 1}" aria-current="${j === 0}" data-src="${esc(src)}"><img src="${esc(src)}" alt=""></button>`).join('')}</div>` : ''}
    </div>
    <div class="info">
      <button type="button" class="close" aria-label="${s.close}" autofocus>×</button>
      <h2 id="sheet-title">${esc(title)}</h2>
      ${pick(idea, 'lead') || pick(idea, 'line') ? `<p class="lead">${esc(pick(idea, 'lead') || pick(idea, 'line'))}</p>` : ''}
      ${facts.length ? `<div class="facts">${facts.map(f => `<div><b>${esc(f.n)}</b><span>${esc((state.lang === 'en' && f.en) || f.zh || '')}</span></div>`).join('')}</div>` : ''}
      ${meta.length ? `<dl class="meta">${meta.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : ''}
      <div class="actions">
        ${isHttp(idea.url) ? `<a class="btn primary" href="${esc(idea.url)}" target="_blank" rel="noopener">${video ? s.openVideo : idea.category === 'other' ? s.openResource : s.open} ↗</a>` : ''}
        ${isHttp(idea.repo) ? `<a class="btn ghost" href="${esc(idea.repo)}" target="_blank" rel="noopener">${s.source} ↗</a>` : ''}
        ${tutorials[idea.url] ? `<button type="button" class="btn ghost" data-tutorial>${s.tutorial}</button>` : ''}
        ${state.isAdmin && idea.id ? `<span class="admin-actions"><button type="button" class="btn ghost" data-edit>${s.edit}</button><button type="button" class="btn danger" data-delete>${s.remove}</button></span>` : ''}
      </div>
    </div>
  </div>`;
  const main = sheet.querySelector('.main img');
  sheet.querySelectorAll('.thumbs button').forEach(b => b.addEventListener('click', () => {
    main.src = b.dataset.src;
    sheet.querySelectorAll('.thumbs button').forEach(x => x.setAttribute('aria-current', String(x === b)));
  }));
  sheet.querySelector('.close').addEventListener('click', () => sheet.close());
  sheet.querySelector('[data-edit]')?.addEventListener('click', () => { sheet.close(); openEditor(idea); });
  sheet.querySelector('[data-delete]')?.addEventListener('click', () => deleteIdea(idea));
  sheet.querySelector('[data-tutorial]')?.addEventListener('click', () => openTutorial(tutorials[idea.url]));
  sheet.showModal();
  if (origin) {
    const c = origin.getBoundingClientRect();
    sheet.style.transformOrigin = `${c.left + c.width / 2 - sheet.offsetLeft}px ${c.top + c.height / 2 - sheet.offsetTop}px`;
  }
}

/* ---------------- 教程 ---------------- */

const tutorialDlg = $('#tutorial');
function openTutorial(tut) {
  if (!tut) return;
  const s = t();
  const copy = tut[state.lang] || tut.zh;
  const imgs = tut.images || [];
  const cap = im => (state.lang === 'en' && im.en) || im.zh || '';
  tutorialDlg.innerHTML = `<div class="tut">
    <div class="tut-media">
      <a class="tut-main" href="${esc(imgs[0]?.src || '')}" target="_blank" rel="noopener"><img src="${esc(imgs[0]?.src || '')}" alt="${esc(cap(imgs[0] || {}))}"></a>
      <p class="tut-cap">${esc(cap(imgs[0] || {}))}</p>
      ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((im, j) => `<button type="button" aria-label="${esc(cap(im))}" aria-current="${j === 0}" data-i="${j}"><img src="${esc(im.src)}" alt=""></button>`).join('')}</div>` : ''}
    </div>
    <div class="tut-text">
      <button type="button" class="close" aria-label="${s.close}" autofocus>×</button>
      <h2 id="tutorial-title">${esc(copy.title)}</h2>
      ${(copy.sections || []).map(sec => `<section><h3>${esc(sec.h)}</h3><p>${esc(sec.p)}</p></section>`).join('')}
    </div>
  </div>`;
  const link = tutorialDlg.querySelector('.tut-main');
  const img = link.querySelector('img');
  const caption = tutorialDlg.querySelector('.tut-cap');
  tutorialDlg.querySelectorAll('.thumbs button').forEach(b => b.addEventListener('click', () => {
    const im = imgs[+b.dataset.i];
    img.src = link.href = im.src;
    img.alt = caption.textContent = cap(im);
    tutorialDlg.querySelectorAll('.thumbs button').forEach(x => x.setAttribute('aria-current', String(x === b)));
  }));
  tutorialDlg.querySelector('.close').addEventListener('click', () => tutorialDlg.close());
  tutorialDlg.showModal();
}

for (const d of document.querySelectorAll('dialog')) {
  d.addEventListener('click', e => { if (e.target === d && d.id !== 'editor') d.close(); });
}
sheet.addEventListener('close', () => sheet.querySelector('video')?.pause());

/* ---------------- 登录 ---------------- */

const loginDlg = $('#login');
function openLogin() {
  const s = t();
  if (state.user && !state.isAdmin) {
    loginDlg.innerHTML = `<div class="form">
      <button type="button" class="close" aria-label="${s.close}">×</button>
      <h2 id="login-title">${s.notAdminTitle}</h2>
      <p class="hint">${s.notAdminHint}</p>
      <div class="uid"><span style="flex:1">${esc(state.user.id)}</span><button type="button" class="pill" data-copy>${s.copy}</button></div>
      <div class="form-foot"><span></span><div class="right"><button type="button" class="btn ghost" data-out>${s.signOut}</button></div></div>
    </div>`;
    loginDlg.querySelector('[data-copy]').addEventListener('click', async e => {
      try { await navigator.clipboard.writeText(state.user.id); e.target.textContent = s.copied; } catch {}
    });
    loginDlg.querySelector('[data-out]').addEventListener('click', signOut);
  } else {
    loginDlg.innerHTML = `<form class="form" novalidate>
      <button type="button" class="close" aria-label="${s.close}">×</button>
      <h2 id="login-title">${s.loginTitle}</h2>
      <section class="row" style="grid-template-columns:1fr">
        <label class="field"><span>${s.email}</span><input name="email" type="email" autocomplete="username" required></label>
        <label class="field"><span>${s.password}</span><input name="password" type="password" autocomplete="current-password" minlength="8" required></label>
      </section>
      <p class="form-msg" data-msg aria-live="polite"></p>
      <div class="form-foot">
        <div class="left"><button type="button" class="btn ghost" data-signup>${s.signUp}</button></div>
        <div class="right"><button type="submit" class="btn primary">${s.signIn}</button></div>
      </div>
    </form>`;
    const form = loginDlg.querySelector('form');
    const msg = loginDlg.querySelector('[data-msg]');
    const say = (text, bad) => { msg.textContent = text; msg.classList.toggle('bad', !!bad); };
    const creds = () => {
      const email = form.email.value.trim(), password = form.password.value;
      if (!email || !password) { say(s.needEmail, true); return null; }
      if (password.length < 8) { say(s.pwShort, true); return null; }
      return { email, password };
    };
    form.addEventListener('input', () => say(''));
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const c = creds(); if (!c) return;
      const btn = form.querySelector('[type=submit]'); btn.disabled = true;
      const { error } = await sb.auth.signInWithPassword(c);
      btn.disabled = false;
      if (error) say(error.message, true); else loginDlg.close();
    });
    form.querySelector('[data-signup]').addEventListener('click', async e => {
      const c = creds(); if (!c) return;
      e.target.disabled = true;
      const { data, error } = await sb.auth.signUp({ ...c, options: { emailRedirectTo: location.href.split('#')[0] } });
      e.target.disabled = false;
      if (error) say(error.message, true);
      else if (data.session) loginDlg.close();
      else say(s.signUpDone);
    });
  }
  loginDlg.querySelector('.close').addEventListener('click', () => loginDlg.close());
  loginDlg.showModal();
}

async function signOut() {
  await sb?.auth.signOut();
  loginDlg.close();
}

/* ---------------- 编辑器 ---------------- */

const editor = $('#editor');
let pics = [];   // { src, blob? } —— 有 blob 的是还没上传的新图

function openEditor(idea = null) {
  const s = t();
  const v = idea || { category: '3d', status: 'live', year: new Date().getFullYear(), hue: '#ff9a3c', published: true, facts: [], tags_zh: [], tags_en: [] };
  pics = (idea?.images || []).filter(imgSrc).map(src => ({ src }));
  const facts = [0, 1, 2].map(i => v.facts?.[i] || {});
  const opt = (name, map, cur) => Object.entries(map).map(([k, l]) => `<option value="${k}" ${k === cur ? 'selected' : ''}>${l}</option>`).join('');
  const inp = (name, label, val, attrs = '') => `<label class="field"><span>${label}</span><input name="${name}" value="${esc(val ?? '')}" ${attrs}></label>`;
  const area = (name, label, val, attrs = '') => `<label class="field"><span>${label}</span><textarea name="${name}" ${attrs}>${esc(val ?? '')}</textarea></label>`;
  editor.innerHTML = `<form class="form" novalidate>
    <button type="button" class="close" aria-label="${s.close}">×</button>
    <h2 id="editor-title">${idea ? s.editorEdit : s.editorNew}</h2>
    <div class="json-tools">
      <label class="pill">${s.jsonImport}<input type="file" accept="application/json,.json" data-json></label>
      <button type="button" class="pill" data-export>${s.jsonExport}</button>
      <button type="button" class="pill" data-template>${s.jsonTemplate}</button>
    </div>

    <section>
      <h3>${s.secImages}</h3>
      <label class="drop" data-drop><b>${s.dropTitle}</b><input type="file" accept="image/*" multiple data-files></label>
      <div class="pics" data-pics></div>
    </section>

    <section>
      <h3>${s.secBasic}</h3>
      <div class="row two">${inp('title_zh', s.titleZh, v.title_zh, 'maxlength="60" required')}${inp('title_en', s.titleEn, v.title_en, 'maxlength="80"')}</div>
      <div class="row" style="margin-top:12px">
        <label class="field"><span>${s.category}</span><select name="category">${opt('category', UI[state.lang].filters, v.category).replace(/<option value="all"[^>]*>[^<]*<\/option>/, '')}</select></label>
        <label class="field"><span>${s.statusL}</span><select name="status">${opt('status', s.status, v.status)}</select></label>
        ${inp('year', s.yearL, v.year, 'type="number" min="2000" max="2100"')}
        <label class="field"><span>${s.hue}</span><input name="hue" type="color" value="${esc(v.hue || '#ff9a3c')}"></label>
      </div>
    </section>

    <section>
      <h3>${s.secCopy}</h3>
      <div class="row two">${inp('kind_zh', s.kindZh, v.kind_zh, 'maxlength="40"')}${inp('kind_en', s.kindEn, v.kind_en, 'maxlength="60"')}</div>
      <div class="row two" style="margin-top:12px">${area('line_zh', s.lineZh, v.line_zh, 'maxlength="120" style="min-height:72px"')}${area('line_en', s.lineEn, v.line_en, 'maxlength="240" style="min-height:72px"')}</div>
      <div class="row two" style="margin-top:12px">${area('lead_zh', s.leadZh, v.lead_zh, 'maxlength="1200"')}${area('lead_en', s.leadEn, v.lead_en, 'maxlength="2400"')}</div>
      <div class="row two" style="margin-top:12px">
        ${inp('tags_zh', s.tagsZh, (v.tags_zh || []).join(', '))}
        ${inp('tags_en', s.tagsEn, (v.tags_en || []).join(', '))}
      </div>
    </section>

    <section>
      <h3>${s.secFacts}</h3>
      <div class="facts-edit">${facts.map((f, i) => `<div class="row">
        ${inp(`fact_n_${i}`, s.factN, f.n, 'maxlength="12"')}${inp(`fact_zh_${i}`, s.factZh, f.zh, 'maxlength="20"')}${inp(`fact_en_${i}`, s.factEn, f.en, 'maxlength="30"')}
      </div>`).join('')}</div>
    </section>

    <section>
      <h3>${s.secLinks}</h3>
      <div class="row two">${inp('url', s.url, v.url, 'type="url" placeholder="https://"')}${inp('repo', s.repo, v.repo, 'type="url" placeholder="https://"')}</div>
      <div class="row two" style="margin-top:12px">${inp('tech', s.techL, v.tech, 'maxlength="80"')}${inp('host', s.hostL, v.host, 'maxlength="60"')}</div>
      <label class="check" style="margin-top:16px"><input type="checkbox" name="published" ${v.published !== false ? 'checked' : ''}>${s.publish}</label>
    </section>

    <p class="form-msg" data-msg aria-live="polite"></p>
    <div class="form-foot">
      <div class="right">
        <button type="button" class="btn ghost" data-cancel>${s.cancel}</button>
        <button type="submit" class="btn primary">${s.save}</button>
      </div>
    </div>
  </form>`;

  const form = editor.querySelector('form');
  const msg = editor.querySelector('[data-msg]');
  const say = (text, bad) => { msg.textContent = text; msg.classList.toggle('bad', !!bad); };
  let hueTouched = !!idea;
  form.hue.addEventListener('input', () => { hueTouched = true; });

  const drawPics = () => {
    editor.querySelector('[data-pics]').innerHTML = pics.map((p, i) => `<div class="pic">
      <img src="${esc(p.src)}" alt="">
      ${i === 0 ? `<span class="tag">${s.cover}</span>` : ''}
      <span class="ops">${i ? `<button type="button" data-up="${i}" aria-label="${s.moveUp}">←</button>` : ''}<button type="button" data-rm="${i}" aria-label="${s.del}">×</button></span>
    </div>`).join('');
  };
  drawPics();
  editor.querySelector('[data-pics]').addEventListener('click', e => {
    const up = e.target.closest('[data-up]'), rm = e.target.closest('[data-rm]');
    if (up) { const i = +up.dataset.up; [pics[i - 1], pics[i]] = [pics[i], pics[i - 1]]; drawPics(); }
    if (rm) { const [p] = pics.splice(+rm.dataset.rm, 1); if (p.blob) URL.revokeObjectURL(p.src); drawPics(); }
  });

  const addFiles = async files => {
    say('');
    for (const file of files) {
      if (pics.length >= MAX_PICS) { say(s.tooMany, true); break; }
      if (!file.type.startsWith('image/')) { say(s.notImage, true); continue; }
      if (file.size > 20 * 1024 * 1024) { say(s.tooBig, true); continue; }
      const blob = await compressImage(file);
      pics.push({ src: URL.createObjectURL(blob), blob });
      if (pics.length === 1 && !hueTouched) {
        const hue = await hueFromBlob(blob);
        if (hue) form.hue.value = hue;
      }
    }
    drawPics();
  };
  const drop = editor.querySelector('[data-drop]');
  editor.querySelector('[data-files]').addEventListener('change', e => { addFiles([...e.target.files]); e.target.value = ''; });
  drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('over'); addFiles([...e.dataTransfer.files]); });

  editor.querySelector('[data-json]').addEventListener('change', async e => {
    const file = e.target.files[0]; e.target.value = '';
    if (!file) return;
    let parsed;
    try { parsed = JSON.parse(await file.text()); } catch { say(s.jsonBad, true); return; }
    const list = (Array.isArray(parsed) ? parsed : [parsed]).filter(x => x && typeof x === 'object' && x.title_zh);
    if (!list.length) { say(s.jsonBad, true); return; }
    if (list.length === 1) { fillForm(form, list[0]); pics = (list[0].images || []).filter(imgSrc).map(src => ({ src })); hueTouched = true; drawPics(); say(s.jsonFilled); return; }
    if (!confirm(s.jsonBatch(list.length))) return;
    const base = nextSort();
    const rows = list.map((x, i) => ({ ...clean(x), sort: base + i * 10 }));
    const { error } = await sb.from('vault_ideas').insert(rows);
    if (error) { say(error.message, true); return; }
    editor.close(); toast(s.jsonDone(rows.length)); await reload();
  });
  editor.querySelector('[data-export]').addEventListener('click', () =>
    download('idea-vault.json', state.ideas.map(x => Object.fromEntries(FIELDS.map(f => [f, x[f]])))));
  editor.querySelector('[data-template]').addEventListener('click', () =>
    download('idea-vault-template.json', [{
      category: '3d', status: 'wip', year: new Date().getFullYear(), hue: '#ff9a3c', published: true,
      url: 'https://example.com', repo: null, images: ['https://example.com/cover.webp'],
      title_zh: '作品名', title_en: 'Project name', kind_zh: '3D 交互场景', kind_en: '3D interactive scene',
      line_zh: '一句话介绍', line_en: 'One-line pitch', lead_zh: '详细介绍', lead_en: 'Longer description',
      tags_zh: ['Three.js'], tags_en: ['Three.js'], facts: [{ n: '3', zh: '个场景', en: 'scenes' }], tech: 'Three.js', host: 'GitHub Pages'
    }]));

  editor.querySelector('[data-cancel]').addEventListener('click', () => editor.close());
  editor.querySelector('.close').addEventListener('click', () => editor.close());
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const row = readForm(form);
    if (!row.title_zh) { say(s.needTitle, true); form.title_zh.focus(); return; }
    if ((row.url && !isHttp(row.url)) || (row.repo && !isHttp(row.repo))) { say(s.badUrl, true); return; }
    const btn = form.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = s.saving;
    const uploaded = [];
    try {
      const fresh = pics.filter(p => p.blob);
      let n = 0;
      for (const p of pics) {
        if (!p.blob) continue;
        say(s.uploading(++n, fresh.length));
        const ext = p.blob.type === 'image/gif' ? 'gif' : p.blob.type === 'image/jpeg' ? 'jpg' : 'webp';
        const path = `ideas/${crypto.randomUUID()}.${ext}`;
        const { error } = await sb.storage.from(BUCKET).upload(path, p.blob, { contentType: p.blob.type, cacheControl: '31536000' });
        if (error) throw error;
        uploaded.push(path);
        URL.revokeObjectURL(p.src);
        p.src = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
        delete p.blob;
      }
      row.images = pics.map(p => p.src);
      say(s.saving);
      const res = idea
        ? await sb.from('vault_ideas').update(row).eq('id', idea.id)
        : await sb.from('vault_ideas').insert({ ...row, sort: nextSort() });
      if (res.error) throw res.error;
      if (idea) await removeFiles((idea.images || []).filter(src => !row.images.includes(src)));
      editor.close();
      toast(row.published ? s.saved : s.savedDraft);
      await reload();
    } catch (err) {
      if (uploaded.length) await sb.storage.from(BUCKET).remove(uploaded);
      say(err.message || String(err), true);
      btn.disabled = false; btn.textContent = s.save;
    }
  });
  editor.showModal();
}

function fillForm(form, x) {
  for (const f of ['title_zh', 'title_en', 'kind_zh', 'kind_en', 'line_zh', 'line_en', 'lead_zh', 'lead_en', 'url', 'repo', 'tech', 'host', 'year', 'category', 'status']) {
    if (form[f] && x[f] != null) form[f].value = x[f];
  }
  if (/^#[0-9a-f]{6}$/i.test(x.hue || '')) form.hue.value = x.hue;
  form.tags_zh.value = (x.tags_zh || []).join(', ');
  form.tags_en.value = (x.tags_en || []).join(', ');
  form.published.checked = x.published !== false;
  [0, 1, 2].forEach(i => {
    const f = x.facts?.[i] || {};
    form[`fact_n_${i}`].value = f.n || ''; form[`fact_zh_${i}`].value = f.zh || ''; form[`fact_en_${i}`].value = f.en || '';
  });
}

function readForm(form) {
  const val = n => form[n].value.trim();
  const opt = n => val(n) || null;
  const list = n => val(n).split(/[,，、]/).map(x => x.trim()).filter(Boolean).slice(0, 8);
  const year = parseInt(val('year'), 10);
  return {
    title_zh: val('title_zh'), title_en: opt('title_en'),
    category: val('category'), status: val('status'), year: Number.isFinite(year) ? year : null, hue: val('hue'),
    kind_zh: opt('kind_zh'), kind_en: opt('kind_en'), line_zh: opt('line_zh'), line_en: opt('line_en'),
    lead_zh: opt('lead_zh'), lead_en: opt('lead_en'), tags_zh: list('tags_zh'), tags_en: list('tags_en'),
    facts: [0, 1, 2].map(i => ({ n: val(`fact_n_${i}`), zh: val(`fact_zh_${i}`), en: val(`fact_en_${i}`) })).filter(f => f.n),
    url: opt('url'), repo: opt('repo'), tech: opt('tech'), host: opt('host'),
    published: form.published.checked
  };
}

function clean(x) {
  const row = {};
  for (const f of FIELDS) if (f !== 'sort' && x[f] !== undefined) row[f] = x[f];
  row.images = (row.images || []).filter(imgSrc).slice(0, 8);
  return row;
}

const nextSort = () => Math.max(0, ...state.ideas.map(i => i.sort || 0)) + 10;

async function deleteIdea(idea) {
  const s = t();
  if (!confirm(s.confirmDelete(pick(idea, 'title')))) return;
  const { error } = await sb.from('vault_ideas').delete().eq('id', idea.id);
  if (error) { toast(error.message); return; }
  await removeFiles(idea.images || []);
  sheet.close();
  toast(s.deleted);
  await reload();
}

async function removeFiles(urls) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const paths = urls.filter(u => u.includes(marker)).map(u => decodeURIComponent(u.split(marker)[1]));
  if (paths.length) await sb.storage.from(BUCKET).remove(paths);
}

/* ---------------- 工具 ---------------- */

async function compressImage(file) {
  if (file.type === 'image/gif') return file;
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const blob = await new Promise(r => canvas.toBlob(r, 'image/webp', .86));
  return blob && blob.type === 'image/webp' ? blob : new Promise(r => canvas.toBlob(r, 'image/jpeg', .86));
}

// 取封面里最鲜艳的颜色作为卡片主色
async function hueFromBlob(blob) {
  try {
    const bmp = await createImageBitmap(blob);
    const c = document.createElement('canvas'); c.width = c.height = 32;
    const ctx = c.getContext('2d'); ctx.drawImage(bmp, 0, 0, 32, 32); bmp.close();
    const d = ctx.getImageData(0, 0, 32, 32).data;
    let r = 0, g = 0, b = 0, w = 0;
    for (let i = 0; i < d.length; i += 4) {
      const max = Math.max(d[i], d[i + 1], d[i + 2]), min = Math.min(d[i], d[i + 1], d[i + 2]);
      const sat = max ? (max - min) / max : 0, weight = sat * sat * (max / 255);
      r += d[i] * weight; g += d[i + 1] * weight; b += d[i + 2] * weight; w += weight;
    }
    if (w < 1) return null;
    return '#' + [r, g, b].map(v => Math.round(v / w).toString(16).padStart(2, '0')).join('');
  } catch { return null; }
}

function download(name, data) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

let toastTimer;
function toast(text) {
  const el = $('#toast');
  el.textContent = text; el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2800);
}

async function reload() { await loadIdeas(); renderAll(); }

/* ---------------- 事件与启动 ---------------- */

document.addEventListener('click', event => {
  const filter = event.target.closest('[data-filter]');
  if (filter) {
    state.filter = filter.dataset.filter;
    applyFilter();
  }
  const card = event.target.closest('.project-card');
  if (card) {
    const idea = state.ideas[Number(card.dataset.index)];
    if (event.target.closest('[data-card-details]')) openSheet(idea, card);
    const bookmark = event.target.closest('[data-bookmark]');
    if (bookmark) toggleBookmark(bookmark, idea);
    const pin = event.target.closest('[data-pin]');
    if (pin) togglePin(pin, idea);
  }
  const act = event.target.closest('[data-act]')?.dataset.act;
  if (act === 'add') openEditor();
  if (act === 'login') openLogin();
  if (act === 'signout') signOut();
});
addEventListener('hashchange', renderAdminBar);
addEventListener('storage', event => {
  if (event.key !== PIN_STORAGE_KEY && event.key !== null) return;
  pins = readPins();
  updatePinButtons();
  applyPinOrder();
});

function updateSearch() {
  applyFilter();
  if (search.value.trim()) scrollTo({ top: 0, behavior: 'instant' });
}
search.addEventListener('input', updateSearch);
$('#search-form').addEventListener('submit', event => {
  event.preventDefault();
  updateSearch();
  search.blur();
  $('#works').scrollIntoView({ block: 'start' });
});
$('#search-clear').addEventListener('click', () => {
  search.value = '';
  updateSearch();
  search.focus();
});
$('#reset-filters').addEventListener('click', resetFilters);
$('.primary-nav a').addEventListener('click', resetFilters);
$('#saved').addEventListener('click', () => {
  savedOnly = !savedOnly;
  search.value = '';
  state.filter = 'all';
  applyFilter();
  $('#works').scrollIntoView({ block: 'start' });
});
$('#theme').addEventListener('click', () => {
  theme = theme === 'light' ? 'dark' : 'light';
  store.set('vault-theme', theme);
  renderTheme();
});
$('#language').addEventListener('click', () => {
  state.lang = state.lang === 'zh' ? 'en' : 'zh';
  store.set('vault-lang', state.lang);
  renderAll();
});
$('#shortcut').textContent = navigator.platform.toLowerCase().includes('mac') ? '⌘ K' : 'Ctrl K';
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !document.querySelector('dialog[open]')) {
    event.preventDefault();
    search.focus();
    search.select();
  }
});

renderStatic();
grid.innerHTML = '<div class="stage skeleton" aria-hidden="true"></div>'.repeat(3);

// 数据库较慢时先用内置数据把卡片显示出来，数据库返回后再替换
let loaded = false;
const early = setTimeout(async () => {
  const seed = await loadSeed();
  if (!loaded && seed.length) { state.ideas = seed; renderAll(); }
}, 1500);
const authReady = sb
  ? sb.auth.getSession().then(({ data }) => refreshAuth(data.session))
  : Promise.resolve();
await Promise.all([authReady, loadIdeas()]);
loaded = true;
clearTimeout(early);
renderAll();
if (state.source === 'seed' && location.hash === '#admin') toast(t().offline);
if (sb) {
  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return;
    // 回调里不能直接 await Supabase 请求，放到下一轮
    setTimeout(async () => { await refreshAuth(session); await reload(); }, 0);
  });
}
