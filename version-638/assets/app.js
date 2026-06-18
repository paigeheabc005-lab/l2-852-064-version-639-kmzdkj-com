(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function clip(value, limit) {
    var text = String(value || '').replace(/\s+/g, ' ').trim();
    return text.length > limit ? text.slice(0, limit - 1) + '…' : text;
  }

  function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        window.location.href = 'search.html?q=' + encodeURIComponent(input.value.trim());
      });
    });
  }

  function setupHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    restart();
  }

  function setupFilters() {
    var panel = qs('[data-filter-panel]');
    var grid = qs('[data-filterable]');
    if (!panel || !grid) {
      return;
    }
    var keyword = qs('[data-filter-keyword]', panel);
    var region = qs('[data-filter-region]', panel);
    var year = qs('[data-filter-year]', panel);
    var sort = qs('[data-filter-sort]', panel);
    var empty = qs('[data-empty-state]');
    var cards = qsa('.movie-card', grid);
    var original = cards.slice();

    function apply() {
      var key = normalize(keyword && keyword.value);
      var selectedRegion = region ? region.value : '';
      var selectedYear = year ? year.value : '';
      var selectedSort = sort ? sort.value : 'default';
      var visible = original.filter(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        var okKey = !key || text.indexOf(key) !== -1;
        var okRegion = !selectedRegion || card.dataset.region === selectedRegion;
        var okYear = !selectedYear || card.dataset.year === selectedYear;
        return okKey && okRegion && okYear;
      });

      if (selectedSort === 'year-desc') {
        visible.sort(function (a, b) {
          return String(b.dataset.year || '').localeCompare(String(a.dataset.year || ''));
        });
      } else if (selectedSort === 'title-asc') {
        visible.sort(function (a, b) {
          return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
        });
      }

      original.forEach(function (card) {
        card.style.display = 'none';
      });
      visible.forEach(function (card) {
        card.style.display = '';
        grid.appendChild(card);
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible.length === 0);
      }
    }

    [keyword, region, year, sort].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function movieCard(movie) {
    return '<a class="movie-card" href="' + escapeHtml(movie.file) + '" data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-year="' + escapeHtml(movie.year) + '" data-genre="' + escapeHtml(movie.genre) + '">' +
      '<span class="poster-frame"><img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" class="poster-img" loading="lazy" onerror="this.style.opacity=\'0\';"></span>' +
      '<span class="movie-card-body"><span class="movie-card-topline">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + '</span>' +
      '<strong>' + escapeHtml(movie.title) + '</strong>' +
      '<em>' + escapeHtml(clip(movie.oneLine, 58)) + '</em>' +
      '<span class="movie-meta">' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</span></span></a>';
  }

  function setupSearchPage() {
    var results = qs('[data-search-results]');
    var status = qs('[data-search-status]');
    var form = qs('[data-search-page-form]');
    if (!results || !status || !form || !window.SITE_MOVIES) {
      return;
    }
    var input = form.querySelector('input[name="q"]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
    }
    form.addEventListener('submit', function (event) {
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
    if (!query.trim()) {
      return;
    }
    var key = normalize(query);
    var matched = window.SITE_MOVIES.filter(function (movie) {
      return normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' ')).indexOf(key) !== -1;
    });
    status.innerHTML = '<h2>搜索结果</h2><p>关键词：' + escapeHtml(query) + '</p>';
    results.innerHTML = matched.length ? matched.map(movieCard).join('') : '<div class="empty-state is-visible">没有找到匹配内容</div>';
  }

  function attachSource(video, source) {
    if (video.dataset.ready === '1') {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.dataset.ready = '1';
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
      video.dataset.ready = '1';
      return;
    }
    video.src = source;
    video.dataset.ready = '1';
  }

  window.initVideoPlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var cover = document.getElementById(options.coverId);
    if (!video || !cover || !options.source) {
      return;
    }

    function start() {
      attachSource(video, options.source);
      cover.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function toggle() {
      attachSource(video, options.source);
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    }

    cover.addEventListener('click', start);
    video.addEventListener('click', toggle);
    video.addEventListener('play', function () {
      cover.classList.add('is-hidden');
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
