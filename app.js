import { SUPABASE_URL, SUPABASE_KEY, BUCKET } from './config.js';

const sb = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const UI = {
  zh: {
    brand: '创意仓库', brandSub: 'Idea Vault', eyebrow: 'Creative vault · 2026', title: '我的创意仓库',
    sub: '这里收着我做过的小世界：港湾、锦池、地球、毛绒伙伴、粒子、小游戏、旅行手账和汽车拆解。也收藏喜欢的开源作品与创作工具，每张卡片都能点开了解、体验或访问原项目。',
    stats: ['条内容', '个已上线', '持续更新'],
    filters: { all: '全部', '3d': '3D 场景', '2d': '2D 交互', other: '技能 / 工具' },
    status: { live: '已上线', wip: '制作中', idea: '点子' }, draft: '草稿',
    count: n => `${n} 件`, play: '去玩', open: '在线体验', view: '查看', openResource: '查看工具', source: '源码',
    tech: '技术', host: '托管', year: '年份', close: '关闭', details: '查看详情：',
    next: '下一个点子', nextSub: '正在酝酿，很快放进来',
    add: '导入新创意', addSub: '上传图片、填写文案，发布后所有人都能看到',
    foot: '我的作品与开源收藏，都可以从这里打开', offline: '暂时连不上数据库，显示的是内置数据',
    login: '管理员登录', managing: '管理中', signOut: '退出', notAdmin: '未授权', importBtn: '导入',
    edit: '编辑', remove: '删除', confirmDelete: name => `确定删除「${name}」吗？图片也会一起删除，无法恢复。`,
    deleted: '已删除', saved: '已发布', savedDraft: '已保存为草稿',
    loginTitle: '管理员登录', loginHint: '登录后可以导入、编辑和删除创意。',
    email: '邮箱', password: '密码', signIn: '登录', signUp: '首次注册',
    pwShort: '密码至少 8 位', needEmail: '请填写邮箱和密码',
    signUpDone: '注册成功。请去邮箱点确认链接（确认后跳转的页面打不开也没关系），然后回到这里登录。',
    notAdminTitle: '已登录，但还不是管理员', notAdminHint: '把下面这串账号 ID 发给 Claude（或在 Supabase 里把它加入 vault_admins 表），之后刷新页面就能导入创意。',
    copy: '复制', copied: '已复制',
    editorNew: '导入新创意', editorEdit: '编辑创意',
    editorHint: '带 * 的必填。英文留空时，英文版会显示中文内容。',
    secImages: '图片', dropTitle: '拖入图片，或点击选择', dropSub: '最多 6 张，第一张是封面；会自动压缩成 WebP',
    cover: '封面', moveUp: '前移', del: '移除',
    secBasic: '基本信息', titleZh: '中文标题 *', titleEn: 'English title', category: '分类', statusL: '状态', yearL: '年份', hue: '主色',
    secCopy: '文案', kindZh: '类型', kindEn: 'Type (EN)', lineZh: '一句话介绍', lineEn: 'One-liner (EN)',
    leadZh: '详细介绍', leadEn: 'Description (EN)', tagsZh: '标签', tagsEn: 'Tags (EN)', tagsHint: '用逗号分隔',
    secFacts: '数据亮点', factN: '数字', factZh: '中文说明', factEn: 'English label',
    secLinks: '链接', url: '在线地址', repo: '源码地址', techL: '技术', hostL: '托管平台',
    publish: '发布（取消勾选则只有管理员能看到）',
    jsonImport: '从 JSON 导入', jsonExport: '导出全部 JSON', jsonTemplate: '下载 JSON 模板',
    cancel: '取消', save: '保存', saving: '保存中…', uploading: (i, n) => `上传图片 ${i}/${n}…`,
    needTitle: '请填写中文标题', badUrl: '链接需要以 http:// 或 https:// 开头', tooMany: '最多 6 张图片',
    notImage: '只能上传图片文件', tooBig: '单张图片不能超过 20 MB',
    jsonBad: 'JSON 格式不对', jsonBatch: n => `文件里有 ${n} 条创意，全部直接导入吗？（图片需要是网址）`, jsonDone: n => `已导入 ${n} 条`,
    jsonFilled: '已从 JSON 填入表单，检查后保存'
  },
  en: {
    brand: 'Idea Vault', brandSub: '', eyebrow: 'Creative vault · 2026', title: 'A vault of small worlds',
    sub: 'Small worlds I have built: a harbor, a pond, a planet, a plush companion, particles, a game, a travel journal and a car you can take apart. Alongside them are open-source projects and creative tools I collect. Open a card to explore, try it out or visit the original project.',
    stats: ['entries', 'live', 'ongoing'],
    filters: { all: 'All', '3d': '3D scenes', '2d': '2D interaction', other: 'Skills / tools' },
    status: { live: 'Live', wip: 'In progress', idea: 'Idea' }, draft: 'Draft',
    count: n => `${n} ${n === 1 ? 'entry' : 'entries'}`, play: 'Play', open: 'Play online', view: 'View', openResource: 'View tool', source: 'Source',
    tech: 'Tech', host: 'Hosting', year: 'Year', close: 'Close', details: 'View details: ',
    next: 'Next idea', nextSub: 'Brewing — coming soon',
    add: 'Import a new idea', addSub: 'Upload images and write it up — everyone sees it once published',
    foot: 'My projects and open-source finds, all within reach', offline: 'Database unreachable — showing built-in data',
    login: 'Admin sign in', managing: 'Managing', signOut: 'Sign out', notAdmin: 'Not authorised', importBtn: 'Import',
    edit: 'Edit', remove: 'Delete', confirmDelete: name => `Delete "${name}"? Its images go too, and this can't be undone.`,
    deleted: 'Deleted', saved: 'Published', savedDraft: 'Saved as draft',
    loginTitle: 'Admin sign in', loginHint: 'Sign in to import, edit and delete ideas.',
    email: 'Email', password: 'Password', signIn: 'Sign in', signUp: 'First-time sign up',
    pwShort: 'Password needs at least 8 characters', needEmail: 'Enter your email and password',
    signUpDone: 'Signed up. Open the confirmation link in your email (it is fine if the page it lands on fails to load), then come back and sign in.',
    notAdminTitle: 'Signed in, but not an admin yet', notAdminHint: 'Send this account ID to Claude (or add it to the vault_admins table in Supabase), then reload to start importing.',
    copy: 'Copy', copied: 'Copied',
    editorNew: 'Import a new idea', editorEdit: 'Edit idea',
    editorHint: 'Fields marked * are required. Empty English fields fall back to Chinese.',
    secImages: 'Images', dropTitle: 'Drop images here, or click to choose', dropSub: 'Up to 6; the first is the cover. Converted to WebP automatically.',
    cover: 'Cover', moveUp: 'Move earlier', del: 'Remove',
    secBasic: 'Basics', titleZh: 'Chinese title *', titleEn: 'English title', category: 'Category', statusL: 'Status', yearL: 'Year', hue: 'Accent colour',
    secCopy: 'Copy', kindZh: 'Type (中文)', kindEn: 'Type (EN)', lineZh: 'One-liner (中文)', lineEn: 'One-liner (EN)',
    leadZh: 'Description (中文)', leadEn: 'Description (EN)', tagsZh: 'Tags (中文)', tagsEn: 'Tags (EN)', tagsHint: 'comma separated',
    secFacts: 'Key numbers', factN: 'Number', factZh: 'Label (中文)', factEn: 'Label (EN)',
    secLinks: 'Links', url: 'Live URL', repo: 'Source URL', techL: 'Tech', hostL: 'Hosting',
    publish: 'Publish (untick to keep it visible to admins only)',
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
  const shown = state.ideas.filter(i => i.published !== false);
  const years = shown.map(i => i.year).filter(Boolean);
  const vals = [shown.length, shown.filter(i => i.status === 'live').length, years.length ? Math.max(...years) : new Date().getFullYear()];
  $('#stats').innerHTML = vals.map((v, i) => `<div><b>${typeof v === 'number' && v < 100 ? String(v).padStart(2, '0') : v}</b><span>${s.stats[i]}</span></div>`).join('');
  const cats = ['all', '3d', '2d'];
  if (state.ideas.some(i => i.category === 'other')) cats.push('other');
  if (!cats.includes(state.filter)) state.filter = 'all';
  $('#chips').innerHTML = cats.map(k =>
    `<button type="button" class="chip glass" data-filter="${k}" aria-pressed="${k === state.filter}">${s.filters[k]}</button>`).join('');
  $('#source').textContent = state.source === 'seed' ? s.offline : `© ${new Date().getFullYear()} SugarVei`;
  renderAdminBar();
}

function renderAdminBar() {
  const s = t(), bar = $('#adminBar');
  let html = '';
  if (state.user && state.isAdmin) {
    html = `<button type="button" class="pill solid" data-act="add">＋ ${s.importBtn}</button>
      <span class="pill" title="${esc(state.user.email)}"><span class="dot"></span>${s.managing}</span>
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

function cardHtml(idea, i) {
  const s = t();
  const title = pick(idea, 'title');
  const imgs = (idea.images || []).map(imgSrc).filter(Boolean);
  const media = imgs.length
    ? imgs.map((src, j) => `<img src="${esc(src)}" alt="${esc(title)}" ${j ? 'loading="lazy"' : ''} class="${j ? '' : 'on'}">`).join('')
    : `<span class="empty">${esc(title.slice(0, 1))}</span>`;
  const dots = imgs.length > 1 ? `<span class="dots">${imgs.map((_, j) => `<i class="${j ? '' : 'on'}"></i>`).join('')}</span>` : '';
  const draft = idea.published === false;
  const badge = draft ? s.draft : s.status[idea.status] || s.status.live;
  const dot = draft ? 'var(--ink-3)' : `var(--${idea.status || 'live'})`;
  const sub = state.lang === 'zh' && idea.title_en ? `<small>${esc(idea.title_en)}</small>` : '';
  const go = isHttp(idea.url) ? `<a class="go" href="${esc(idea.url)}" target="_blank" rel="noopener">${idea.category === 'other' ? s.view : s.play} ↗</a>` : '';
  return `<article class="card glass${draft ? ' draft' : ''}" data-id="${esc(idea.id ?? i)}" data-cat="${esc(idea.category)}" style="--i:${i};--hue:${esc(idea.hue)}">
    <div class="media">${media}<span class="chiplet badge" style="--dot:${dot}">${esc(badge)}</span><span class="chiplet num">${String(i + 1).padStart(2, '0')}</span>${dots}</div>
    <div class="body">
      <span class="kind">${esc(pick(idea, 'kind'))}</span>
      <h3>${esc(title)}${sub}</h3>
      <p>${esc(pick(idea, 'line'))}</p>
      <div class="tags">${tagsOf(idea).map(x => `<span>${esc(x)}</span>`).join('')}</div>
      <div class="foot"><span class="year">${esc(idea.year ?? '')}</span>${go}</div>
    </div>
    <button type="button" class="open" aria-label="${esc(s.details + title)}"></button>
  </article>`;
}

function renderGrid() {
  const s = t();
  const tail = state.isAdmin
    ? `<button type="button" class="card next" data-cat="next" data-act="add" style="--i:${state.ideas.length}">
        <span class="plus glass" aria-hidden="true">+</span><h3>${s.add}</h3><p>${s.addSub}</p></button>`
    : `<article class="card next" data-cat="next" style="--i:${state.ideas.length}">
        <span class="plus glass" aria-hidden="true">+</span><h3>${s.next}</h3><p>${s.nextSub}</p></article>`;
  const grid = $('#grid');
  grid.innerHTML = state.ideas.map(cardHtml).join('') + tail;
  grid.removeAttribute('aria-busy');
  applyFilter();
  bindCards();
}

function applyFilter() {
  let n = 0;
  document.querySelectorAll('#grid .card').forEach(card => {
    const show = state.filter === 'all' || card.dataset.cat === state.filter || card.dataset.cat === 'next';
    card.hidden = !show;
    if (show && card.dataset.cat !== 'next') n++;
  });
  $('#count').textContent = t().count(n);
}

function bindCards() {
  document.querySelectorAll('#grid .card[data-id]').forEach((card, idx) => {
    const idea = state.ideas[idx];
    const imgs = card.querySelectorAll('.media img');
    const dots = card.querySelectorAll('.dots i');
    let k = 0, timer = null;
    const show = j => {
      if (!imgs.length) return;
      imgs[k].classList.remove('on'); dots[k]?.classList.remove('on');
      k = j;
      imgs[k].classList.add('on'); dots[k]?.classList.add('on');
    };
    card.addEventListener('pointerenter', () => {
      document.body.style.setProperty('--tint', idea.hue);
      if (reduced || !finePointer || imgs.length < 2) return;
      timer = setInterval(() => show((k + 1) % imgs.length), 1400);
    });
    card.addEventListener('pointerleave', () => {
      clearInterval(timer); show(0);
      card.classList.remove('moving');
      card.style.removeProperty('--rx'); card.style.removeProperty('--ry');
    });
    if (!reduced && finePointer) {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.classList.add('moving');
        card.style.setProperty('--ry', `${(x - .5) * 8}deg`);
        card.style.setProperty('--rx', `${(.5 - y) * 8}deg`);
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
      });
    }
    card.querySelector('.open').addEventListener('click', () => openSheet(idea));
  });
}

function renderAll() { renderStatic(); renderGrid(); }

/* ---------------- 详情 ---------------- */

const sheet = $('#sheet');
function openSheet(idea) {
  const s = t();
  const title = pick(idea, 'title');
  const imgs = (idea.images || []).map(imgSrc).filter(Boolean);
  const facts = (idea.facts || []).filter(f => f && f.n);
  const meta = [[s.tech, idea.tech], [s.host, idea.host], [s.year, idea.year]].filter(([, v]) => v);
  sheet.innerHTML = `<div class="sheet-in">
    <div class="gallery">
      <div class="main">${imgs.length ? `<img src="${esc(imgs[0])}" alt="${esc(title)}">` : `<div class="media" style="--hue:${esc(idea.hue)}"><span class="empty">${esc(title.slice(0, 1))}</span></div>`}</div>
      ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((src, j) => `<button type="button" aria-label="${j + 1}" aria-current="${j === 0}" data-src="${esc(src)}"><img src="${esc(src)}" alt=""></button>`).join('')}</div>` : ''}
    </div>
    <div class="info">
      <button type="button" class="close" aria-label="${s.close}">×</button>
      <span class="kind">${esc(pick(idea, 'kind'))}</span>
      <h2 id="sheet-title">${esc(title)}${state.lang === 'zh' && idea.title_en ? `<small>${esc(idea.title_en)}</small>` : ''}</h2>
      ${pick(idea, 'lead') || pick(idea, 'line') ? `<p class="lead">${esc(pick(idea, 'lead') || pick(idea, 'line'))}</p>` : ''}
      ${facts.length ? `<div class="facts">${facts.map(f => `<div><b>${esc(f.n)}</b><span>${esc((state.lang === 'en' && f.en) || f.zh || '')}</span></div>`).join('')}</div>` : ''}
      ${meta.length ? `<dl class="meta">${meta.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : ''}
      <div class="actions">
        ${isHttp(idea.url) ? `<a class="btn primary" href="${esc(idea.url)}" target="_blank" rel="noopener">${idea.category === 'other' ? s.openResource : s.open} ↗</a>` : ''}
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
  document.body.style.setProperty('--tint', idea.hue);
  sheet.showModal();
}

for (const d of document.querySelectorAll('dialog')) {
  d.addEventListener('click', e => { if (e.target === d && d.id !== 'editor') d.close(); });
}

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
      <p class="hint">${s.loginHint}</p>
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
    <p class="hint">${s.editorHint}</p>
    <div class="json-tools">
      <label class="pill">${s.jsonImport}<input type="file" accept="application/json,.json" data-json></label>
      <button type="button" class="pill" data-export>${s.jsonExport}</button>
      <button type="button" class="pill" data-template>${s.jsonTemplate}</button>
    </div>

    <section>
      <h3>${s.secImages}</h3>
      <label class="drop" data-drop><b>${s.dropTitle}</b><span>${s.dropSub}</span><input type="file" accept="image/*" multiple data-files></label>
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
        ${inp('tags_zh', `${s.tagsZh} <em>· ${s.tagsHint}</em>`, (v.tags_zh || []).join(', '))}
        ${inp('tags_en', `${s.tagsEn} <em>· ${s.tagsHint}</em>`, (v.tags_en || []).join(', '))}
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
  if (f) {
    state.filter = f.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === f)));
    applyFilter();
  }
  const act = e.target.closest('[data-act]')?.dataset.act;
  if (act === 'add') openEditor();
  if (act === 'login') openLogin();
  if (act === 'signout') signOut();
});
addEventListener('hashchange', renderAdminBar);

renderStatic();
$('#grid').innerHTML = '<div class="skeleton"></div>'.repeat(3);
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
if (sb) {
  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return;
    // 回调里不能直接 await Supabase 请求，放到下一轮
    setTimeout(async () => { await refreshAuth(session); await reload(); }, 0);
  });
}
