(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll(".site-search-form");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (!value) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupFilters() {
    var inputs = document.querySelectorAll("[data-filter-input]");
    inputs.forEach(function (input) {
      var target = document.querySelector(input.getAttribute("data-filter-target"));
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll("[data-card]"));
      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-title") + " " + card.getAttribute("data-tags")).toLowerCase();
          card.style.display = !keyword || haystack.indexOf(keyword) !== -1 ? "" : "none";
        });
      });
    });
  }

  function setupPlayer() {
    var player = document.querySelector("[data-player]");
    if (!player) {
      return;
    }
    var video = player.querySelector("video");
    var cover = player.querySelector(".play-cover");
    var source = player.getAttribute("data-src");
    var hls;
    if (!video || !source) {
      return;
    }

    function bind() {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      video.setAttribute("data-ready", "1");
    }

    function start() {
      bind();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
      return "<span class=\"tag\">" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\" data-card data-title=\"" + escapeHtml(movie.title) + "\" data-tags=\"" + escapeHtml([movie.genre, movie.region, movie.type].concat(movie.tags || []).join(" ")) + "\">" +
      "<a href=\"" + movie.url + "\">" +
      "<div class=\"card-poster\"><img src=\"" + movie.image + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><div class=\"card-play\"><span>▶</span></div><span class=\"card-ribbon\">" + escapeHtml(movie.genreLabel) + "</span><span class=\"card-year\">" + escapeHtml(movie.year) + "</span></div>" +
      "<div class=\"card-body\"><h3 class=\"card-title\">" + escapeHtml(movie.title) + "</h3><p class=\"card-summary\">" + escapeHtml(movie.desc) + "</p><div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div><div class=\"card-tags\">" + tags + "</div></div>" +
      "</a></article>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function setupSearchPage() {
    var input = document.querySelector("[data-search-page-input]");
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");
    var defaultBlock = document.querySelector("[data-search-default]");
    if (!input || !results || !summary || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render() {
      var keyword = input.value.trim().toLowerCase();
      if (!keyword) {
        results.innerHTML = "";
        summary.textContent = "输入影片名、类型、地区或标签进行搜索";
        if (defaultBlock) {
          defaultBlock.style.display = "";
        }
        return;
      }
      var list = window.SEARCH_MOVIES.filter(function (movie) {
        var text = [movie.title, movie.desc, movie.region, movie.type, movie.year, movie.genre].concat(movie.tags || []).join(" ").toLowerCase();
        return text.indexOf(keyword) !== -1;
      }).slice(0, 96);
      results.innerHTML = list.map(cardTemplate).join("");
      summary.textContent = list.length ? "为你找到相关影片" : "没有找到匹配影片";
      if (defaultBlock) {
        defaultBlock.style.display = list.length ? "none" : "";
      }
    }

    var form = input.closest("form");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var value = input.value.trim();
        var url = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
        window.history.replaceState(null, "", url);
        render();
      });
    }
    input.addEventListener("input", render);
    render();
  }

  ready(function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupPlayer();
    setupSearchPage();
  });
})();
