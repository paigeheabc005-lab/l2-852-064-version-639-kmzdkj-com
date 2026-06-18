(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    function markMissingCover(image) {
        var frame = image.closest('.movie-card__media, .hero-feature, .hero-mini-card, .ranking-item, .side-card, .hero__background');
        if (!frame) {
            frame = image.parentElement;
        }
        if (frame) {
            frame.classList.add('cover-missing');
            frame.setAttribute('data-cover-title', image.getAttribute('alt') || '影片封面');
        }
    }

    document.querySelectorAll('img').forEach(function (image) {
        if (image.complete && image.naturalWidth === 0) {
            markMissingCover(image);
        }
        image.addEventListener('error', function () {
            markMissingCover(image);
        });
    });

    var searchRoot = document.querySelector('[data-search-root]');
    if (!searchRoot || !window.MOVIE_CATALOG) {
        return;
    }

    var input = searchRoot.querySelector('[data-search-input]');
    var regionSelect = searchRoot.querySelector('[data-region-filter]');
    var typeSelect = searchRoot.querySelector('[data-type-filter]');
    var yearSelect = searchRoot.querySelector('[data-year-filter]');
    var results = searchRoot.querySelector('[data-search-results]');
    var status = searchRoot.querySelector('[data-search-status]');
    var loadMore = searchRoot.querySelector('[data-load-more]');
    var visibleCount = Number(searchRoot.getAttribute('data-initial-count') || 24);
    var filtered = [];

    function uniqueValues(key) {
        var values = window.MOVIE_CATALOG.map(function (item) {
            return item[key] || '';
        }).filter(Boolean);
        return Array.from(new Set(values)).sort(function (a, b) {
            return String(a).localeCompare(String(b), 'zh-Hans-CN');
        });
    }

    function fillSelect(select, values, label) {
        if (!select) {
            return;
        }
        select.innerHTML = '<option value="">' + label + '</option>' + values.map(function (value) {
            return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>';
        }).join('');
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[char];
        });
    }

    function cardTemplate(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card">',
            '  <a class="movie-card__media" href="' + escapeHtml(item.url) + '" aria-label="查看《' + escapeHtml(item.title) + '》详情">',
            '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + ' 封面" loading="lazy">',
            '    <span class="play-chip">播放</span>',
            '  </a>',
            '  <div class="movie-card__body">',
            '    <div class="movie-card__meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
            '    <h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
            '    <p>' + escapeHtml(item.oneLine || item.genre || '') + '</p>',
            '    <div class="tag-row">' + tags + '</div>',
            '  </div>',
            '</article>'
        ].join('');
    }

    function applyFilters(resetCount) {
        if (resetCount) {
            visibleCount = Number(searchRoot.getAttribute('data-initial-count') || 24);
        }

        var keyword = (input && input.value || '').trim().toLowerCase();
        var region = regionSelect && regionSelect.value || '';
        var type = typeSelect && typeSelect.value || '';
        var year = yearSelect && yearSelect.value || '';

        filtered = window.MOVIE_CATALOG.filter(function (item) {
            var haystack = [
                item.title,
                item.region,
                item.type,
                item.year,
                item.genre,
                item.oneLine,
                (item.tags || []).join(' ')
            ].join(' ').toLowerCase();

            return (!keyword || haystack.indexOf(keyword) !== -1) &&
                (!region || item.region === region) &&
                (!type || item.type === type) &&
                (!year || item.year === year);
        });

        renderResults();
    }

    function renderResults() {
        if (!results) {
            return;
        }

        var page = filtered.slice(0, visibleCount);
        results.innerHTML = page.map(cardTemplate).join('');

        results.querySelectorAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                markMissingCover(image);
            });
        });

        if (status) {
            status.textContent = '已匹配 ' + filtered.length + ' 部作品，当前显示 ' + page.length + ' 部。';
        }

        if (loadMore) {
            loadMore.style.display = visibleCount < filtered.length ? 'inline-flex' : 'none';
        }
    }

    fillSelect(regionSelect, uniqueValues('region'), '全部地区');
    fillSelect(typeSelect, uniqueValues('type'), '全部类型');
    fillSelect(yearSelect, uniqueValues('year').reverse(), '全部年份');

    [input, regionSelect, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
            control.addEventListener('input', function () {
                applyFilters(true);
            });
            control.addEventListener('change', function () {
                applyFilters(true);
            });
        }
    });

    if (loadMore) {
        loadMore.addEventListener('click', function () {
            visibleCount += Number(searchRoot.getAttribute('data-step-count') || 24);
            renderResults();
        });
    }

    applyFilters(false);
}());
