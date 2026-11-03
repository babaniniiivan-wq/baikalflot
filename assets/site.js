(function () {
  "use strict";

  // Появление при прокрутке: элементы мягко всплывают, когда входят в экран. Класс reveal-on ставит скрипт в начале страницы
  if (document.documentElement.classList.contains("reveal-on")) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    document.querySelectorAll("[data-reveal]").forEach(function (el) { revealer.observe(el); });
    window.BFS_REVEAL = true;
    // Движение уменьшили прямо во время просмотра: показываем всё сразу
    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", function (event) {
      if (event.matches) document.documentElement.classList.remove("reveal-on");
    });
  }

  var EMAIL = "babanindg@yandex.ru";
  var PHONE_TEXT = "+7 924 633-40-40";
  // На странице по закрытой ссылке почтовую программу открыть нельзя: форма только показывает контакты.
  var NO_MAIL = !!window.BFS_NO_MAIL;
  var FORM_NOTE = NO_MAIL
    ? "Это прототип: форма пока не отправляет заявки."
    : "Откроется ваша почтовая программа с готовым письмом на " + EMAIL + ". Заявка уйдёт, когда вы нажмёте «Отправить».";

  function icon(name) {
    return '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
  }

  function formHTML(prefix) {
    return (
      '<form class="request-form" novalidate>' +
      '<div class="field"><label for="' + prefix + '-name">Как к вам обращаться <span class="req" aria-hidden="true">*</span></label>' +
      '<input id="' + prefix + '-name" name="name" type="text" autocomplete="name" required>' +
      '<p class="field-error" id="' + prefix + '-name-error" hidden></p></div>' +
      '<div class="field"><label for="' + prefix + '-phone">Телефон <span class="req" aria-hidden="true">*</span></label>' +
      '<input id="' + prefix + '-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required>' +
      '<p class="field-error" id="' + prefix + '-phone-error" hidden></p></div>' +
      '<div class="field"><label for="' + prefix + '-topic">Что нужно сделать или найти</label>' +
      '<textarea id="' + prefix + '-topic" name="topic" rows="3"></textarea></div>' +
      '<button class="btn btn-primary btn-full" type="submit">Подготовить заявку</button>' +
      '<p class="form-note">' + FORM_NOTE + "</p>" +
      '<p class="form-status" role="status"></p>' +
      "</form>"
    );
  }

  function setError(form, field, message) {
    var error = form.querySelector("#" + field.id + "-error");
    if (message) {
      error.textContent = message;
      error.hidden = false;
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", error.id);
    } else {
      error.textContent = "";
      error.hidden = true;
      field.removeAttribute("aria-invalid");
      field.removeAttribute("aria-describedby");
    }
  }

  function validateField(form, field) {
    var value = field.value.trim();
    var message = "";
    if (field.name === "name" && !value) {
      message = "Напишите имя, чтобы мы знали, как к вам обращаться.";
    }
    if (field.name === "phone" && value.replace(/\D/g, "").length < 6) {
      message = "Укажите номер полностью, минимум 6 цифр: по нему мы вам перезвоним.";
    }
    setError(form, field, message);
    return !message;
  }

  function bindForm(form) {
    var name = form.elements.name;
    var phone = form.elements.phone;
    var status = form.querySelector(".form-status");

    [name, phone].forEach(function (field) {
      field.addEventListener("blur", function () {
        if (field.value.trim()) validateField(form, field);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      status.textContent = "";
      var nameOk = validateField(form, name);
      var phoneOk = validateField(form, phone);
      if (!nameOk || !phoneOk) {
        (nameOk ? phone : name).focus();
        return;
      }
      if (NO_MAIL) {
        status.textContent =
          "Заявка не отправлена: в прототипе форма пока не работает. Свяжитесь с нами: " +
          PHONE_TEXT + ", " + EMAIL + ".";
        return;
      }
      var body = [
        "Имя: " + name.value.trim(),
        "Телефон: " + phone.value.trim(),
        "",
        form.elements.topic.value.trim()
      ].join("\n");
      status.textContent =
        "Письмо подготовлено: проверьте его и нажмите «Отправить» в почтовой программе. " +
        "Если она не открылась, позвоните нам: " + PHONE_TEXT + ".";
      window.location.href =
        "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent("Заявка с сайта БайкалФлотСервис") +
        "&body=" + encodeURIComponent(body);
    });
  }

  // Формы на странице
  document.querySelectorAll("[data-form-mount]").forEach(function (mount) {
    mount.innerHTML = formHTML(mount.getAttribute("data-form-mount"));
    bindForm(mount.querySelector("form"));
  });

  // Окно заявки
  var dialog = document.createElement("dialog");
  dialog.className = "request-dialog";
  dialog.setAttribute("aria-labelledby", "dialog-title");
  dialog.innerHTML =
    '<div class="dialog-head"><h2 class="dialog-title" id="dialog-title">Запросить цену</h2>' +
    '<button class="dialog-close" type="button" aria-label="Закрыть">' + icon("x") + "</button></div>" +
    formHTML("dlg");
  document.body.appendChild(dialog);
  bindForm(dialog.querySelector("form"));
  dialog.querySelector(".dialog-close").addEventListener("click", function () { dialog.close(); });
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  document.addEventListener("click", function (event) {
    var trigger = event.target.closest("[data-request]");
    if (!trigger) return;
    var product = trigger.getAttribute("data-request");
    var topic = trigger.getAttribute("data-topic") || "";
    var form = dialog.querySelector("form");
    dialog.querySelector("#dialog-title").textContent = product ? "Запросить цену" : "Оставить заявку";
    form.elements.topic.value = product ? "Запрос цены и наличия: " + product : topic;
    form.querySelector(".form-status").textContent = "";
    dialog.showModal();
  });

  // Тень у шапки при прокрутке
  var header = document.querySelector(".site-header");
  if (header) {
    var updateHeader = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
  }

  // Меню на телефоне
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
      toggle.innerHTML = icon(open ? "x" : "menu");
    };
    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // Нижняя панель на телефоне: прячем там, где форма заявки уже на экране
  var mobileBar = document.getElementById("mobile-bar");
  var contacts = document.getElementById("contacts");
  if (mobileBar && contacts && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      mobileBar.classList.toggle("is-hidden", entries[0].isIntersecting);
    }).observe(contacts);
  }

  // Меню: отмечаем раздел, который сейчас на экране
  var navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  if (navLinks.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("is-current", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { spy.observe(s); });
  }

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  // Фоновые украшения стоят на паузе, когда вкладка скрыта
  document.addEventListener("visibilitychange", function () {
    document.body.classList.toggle("paused", document.hidden);
  });

  // Главный экран: видео идёт за прокруткой, а страница не останавливается. Вниз, и камера летит сквозь чаек к судну,
  // пока экран уезжает вверх; вверх, и всё отматывается назад. Полёт укладывается в первые полэкрана прокрутки
  var hero = document.querySelector(".hero");
  if (hero && hero.querySelector(".stage")) {
    var stage = hero.querySelector(".stage");
    var video = hero.querySelector(".hero-video");
    var posterLayer = hero.querySelector(".poster");
    var VIDEO_URL = "assets/hero-scrub.mp4";
    var POSTER = "assets/img/hero-poster.webp";
    var ENDING = "assets/img/hero-ending.webp";
    // Пять условий неподвижного экрана, слово в слово как в styles.css
    var GATES = [
      "(max-width: 720px)",
      "(orientation: portrait) and (max-width: 1024px)",
      "(orientation: portrait) and (pointer: coarse)",
      "(orientation: landscape) and (pointer: coarse) and (max-height: 560px)",
      "(prefers-reduced-motion: reduce)"
    ];
    var MQLS = GATES.map(function (q) { return matchMedia(q); });
    var initDone = false, started = false, failed = false, watch = null;
    var heroOnScreen = true, scrubOn = false, rafId = null, lastTick = 0, target = 0, shown = 0;
    var seekBusy = false, pendingTime = null, ready = false, stageTick = false;

    // Видео не загрузилось или включена экономия трафика: стоит последний кадр, судно на месте
    var failVideo = function () {
      if (failed) return;
      failed = true;
      seekBusy = false;
      pendingTime = null;
      stage.classList.remove("video-ready");
      stage.classList.add("video-failed", "is-ready");
      posterLayer.style.backgroundImage = "url('" + ENDING + "')";
    };
    video.addEventListener("error", failVideo);

    // Сколько страница уже проехала под шапкой
    var heroScrolled = function () {
      var top = header ? header.offsetHeight : 0;
      return Math.max(0, top - hero.getBoundingClientRect().top);
    };
    var heroProgress = function () {
      return clamp(heroScrolled() / (stage.offsetHeight * 0.5), 0, 1);
    };
    // Видео отстаёт от страницы: так оно остаётся на виду, пока камера долетает до судна
    var placeStage = function () {
      stageTick = false;
      stage.style.setProperty("--hy", (heroScrolled() * 0.45).toFixed(1) + "px");
    };
    // Судно на месте: под «к навигации» прорисовывается черта. С запасом, чтобы она не мигала на границе
    var markReady = function (p) {
      if (failed) return;
      var next = ready ? p > 0.85 : p > 0.96;
      if (next !== ready) {
        ready = next;
        stage.classList.toggle("is-ready", ready);
      }
    };
    // Новая перемотка только после окончания прежней: кадры не наслаиваются, прокрутка идёт гладко
    var requestSeek = function (t) {
      if (failed || !video.duration) return;
      if (seekBusy) { pendingTime = t; return; }
      seekBusy = true;
      video.currentTime = t;
    };
    video.addEventListener("seeked", function () {
      seekBusy = false;
      if (pendingTime !== null) {
        var t = pendingTime;
        pendingTime = null;
        requestSeek(t);
      }
    });
    // Время видео плавно догоняет прокрутку и замирает, когда догнало
    var tick = function (now) {
      var dt = Math.min(100, now - (lastTick || now));
      lastTick = now;
      shown += (target - shown) * (1 - Math.pow(1 - 0.16, dt / 16.667));
      if (Math.abs(target - shown) < 0.0005) { shown = target; rafId = null; lastTick = 0; }
      else rafId = requestAnimationFrame(tick);
      requestSeek(shown * video.duration);
      markReady(shown);
    };
    var onScroll = function () {
      target = heroProgress();
      if (!stageTick) { stageTick = true; requestAnimationFrame(placeStage); }
      if (rafId === null && heroOnScreen) rafId = requestAnimationFrame(tick);
    };
    // Сначала постер, потом видео целиком в память: так перемотка работает на любом хостинге
    var startFetch = function () {
      if (started || failed) return;
      started = true;
      fetch(VIDEO_URL).then(function (res) {
        if (!res.ok) throw new Error("video " + res.status);
        return res.blob();
      }).then(function (blob) {
        video.addEventListener("loadeddata", function () {
          stage.classList.add("video-ready");
          shown = target = heroProgress();
          requestSeek(shown * video.duration);
          markReady(shown);
        }, { once: true });
        video.preload = "auto";
        video.src = URL.createObjectURL(blob);
        video.load();
      }).catch(failVideo);
    };
    var initHero = function () {
      if (initDone) return;
      initDone = true;
      if (navigator.connection && navigator.connection.saveData) { failVideo(); return; }
      posterLayer.style.backgroundImage = "url('" + POSTER + "')";
      var poster = new Image();
      poster.onload = poster.onerror = startFetch;
      poster.src = POSTER;
      setTimeout(startFetch, 4000);
    };
    var enableScrub = function () {
      if (scrubOn) return;
      scrubOn = true;
      initHero();
      addEventListener("scroll", onScroll, { passive: true });
      addEventListener("resize", onScroll);
      if (!watch && "IntersectionObserver" in window) {
        watch = new IntersectionObserver(function (entries) {
          heroOnScreen = entries[0].isIntersecting;
          if (heroOnScreen) onScroll();
        });
        watch.observe(hero);
      }
      onScroll();
    };
    var disableScrub = function () {
      if (!scrubOn) return;
      scrubOn = false;
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; lastTick = 0; }
      stage.style.removeProperty("--hy");
    };
    var applyHeroMode = function () {
      if (MQLS.some(function (m) { return m.matches; })) disableScrub();
      else enableScrub();
    };
    MQLS.forEach(function (m) { m.addEventListener("change", applyHeroMode); });
    applyHeroMode();
  }

  // Лента услуг едет вбок вместе с прокруткой и стоит на месте, если движение уменьшено
  var ribbon = document.querySelector(".ribbon");
  var parallaxBg = document.querySelector(".contacts-bg img");
  if ((ribbon || parallaxBg) && "IntersectionObserver" in window) {
    var drift = [];
    if (ribbon) {
      var track = ribbon.querySelector(".ribbon-track");
      drift.push({ box: ribbon, on: false, move: function (r) {
        track.style.setProperty("--rx", ((r.top - innerHeight) * 0.4).toFixed(1) + "px");
      } });
    }
    // Закат в контактах чуть отстаёт от прокрутки, как дальний план в кино
    if (parallaxBg) {
      drift.push({ box: parallaxBg.parentElement, on: false, move: function (r) {
        var p = (r.top + r.height / 2 - innerHeight / 2) / (innerHeight / 2 + r.height / 2);
        parallaxBg.style.setProperty("--py", clamp(p, -1, 1).toFixed(3));
      } });
    }
    var driftTicking = false;
    var runDrift = function () {
      driftTicking = false;
      if (reduceMotion.matches) return;
      drift.forEach(function (d) { if (d.on) d.move(d.box.getBoundingClientRect()); });
    };
    var driftWatch = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        drift.forEach(function (d) { if (d.box === entry.target) d.on = entry.isIntersecting; });
      });
      runDrift();
    });
    drift.forEach(function (d) { driftWatch.observe(d.box); });
    addEventListener("scroll", function () {
      if (!driftTicking) { driftTicking = true; requestAnimationFrame(runDrift); }
    }, { passive: true });
    reduceMotion.addEventListener("change", function () {
      drift.forEach(function (d) {
        if (d.box === ribbon) track.style.removeProperty("--rx");
        else parallaxBg.style.removeProperty("--py");
      });
      runDrift();
    });
  }

  // Курс: линия маршрута прорисовывается при прокрутке, точки загораются у разделов
  var journey = document.querySelector(".journey");
  var course = journey && journey.querySelector(".course");
  if (course) {
    var fill = course.querySelector(".course-fill");
    var points = [].slice.call(journey.querySelectorAll("[data-waypoint]")).map(function (section) {
      var dot = document.createElement("span");
      dot.className = "course-dot";
      course.appendChild(dot);
      return { section: section, dot: dot, y: 0, on: false };
    });
    var lastP = -1, courseTicking = false;
    var layoutCourse = function () {
      var top = journey.getBoundingClientRect().top + scrollY;
      points.forEach(function (pt) {
        pt.y = pt.section.getBoundingClientRect().top + scrollY - top + 8;
        pt.dot.style.top = pt.y + "px";
      });
    };
    var drawCourse = function () {
      courseTicking = false;
      var line = reduceMotion.matches ? Infinity : innerHeight * 0.6 - journey.getBoundingClientRect().top;
      var q = Math.round(clamp(line / journey.offsetHeight, 0, 1) * 500) / 500;
      if (q !== lastP) { lastP = q; fill.style.setProperty("--p", q); }
      points.forEach(function (pt) {
        var on = line >= pt.y;
        if (on !== pt.on) { pt.on = on; pt.dot.classList.toggle("on", on); }
      });
    };
    layoutCourse();
    drawCourse();
    addEventListener("scroll", function () {
      if (!courseTicking) { courseTicking = true; requestAnimationFrame(drawCourse); }
    }, { passive: true });
    addEventListener("resize", function () { layoutCourse(); drawCourse(); });
    addEventListener("load", function () { layoutCourse(); drawCourse(); });
    reduceMotion.addEventListener("change", drawCourse);
  }

  // Каталог
  var grid = document.getElementById("product-grid");
  if (!grid || !window.CATALOG) return;

  var catalog = window.CATALOG;
  var categoryExists = {};
  catalog.categories.forEach(function (c) { categoryExists[c.id] = true; });

  var params = new URLSearchParams(window.location.search);
  var state = {
    category: categoryExists[params.get("cat")] ? params.get("cat") : "",
    query: params.get("q") || ""
  };

  var chips = document.getElementById("catalog-chips");
  var search = document.getElementById("catalog-search");
  var count = document.getElementById("result-count");
  var empty = document.getElementById("catalog-empty");
  search.value = state.query;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function card(product) {
    var article = el("article", "product");
    var media = el("div", "product-media");
    if (product.photo) {
      var img = el("img", product.cover ? "is-photo" : "");
      img.src = product.photo;
      img.alt = product.alt;
      img.loading = "lazy";
      media.appendChild(img);
    } else {
      media.appendChild(el("span", "product-note", "Фото будет добавлено"));
    }
    var body = el("div", "product-body");
    body.appendChild(el("h3", "", product.name));
    body.appendChild(el("p", "", product.text));
    var button = el("button", "btn btn-secondary", "Запросить цену");
    button.type = "button";
    button.setAttribute("data-request", product.name);
    body.appendChild(button);
    article.appendChild(media);
    article.appendChild(body);
    return article;
  }

  function customCard() {
    var article = el("article", "product product--custom");
    var body = el("div", "product-body");
    body.appendChild(el("h3", "", "Нет нужной позиции?"));
    body.appendChild(el("p", "", "Найдём и привезём оборудование для судна."));
    var button = el("button", "btn btn-secondary", "Оставить заявку");
    button.type = "button";
    button.setAttribute("data-request", "");
    body.appendChild(button);
    article.appendChild(body);
    return article;
  }

  function pluralPositions(n) {
    var d10 = n % 10;
    var d100 = n % 100;
    if (d10 === 1 && d100 !== 11) return n + " позиция";
    if (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)) return n + " позиции";
    return n + " позиций";
  }

  function render() {
    var q = state.query.trim().toLowerCase();
    var items = catalog.products.filter(function (p) {
      if (state.category && p.category !== state.category) return false;
      if (!q) return true;
      return (p.name + " " + p.text + " " + (p.keywords || "")).toLowerCase().indexOf(q) !== -1;
    });

    grid.textContent = "";
    items.forEach(function (p) { grid.appendChild(card(p)); });
    if (items.length) grid.appendChild(customCard());
    grid.hidden = !items.length;
    empty.hidden = !!items.length;
    count.textContent = "Найдено: " + pluralPositions(items.length);

    chips.querySelectorAll(".chip").forEach(function (chip) {
      chip.setAttribute("aria-pressed", String(chip.getAttribute("data-cat") === state.category));
    });

    var next = new URLSearchParams();
    if (state.category) next.set("cat", state.category);
    if (state.query.trim()) next.set("q", state.query.trim());
    var qs = next.toString();
    try {
      history.replaceState(null, "", qs ? "?" + qs : window.location.pathname);
    } catch (e) {
      // При открытии файла напрямую браузер может запретить менять адрес.
    }
  }

  [{ id: "", name: "Все товары" }].concat(catalog.categories).forEach(function (c) {
    var chip = el("button", "chip", c.name);
    chip.type = "button";
    chip.setAttribute("data-cat", c.id);
    chip.addEventListener("click", function () {
      state.category = c.id;
      render();
    });
    chips.appendChild(chip);
  });

  search.addEventListener("input", function () {
    state.query = search.value;
    render();
  });

  document.getElementById("catalog-reset").addEventListener("click", function () {
    state.category = "";
    state.query = "";
    search.value = "";
    render();
    search.focus();
  });

  render();
})();
