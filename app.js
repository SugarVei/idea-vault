import { SUPABASE_URL, SUPABASE_KEY, BUCKET } from './config.js';

const sb = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const UI = {
  zh: {
    brand: '创意仓库', title: '我的创意仓库',
    sub: '收着我做过的小世界，和喜欢的开源作品。',
    filters: { all: '全部', '3d': '3D 场景', '2d': '2D 交互', other: '技能 / 工具' },
    status: { live: '已上线', wip: '制作中', idea: '点子' },
    count: n => `${n} 件`, play: '去玩', open: '在线体验', view: '查看', openResource: '查看工具', source: '源码', watch: '观看', openVideo: '新窗口播放',
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
    brand: 'Idea Vault', title: 'A vault of small worlds',
    sub: 'Small worlds I have built, and open-source work I love.',
    filters: { all: 'All', '3d': '3D scenes', '2d': '2D interaction', other: 'Skills / tools' },
    status: { live: 'Live', wip: 'In progress', idea: 'Idea' },
    count: n => `${n} ${n === 1 ? 'entry' : 'entries'}`, play: 'Play', open: 'Play online', view: 'View', openResource: 'View tool', source: 'Source', watch: 'Watch', openVideo: 'Open in new tab',
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
  set(k, v) { try { localStorage.setItem(k, v); } catch {} }
};
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const isHttp = u => /^https?:\/\/\S+$/i.test(u || '');
const imgSrc = p => (isHttp(p) || /^assets\/[\w./-]+$/.test(p || '')) ? p : '';
// 在线地址是 mp4 时当作视频作品：详情里直接播放，封面用同名的 .jpg
const isVideo = u => isHttp(u) && /\.mp4(?=$|[?#])/i.test(u);
const posterOf = u => u.replace(/\.mp4(?=$|[?#])/i, '.jpg');

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
    if (!error) { state.ideas = data; state.source = 'db'; return; }
    console.warn('vault: load failed', error);
  }
  state.ideas = await loadSeed();
  state.source = 'seed';
}

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

function renderStatic() {
  const s = t();
  document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-t]').forEach(el => { el.textContent = s[el.dataset.t]; });
  document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)));
  renderTitle();
  const cats = ['all', '3d', '2d'];
  if (state.ideas.some(i => i.category === 'other')) cats.push('other');
  if (!cats.includes(state.filter)) state.filter = 'all';
  $('#chips').innerHTML = '<span class="thumb" aria-hidden="true"></span>' + cats.map(k =>
    `<button type="button" class="chip" data-filter="${k}" aria-pressed="${k === state.filter}">${s.filters[k]}</button>`).join('');
  moveThumb();
  requestAnimationFrame(() => $('#chips .thumb')?.classList.add('anim'));
  renderAdminBar();
}

// 标题拆成单个字（英文按单词），逐个从模糊中浮现
function renderTitle() {
  const h = $('#title'), text = t().title;
  if (h.dataset.text === text) return;
  h.dataset.text = text;
  h.setAttribute('aria-label', text);
  const zh = state.lang === 'zh';
  h.innerHTML = (zh ? [...text] : text.split(' '))
    .map((part, i) => `<span class="ch" aria-hidden="true" style="--i:${i}">${esc(part)}</span>`)
    .join(zh ? '' : ' ');
}

function moveThumb() {
  const on = $('#chips [aria-pressed="true"]'), thumb = $('#chips .thumb');
  if (!on || !thumb) return;
  thumb.style.width = `${on.offsetWidth}px`;
  thumb.style.transform = `translateX(${on.offsetLeft}px)`;
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

const arrow = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 10.5l7-7M5 3.5h5.5V9"/></svg>';

function cardHtml(idea, i) {
  const s = t();
  const title = pick(idea, 'title');
  const line = pick(idea, 'line');
  const imgs = (idea.images || []).map(imgSrc).filter(Boolean);
  const media = imgs.length
    ? imgs.map((src, j) => `<img src="${esc(src)}" alt="${j ? '' : esc(title)}" decoding="async" ${j || i > 5 ? 'loading="lazy"' : ''} class="${j ? '' : 'on'}">`).join('')
    : `<span class="empty">${esc(title.slice(0, 1))}</span>`;
  const draft = idea.published === false;
  const goLabel = isVideo(idea.url) ? s.watch : idea.category === 'other' ? s.view : s.play;
  const go = isHttp(idea.url) ? `<a class="go" href="${esc(idea.url)}" target="_blank" rel="noopener" aria-label="${esc(`${goLabel}：${title}`)}">${arrow}</a>` : '';
  return `<article class="card glass${draft ? ' draft' : ''}" data-id="${esc(idea.id ?? i)}" data-cat="${esc(idea.category)}" style="--hue:${esc(idea.hue)}">
    <div class="media">${media}
      <div class="panel">
        <div class="panel-text"><h3>${esc(title)}</h3>${line ? `<div class="more"><p>${esc(line)}</p></div>` : ''}</div>
        ${go}
      </div>
    </div>
    <button type="button" class="open" aria-label="${esc(s.details + title)}"></button>
  </article>`;
}

let firstGrid = true;
function renderGrid() {
  const s = t();
  const tail = state.isAdmin
    ? `<button type="button" class="card glass next" data-cat="next" data-act="add"><span class="plus" aria-hidden="true">+</span><h3>${s.add}</h3></button>`
    : '';
  const grid = $('#grid');
  grid.innerHTML = state.ideas.map(cardHtml).join('') + tail;
  grid.removeAttribute('aria-busy');
  applyFilter();
  bindCards();
  if (firstGrid) reveal();
  else grid.querySelectorAll('.card').forEach(card => {
    // 重新渲染时已在屏幕上的卡片不再播放入场，屏幕下方的仍等滚动到才出现
    if (!revealer || card.getBoundingClientRect().top < innerHeight) card.classList.add('in');
    else revealer.observe(card);
  });
  firstGrid = false;
}

// 六列网格里，一行两张（各占 3 列）和一行三张（各占 2 列）交替。
// 张数总能拆成这两种整行，所以任何筛选结果都不会在末尾留下空位。
function rowSpans(n) {
  if (n < 2) return n ? [3] : [];
  let wide = (2 * n) % 3 || 3;
  if (n < wide * 2) wide = 0;
  let narrow = (n - wide * 2) / 3;
  const spans = [];
  while (wide || narrow) {
    if (wide) { spans.push(3, 3); wide--; }
    for (let k = Math.ceil(narrow / (wide + 1)); k > 0; k--) { spans.push(2, 2, 2); narrow--; }
  }
  return spans;
}

function applyFilter() {
  const shown = [...document.querySelectorAll('#grid .card')].filter(card => {
    const show = state.filter === 'all' || card.dataset.cat === state.filter || card.dataset.cat === 'next';
    card.hidden = !show;
    return show;
  });
  const spans = rowSpans(shown.length);
  let col = 0;
  shown.forEach((card, i) => {
    card.dataset.span = spans[i];
    card.toggleAttribute('data-solo', i === 0 && shown.length % 2 === 1);
    card.style.setProperty('--d', `${col * 32}ms`);
    col = (col + spans[i]) % 6;
  });
  $('#count').textContent = t().count(shown.filter(card => card.dataset.cat !== 'next').length);
}

// 卡片滚动到视口时才入场，同一行从左到右错开
const revealer = !reduced && 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in', 'rise');
      revealer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -6% 0px', threshold: .04 })
  : null;

function reveal() {
  document.querySelectorAll('#grid .card:not([hidden])').forEach(card => {
    if (!revealer) { card.classList.add('in'); return; }
    card.classList.remove('in', 'rise');
    revealer.observe(card);
  });
}

// 切换分类：旧内容快速淡出，新内容再按入场动效出现
let filterRun = 0;
async function setFilter(next) {
  if (next === state.filter) return;
  state.filter = next;
  document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === next)));
  moveThumb();
  const grid = $('#grid'), run = ++filterRun;
  if (!reduced) {
    await grid.animate({ opacity: [1, 0], transform: ['none', 'translateY(6px)'] }, { duration: 140, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'both' }).finished.catch(() => {});
    if (run !== filterRun) return;
  }
  applyFilter();
  reveal();
  grid.getAnimations().forEach(a => a.cancel());
}

function bindPreview(card, url) {
  const media = card.querySelector('.media');
  let video = null, wait = 0;
  card.addEventListener('pointerenter', () => {
    wait = setTimeout(() => {
      if (!video) {
        video = Object.assign(document.createElement('video'), { src: url, muted: true, loop: true, playsInline: true, preload: 'auto' });
        video.setAttribute('aria-hidden', 'true');
        video.addEventListener('playing', () => video.classList.add('on'));
        media.insertBefore(video, media.querySelector('.panel'));
      }
      video.play().catch(() => {});
    }, 180);
  });
  card.addEventListener('pointerleave', () => {
    clearTimeout(wait);
    if (!video) return;
    video.classList.remove('on');
    video.pause();
  });
}

function bindCards() {
  document.querySelectorAll('#grid .card[data-id]').forEach((card, idx) => {
    const idea = state.ideas[idx];
    const imgs = card.querySelectorAll('.media img');
    imgs.forEach(img => {
      if (img.complete && img.naturalWidth) img.classList.add('ready');
      else img.addEventListener('load', () => img.classList.add('ready'), { once: true });
    });
    card.querySelector('.open').addEventListener('click', () => openSheet(idea, card));
    if (reduced || !finePointer) return;
    if (isVideo(idea.url)) bindPreview(card, idea.url);
    else if (imgs.length > 1) {
      let k = 0, timer = null;
      const show = j => { imgs[k].classList.remove('on'); k = j; imgs[k].classList.add('on'); };
      card.addEventListener('pointerenter', () => { timer = setInterval(() => show((k + 1) % imgs.length), 1400); });
      card.addEventListener('pointerleave', () => { clearInterval(timer); show(0); });
    }
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

function renderAll() { renderStatic(); renderGrid(); }

/* ---------------- 详情 ---------------- */

const sheet = $('#sheet');
function openSheet(idea, origin) {
  const s = t();
  const title = pick(idea, 'title');
  const imgs = (idea.images || []).map(imgSrc).filter(Boolean);
  const facts = (idea.facts || []).filter(f => f && f.n);
  const meta = [[s.type, pick(idea, 'kind')], [s.tech, idea.tech], [s.host, idea.host], [s.year, idea.year]].filter(([, v]) => v);
  const video = isVideo(idea.url);
  const mainHtml = video
    ? `<video src="${esc(idea.url)}" poster="${esc(posterOf(idea.url))}" controls playsinline preload="none" aria-label="${esc(title)}"></video>`
    : imgs.length ? `<img src="${esc(imgs[0])}" alt="${esc(title)}">` : `<div class="media" style="--hue:${esc(idea.hue)}"><span class="empty">${esc(title.slice(0, 1))}</span></div>`;
  sheet.innerHTML = `<div class="sheet-in">
    <div class="gallery">
      <div class="main${video ? ' video' : ''}">${mainHtml}</div>
      ${imgs.length > 1 && !video ? `<div class="thumbs">${imgs.map((src, j) => `<button type="button" aria-label="${j + 1}" aria-current="${j === 0}" data-src="${esc(src)}"><img src="${esc(src)}" alt=""></button>`).join('')}</div>` : ''}
    </div>
    <div class="info">
      <button type="button" class="close" aria-label="${s.close}">×</button>
      <h2 id="sheet-title">${esc(title)}</h2>
      ${pick(idea, 'lead') || pick(idea, 'line') ? `<p class="lead">${esc(pick(idea, 'lead') || pick(idea, 'line'))}</p>` : ''}
      ${facts.length ? `<div class="facts">${facts.map(f => `<div><b>${esc(f.n)}</b><span>${esc((state.lang === 'en' && f.en) || f.zh || '')}</span></div>`).join('')}</div>` : ''}
      ${meta.length ? `<dl class="meta">${meta.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : ''}
      <div class="actions">
        ${isHttp(idea.url) ? `<a class="btn primary" href="${esc(idea.url)}" target="_blank" rel="noopener">${video ? s.openVideo : idea.category === 'other' ? s.openResource : s.open} ↗</a>` : ''}
        ${isHttp(idea.repo) ? `<a class="btn ghost" href="${esc(idea.repo)}" target="_blank" rel="noopener">${s.source} ↗</a>` : ''}
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
  sheet.showModal();
  if (origin) {
    const c = origin.getBoundingClientRect();
    sheet.style.transformOrigin = `${c.left + c.width / 2 - sheet.offsetLeft}px ${c.top + c.height / 2 - sheet.offsetTop}px`;
  }
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

document.addEventListener('click', e => {
  const l = e.target.closest('[data-lang]');
  if (l && l.dataset.lang !== state.lang) { state.lang = l.dataset.lang; store.set('vault-lang', state.lang); renderAll(); }
  const f = e.target.closest('[data-filter]');
  if (f) setFilter(f.dataset.filter);
  const act = e.target.closest('[data-act]')?.dataset.act;
  if (act === 'add') openEditor();
  if (act === 'login') openLogin();
  if (act === 'signout') signOut();
});
addEventListener('hashchange', renderAdminBar);

new IntersectionObserver(([entry]) => $('.top').classList.toggle('stuck', !entry.isIntersecting)).observe($('#topSentinel'));
new ResizeObserver(moveThumb).observe($('#chips'));

renderStatic();
$('#grid').innerHTML = [3, 3, 2, 2, 2].map(n => `<div class="skeleton" data-span="${n}"></div>`).join('');
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
