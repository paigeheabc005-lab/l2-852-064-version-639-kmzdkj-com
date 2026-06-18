(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.from((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMobileNav() {
        var toggle = $('[data-menu-toggle]');
        var nav = $('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHeaderSearch() {
        var data = window.SEARCH_DATA || [];
        $all('[data-search-form]').forEach(function (form) {
            var input = $('[data-search-input]', form);
            var suggest = $('[data-search-suggest]', form.parentElement || document);
            if (!input) {
                return;
            }

            form.addEventListener('submit', function (event) {
                var keyword = input.value.trim();
                if (!keyword) {
                    event.preventDefault();
                    return;
                }
            });

            if (!suggest) {
                return;
            }

            input.addEventListener('input', function () {
                var keyword = normalize(input.value);
                suggest.innerHTML = '';
                if (!keyword) {
                    return;
                }
                var results = data.filter(function (movie) {
                    return normalize(movie.title + ' ' + movie.region + ' ' + movie.genre + ' ' + movie.tags + ' ' + movie.oneLine).includes(keyword);
                }).slice(0, 6);

                suggest.innerHTML = results.map(function (movie) {
                    return '<a class="suggest-item" href="' + movie.href + '">' +
                        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">' +
                        '<span><strong>' + escapeHtml(movie.title) + '</strong><small>' +
                        escapeHtml(movie.region + ' · ' + movie.year) + '</small></span></a>';
                }).join('');
            });
        });
    }

    function setupHero() {
        var root = $('[data-hero-carousel]');
        if (!root) {
            return;
        }
        var slides = $all('[data-hero-slide]', root);
        var dots = $all('[data-hero-dot]', root);
        var prev = $('[data-hero-prev]', root);
        var next = $('[data-hero-next]', root);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
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
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupPageFilters() {
        var grid = $('[data-filter-grid]');
        if (!grid) {
            return;
        }
        var input = $('[data-page-filter]');
        var select = $('[data-sort-select]');
        var cards = $all('[data-movie-card]', grid);
        var original = cards.slice();

        function filterAndSort() {
            var keyword = normalize(input ? input.value : '');
            var sortValue = select ? select.value : 'default';
            var visible = cards.filter(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.genre
                ].join(' '));
                var match = !keyword || haystack.includes(keyword);
                card.style.display = match ? '' : 'none';
                return match;
            });

            var sorted = sortValue === 'default' ? original : visible.slice().sort(function (a, b) {
                if (sortValue === 'title') {
                    return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-CN');
                }
                var ay = parseInt(a.dataset.year, 10) || 0;
                var by = parseInt(b.dataset.year, 10) || 0;
                return sortValue === 'year-asc' ? ay - by : by - ay;
            });

            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        if (input) {
            input.addEventListener('input', filterAndSort);
        }
        if (select) {
            select.addEventListener('change', filterAndSort);
        }
    }

    function setupSearchPage() {
        var resultRoot = $('[data-search-results]');
        var head = $('[data-search-result-head]');
        var pageInput = $('[data-search-page-input]');
        if (!resultRoot || !head) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var keyword = params.get('q') || '';
        if (pageInput) {
            pageInput.value = keyword;
        }
        keyword = keyword.trim();
        if (!keyword) {
            return;
        }
        var normalized = normalize(keyword);
        var data = window.SEARCH_DATA || [];
        var results = data.filter(function (movie) {
            return normalize(movie.title + ' ' + movie.region + ' ' + movie.genre + ' ' + movie.tags + ' ' + movie.oneLine).includes(normalized);
        });
        head.textContent = '搜索“' + keyword + '”找到 ' + results.length + ' 个结果';
        resultRoot.innerHTML = results.map(searchCard).join('');
    }

    function searchCard(movie) {
        var tags = (movie.tags || '').split(',').filter(Boolean).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag.trim()) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a class="movie-poster-link" href="' + movie.href + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="quality-badge">高清</span><span class="poster-play">▶</span></a>' +
            '<div class="movie-card-body"><a class="movie-title" href="' + movie.href + '">' + escapeHtml(movie.title) + '</a>' +
            '<p class="movie-meta">' + escapeHtml(movie.region + ' · ' + movie.type + ' · ' + movie.year) + '</p>' +
            '<p class="movie-summary">' + escapeHtml(movie.oneLine || '') + '</p>' +
            '<div class="movie-tags">' + tags + '</div></div></article>';
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[character];
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNav();
        setupHeaderSearch();
        setupHero();
        setupPageFilters();
        setupSearchPage();
    });
})();
