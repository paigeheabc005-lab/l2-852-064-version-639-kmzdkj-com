(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var toggle = qs('.menu-toggle');
  var mobileNav = qs('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  qsa('[data-hero]').forEach(function (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  });

  function filterCards(root) {
    var input = qs('[data-search-input]', root);
    var cards = qsa('.movie-card, .ranking-item', root);
    var empty = qs('[data-no-results]', root);
    var activeFilter = qs('.filter-button.is-active', root);
    var query = normalize(input ? input.value : '');
    var filterValue = activeFilter ? normalize(activeFilter.getAttribute('data-filter-value')) : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' '));
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesFilter = !filterValue || filterValue === 'all' || haystack.indexOf(filterValue) !== -1;
      var show = matchesQuery && matchesFilter;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  qsa('[data-search-area]').forEach(function (area) {
    var input = qs('[data-search-input]', area);
    var form = qs('[data-search-form]', area);
    if (input) {
      input.addEventListener('input', function () {
        filterCards(area);
      });
    }
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        filterCards(area);
      });
    }
    qsa('.filter-button', area).forEach(function (button) {
      button.addEventListener('click', function () {
        qsa('.filter-button', area).forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        filterCards(area);
      });
    });
  });

  qsa('[data-search-form]').forEach(function (form) {
    if (form.closest('[data-search-area]')) {
      return;
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = qs('[data-search-input]', form);
      if (value && value.value.trim()) {
        window.location.href = 'ranking.html?q=' + encodeURIComponent(value.value.trim());
      }
    });
  });

  function startVideo(video) {
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-video');
    if (!source) {
      return;
    }
    if (video.getAttribute('data-ready') === 'true') {
      video.play().catch(function () {});
      return;
    }
    video.setAttribute('data-ready', 'true');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {});
      }, { once: true });
      video.load();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }
    video.src = source;
    video.play().catch(function () {});
  }

  qsa('[data-play-target]').forEach(function (control) {
    control.addEventListener('click', function (event) {
      event.preventDefault();
      var id = control.getAttribute('data-play-target');
      var video = id ? document.getElementById(id) : qs('.video-player');
      var shell = video ? video.closest('.video-shell') : null;
      var overlay = shell ? qs('.player-overlay', shell) : null;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      startVideo(video);
    });
  });

  qsa('.video-player').forEach(function (video) {
    video.addEventListener('play', function () {
      var shell = video.closest('.video-shell');
      var overlay = shell ? qs('.player-overlay', shell) : null;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      startVideo(video);
    }, { once: true });
  });

  var params = new URLSearchParams(window.location.search);
  var searchValue = params.get('q');
  if (searchValue) {
    qsa('[data-search-area]').forEach(function (area) {
      var input = qs('[data-search-input]', area);
      if (input) {
        input.value = searchValue;
        filterCards(area);
      }
    });
  }
})();
