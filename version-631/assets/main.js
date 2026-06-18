(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !mobileNav) {
            return;
        }

        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });

        mobileNav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                mobileNav.classList.remove("is-open");
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function collectValues(cards, key) {
        var values = new Set();
        cards.forEach(function (card) {
            var value = card.getAttribute("data-" + key) || "";
            if (value) {
                values.add(value);
            }
        });
        return Array.from(values).sort(function (a, b) {
            return b.localeCompare(a, "zh-Hans-CN");
        });
    }

    function fillSelect(select, cards, key) {
        var existing = select.value;
        collectValues(cards, key).forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
        select.value = existing;
    }

    function setupFilters() {
        document.querySelectorAll("[data-movie-filter]").forEach(function (panel) {
            var section = panel.classList.contains("movie-list-section") ? panel : panel.nextElementSibling;
            while (section && !section.querySelector("[data-movie-card]")) {
                section = section.nextElementSibling;
            }
            if (!section) {
                return;
            }

            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
            var input = panel.querySelector("[data-filter-input]");
            var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-select]"));
            var empty = panel.querySelector("[data-empty]");

            selects.forEach(function (select) {
                fillSelect(select, cards, select.getAttribute("data-filter-select"));
            });

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var filters = {};

                selects.forEach(function (select) {
                    var key = select.getAttribute("data-filter-select");
                    filters[key] = select.value;
                });

                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-filter-text") || "").toLowerCase();
                    var matched = !query || text.indexOf(query) !== -1;

                    Object.keys(filters).forEach(function (key) {
                        var expected = filters[key];
                        if (expected && card.getAttribute("data-" + key) !== expected) {
                            matched = false;
                        }
                    });

                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });

            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q && input) {
                input.value = q;
            }

            apply();
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });
}());
