/* ---------------------------------------------------------------
   作品集网站脚本 —— 原生 JS，无框架无依赖
   1) 读 projects.json   2) 渲染卡片网格   3) 点卡片弹详情
   4) 支持 #项目id 直达（可分享链接）  5) EN / 中文 切换
   --------------------------------------------------------------- */

(function () {
  'use strict';

  /* ---------- 文案（界面文字，中英切换；项目介绍来自 projects.json） ---------- */

  var I18N = {
    en: {
      siteTitle: 'Game Portfolio',
      siteTagline: 'Android games — design, code, ship.',
      downloadApk: 'Download APK',
      footerNote: 'Built as a static site — no frameworks.',
      empty: 'No projects yet — add entries to projects.json.',
      loadError: 'Could not load projects.json.',
      fileHint:
        'Opened directly from disk? Browsers block reading local JSON over file://.\n' +
        'Serve it over HTTP instead — e.g. run "python -m http.server" in this folder — ' +
        'or just deploy it to GitHub Pages.',
      released: 'Released',
      screenshots: 'Screenshots'
    },
    zh: {
      siteTitle: '游戏作品集',
      siteTagline: 'Android 游戏 —— 设计、开发、上线。',
      downloadApk: '下载 APK',
      footerNote: '纯静态站点，未使用任何框架。',
      empty: '还没有项目 —— 在 projects.json 里添加即可。',
      loadError: '读取 projects.json 失败。',
      fileHint:
        '是直接双击打开的 HTML 吗？浏览器会拦截 file:// 下的本地 JSON 读取。\n' +
        '请用本地服务器打开（在本目录执行 python -m http.server），或直接部署到 GitHub Pages。',
      released: '发布',
      screenshots: '游戏截图'
    }
  };

  var FALLBACK_IMG =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E" +
    "%3Crect width='100%25' height='100%25' fill='%23121728'/%3E" +
    "%3Ctext x='50%25' y='50%25' fill='%23556080' font-family='sans-serif' font-size='22' " +
    "text-anchor='middle' dominant-baseline='middle'%3Eimage not found%3C/text%3E%3C/svg%3E";

  var state = { lang: 'en', projects: [], openId: null, shotIndex: 0, lastFocus: null };

  var $ = function (sel) { return document.querySelector(sel); };

  function t(key) {
    var pack = I18N[state.lang] || I18N.en;
    return pack[key] || I18N.en[key] || key;
  }

  /* 项目字段按语言取值：nameZh / introZh 是可选的，
     没填就两种语言都显示英文，格式与只有 name / intro 时完全兼容。 */
  function pick(en, zh) {
    if (state.lang === 'zh' && zh) return zh;
    return en || '';
  }

  /* ---------- 小工具 ---------- */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;   // 一律用 textContent，项目数据不会被当成 HTML
    return node;
  }

  function image(src, alt, className) {
    var img = document.createElement('img');
    if (className) img.className = className;
    img.alt = alt || '';
    img.loading = 'lazy';
    img.onerror = function () { img.onerror = null; img.src = FALLBACK_IMG; };
    img.src = src || FALLBACK_IMG;
    return img;
  }

  function tagList(tags) {
    var ul = el('ul', 'tags');
    (tags || []).forEach(function (tag) {
      ul.appendChild(el('li', 'tag', tag));
    });
    return ul;
  }

  function projectById(id) {
    for (var i = 0; i < state.projects.length; i++) {
      if (state.projects[i].id === id) return state.projects[i];
    }
    return null;
  }

  /* ---------- 界面文字刷新 ---------- */

  function applyStaticText() {
    document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
    document.title = t('siteTitle');
    document.querySelectorAll('[data-i18n]').forEach(function (node) {
      node.textContent = t(node.getAttribute('data-i18n'));
    });
    $('#langToggle').textContent = state.lang === 'zh' ? 'EN' : '中文';
  }

  /* ---------- 卡片网格 ---------- */

  function renderGrid() {
    var grid = $('#grid');
    grid.textContent = '';

    if (!state.projects.length) {
      showStatus(t('empty'));
      return;
    }

    state.projects.forEach(function (project) {
      var card = el('button', 'card');
      card.type = 'button';
      card.setAttribute('data-id', project.id);

      var coverBox = el('div', 'card-cover');
      coverBox.appendChild(image(project.cover, pick(project.name, project.nameZh)));
      card.appendChild(coverBox);

      var body = el('div', 'card-body');
      body.appendChild(el('h2', 'card-title', pick(project.name, project.nameZh)));
      if (project.date) body.appendChild(el('span', 'card-date', project.date));
      body.appendChild(tagList(project.tags));
      card.appendChild(body);

      card.addEventListener('click', function () { location.hash = project.id; });
      grid.appendChild(card);
    });
  }

  /* ---------- 详情弹窗 ---------- */

  function openModal(project, keepShot) {
    state.openId = project.id;
    if (!keepShot) state.shotIndex = 0;

    var shots = (project.screenshots && project.screenshots.length)
      ? project.screenshots
      : [project.cover];

    var main = $('#mShot');
    main.onerror = function () { main.onerror = null; main.src = FALLBACK_IMG; };

    var strip = $('#mStrip');
    strip.textContent = '';

    var showShot = function (index) {
      state.shotIndex = index;
      main.src = shots[index] || FALLBACK_IMG;
      main.alt = pick(project.name, project.nameZh) + ' — ' + t('screenshots') + ' ' + (index + 1);
      Array.prototype.forEach.call(strip.children, function (btn, i) {
        btn.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    };

    shots.forEach(function (src, index) {
      var btn = el('button', 'shot-thumb');
      btn.type = 'button';
      btn.setAttribute('aria-label', t('screenshots') + ' ' + (index + 1));
      btn.appendChild(image(src, ''));
      btn.addEventListener('click', function () { showShot(index); });
      strip.appendChild(btn);
    });

    $('#mTitle').textContent = pick(project.name, project.nameZh);
    $('#mMeta').textContent = project.date ? t('released') + ' ' + project.date : '';
    $('#mIntro').textContent = pick(project.intro, project.introZh);

    var tags = $('#mTags');
    tags.textContent = '';
    (project.tags || []).forEach(function (tag) { tags.appendChild(el('li', 'tag', tag)); });

    var apk = $('#mApk');
    if (project.apk) {
      apk.hidden = false;
      apk.href = project.apk;
      apk.setAttribute('download', '');
    } else {
      apk.hidden = true;
    }

    showShot(Math.min(state.shotIndex, shots.length - 1));
    strip.hidden = shots.length < 2;

    state.lastFocus = document.activeElement;
    var modal = $('#modal');
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.modal-close').focus();
  }

  function closeModal() {
    var modal = $('#modal');
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    $('#mShot').removeAttribute('src');
    state.openId = null;
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
  }

  /* hash 是唯一的状态来源：#项目id 既能从卡片点进去，也能直接分享 */
  function syncFromHash() {
    var id = decodeURIComponent(location.hash.replace(/^#/, ''));
    var project = id ? projectById(id) : null;
    if (project) {
      if (state.openId !== project.id) openModal(project);
    } else {
      closeModal();
    }
  }

  function clearHash() {
    history.replaceState(null, '', location.pathname + location.search);
  }

  /* ---------- 状态提示 ---------- */

  function showStatus(html) {
    var box = $('#status');
    box.textContent = html;   // 纯文本，含换行由 CSS white-space: pre-line 处理
    box.hidden = false;
  }

  /* ---------- 读取数据 ---------- */

  function load() {
    fetch('projects.json', { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) throw new Error('projects.json 必须是数组');
        state.projects = data;
        renderGrid();
        syncFromHash();
      })
      .catch(function (err) {
        showStatus(t('loadError') + '  (' + err.message + ')\n' + t('fileHint'));
      });
  }

  /* ---------- 事件绑定 ---------- */

  function bind() {
    document.querySelectorAll('[data-close]').forEach(function (node) {
      node.addEventListener('click', function () { clearHash(); closeModal(); });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { clearHash(); closeModal(); }
    });

    $('#langToggle').addEventListener('click', function () {
      state.lang = state.lang === 'zh' ? 'en' : 'zh';
      try { localStorage.setItem('portfolioLang', state.lang); } catch (e) { /* 隐私模式下忽略 */ }
      applyStaticText();
      renderGrid();
      if (state.openId) {
        var project = projectById(state.openId);
        if (project) openModal(project, true);   // 切语言时不打断正在看的截图
      }
    });

    window.addEventListener('hashchange', syncFromHash);
  }

  /* ---------- 启动 ---------- */

  try {
    var saved = localStorage.getItem('portfolioLang');
    if (saved === 'zh' || saved === 'en') state.lang = saved;
  } catch (e) { /* 忽略 */ }

  applyStaticText();
  bind();
  load();
})();
