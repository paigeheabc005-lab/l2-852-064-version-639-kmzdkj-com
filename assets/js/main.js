(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector('.mobile-menu-button');
        var mobileNav = document.querySelector('.mobile-nav');
        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function () {
                var open = mobileNav.classList.toggle('open');
                menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        }

        document.querySelectorAll('.back-top').forEach(function (button) {
            button.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        if (slides.length > 1) {
            var active = 0;
            var show = function (index) {
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('active', i === active);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('active', i === active);
                });
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener('click', function () {
                    show(i);
                });
            });
            setInterval(function () {
                show(active + 1);
            }, 5600);
        }

        var filterPanels = document.querySelectorAll('.filter-panel');
        filterPanels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var inputs = panel.querySelectorAll('[data-filter]');
            var items = scope.querySelectorAll('.movie-card, .rank-item');
            var empty = scope.querySelector('.empty-state');

            var normalize = function (value) {
                return String(value || '').trim().toLowerCase();
            };

            var apply = function () {
                var query = normalize(panel.querySelector('[data-filter="search"]') && panel.querySelector('[data-filter="search"]').value);
                var region = normalize(panel.querySelector('[data-filter="region"]') && panel.querySelector('[data-filter="region"]').value);
                var type = normalize(panel.querySelector('[data-filter="type"]') && panel.querySelector('[data-filter="type"]').value);
                var category = normalize(panel.querySelector('[data-filter="category"]') && panel.querySelector('[data-filter="category"]').value);
                var visible = 0;

                items.forEach(function (item) {
                    var haystack = normalize([
                        item.dataset.title,
                        item.dataset.genre,
                        item.dataset.region,
                        item.dataset.type,
                        item.dataset.category
                    ].join(' '));
                    var ok = true;
                    if (query && haystack.indexOf(query) === -1) ok = false;
                    if (region && region !== 'all' && normalize(item.dataset.region) !== region) ok = false;
                    if (type && type !== 'all' && normalize(item.dataset.type).indexOf(type) === -1) ok = false;
                    if (category && category !== 'all' && normalize(item.dataset.category) !== category) ok = false;
                    item.style.display = ok ? '' : 'none';
                    if (ok) visible += 1;
                });

                if (empty) {
                    empty.style.display = visible ? 'none' : 'block';
                }
            };

            inputs.forEach(function (input) {
                input.addEventListener('input', apply);
                input.addEventListener('change', apply);
            });
        });
    });
})();
