(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function setSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                setSlide(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", function () {
            clearInterval(timer);
        });
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initFilters() {
        var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
        areas.forEach(function (area) {
            var input = area.querySelector("[data-filter-input]");
            var select = area.querySelector("[data-filter-kind]");
            var cards = Array.prototype.slice.call(area.querySelectorAll("[data-card]"));
            if (!cards.length) {
                return;
            }
            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }
            function update() {
                var keyword = normalize(input && input.value);
                var kind = normalize(select && select.value);
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var cardKind = normalize(card.getAttribute("data-kind"));
                    var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                    var kindMatch = !kind || cardKind === kind;
                    card.hidden = !(keywordMatch && kindMatch);
                });
            }
            if (input) {
                input.addEventListener("input", update);
            }
            if (select) {
                select.addEventListener("change", update);
            }
        });
    }

    function attachVideo(video, source, state) {
        if (state.ready) {
            return Promise.resolve(true);
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            state.ready = true;
            return Promise.resolve(true);
        }
        if (window.Hls && window.Hls.isSupported()) {
            state.hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            state.hls.loadSource(source);
            state.hls.attachMedia(video);
            state.ready = true;
            return Promise.resolve(true);
        }
        video.src = source;
        state.ready = true;
        return Promise.resolve(true);
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".play-overlay");
            if (!video || !button) {
                return;
            }
            var source = video.getAttribute("data-video-url");
            var state = {
                ready: false,
                hls: null
            };
            function play() {
                if (!source) {
                    return;
                }
                attachVideo(video, source, state).then(function () {
                    button.classList.add("is-hidden");
                    var promise = video.play();
                    if (promise && typeof promise.catch === "function") {
                        promise.catch(function () {
                            button.classList.remove("is-hidden");
                        });
                    }
                });
            }
            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                button.classList.add("is-hidden");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    button.classList.remove("is-hidden");
                }
            });
            video.addEventListener("ended", function () {
                button.classList.remove("is-hidden");
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
}());
