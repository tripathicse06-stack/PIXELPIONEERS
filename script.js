/* =========================================================
   BrickByte 2026 - interactivity
   Plain JavaScript, no libraries.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Config ---------- */
  // Hacking begins 12 Dec 2026, 11:00 IST (matches the schedule; check-in opens at 09:00)
  var EVENT_START = new Date('2026-12-12T11:00:00+05:30');
  // Registration closes 5 Dec 2026, 23:59 IST
  var REG_CLOSE = new Date('2026-12-05T23:59:00+05:30');

  function pad(n) { return String(n).padStart(2, '0'); }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear() < 2026 ? 2026 : new Date().getFullYear(); }

  /* ---------- Gentle reveal on scroll ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealEls = document.querySelectorAll('.section-head, .quote, .card, .sponsor, .timeline li, .faq details, .form-card, .cta-copy, .fact, .perk, .perks-title');
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(revealEls, function (el, i) {
      el.classList.add('reveal');
      el.style.setProperty('--d', ((i % 4) * 70) + 'ms');
      revealObserver.observe(el);
    });
  }

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  function setMenu(open) {
    if (!toggle || !nav) { return; }
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { setMenu(false); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 920) { setMenu(false); }
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  if ('IntersectionObserver' in window && navLinks.length) {
    var map = {};
    navLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && map[entry.target.id]) {
          navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
          map[entry.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) { observer.observe(section); }
    });
  }

  /* ---------- Countdown ---------- */
  var cdDays = document.getElementById('cd-days');
  var cdHours = document.getElementById('cd-hours');
  var cdMins = document.getElementById('cd-mins');
  var cdSecs = document.getElementById('cd-secs');
  var cdLabel = document.getElementById('countdown-label');
  var ctaDays = document.getElementById('cta-days');

  function tick() {
    var now = new Date();
    var diff = EVENT_START - now;

    if (diff <= 0) {
      cdDays.textContent = cdHours.textContent = cdMins.textContent = cdSecs.textContent = '00';
      if (cdLabel) { cdLabel.textContent = 'BrickByte 2026 is live!'; }
      if (ctaDays) { ctaDays.textContent = 'The event has started. Follow the schedule above.'; }
      return false;
    }

    var totalSecs = Math.floor(diff / 1000);
    var days = Math.floor(totalSecs / 86400);
    var hours = Math.floor((totalSecs % 86400) / 3600);
    var mins = Math.floor((totalSecs % 3600) / 60);
    var secs = totalSecs % 60;

    cdDays.textContent = pad(days);
    cdHours.textContent = pad(hours);
    cdMins.textContent = pad(mins);
    cdSecs.textContent = pad(secs);

    if (ctaDays) {
      var regDiff = REG_CLOSE - now;
      if (regDiff > 0) {
        var regDays = Math.ceil(regDiff / 86400000);
        ctaDays.textContent = regDays + (regDays === 1 ? ' day' : ' days') + ' left to register';
      } else {
        ctaDays.textContent = 'Registration has closed. See you at the event!';
      }
    }
    var heroDays = document.getElementById('hero-days');
    if (heroDays) {
      var rd = REG_CLOSE - now;
      if (rd > 0) {
        var n = Math.ceil(rd / 86400000);
        heroDays.textContent = 'Registration closes in ' + n + (n === 1 ? ' day' : ' days');
      } else {
        heroDays.textContent = 'Registration closed';
      }
    }
    return true;
  }

  if (cdDays && cdHours && cdMins && cdSecs) {
    if (tick()) {
      var timer = setInterval(function () {
        if (!tick()) { clearInterval(timer); }
      }, 1000);
    }
  }

  /* ---------- Filters (schedule by day, tracks by tag) ---------- */
  // Each .filters group names its target container (data-target) and the
  // attribute to match on its children (data-attr). Tokens are space-separated.
  Array.prototype.forEach.call(document.querySelectorAll('.filters[data-target]'), function (group) {
    var container = document.getElementById(group.getAttribute('data-target'));
    var attr = group.getAttribute('data-attr');
    var statusEl2 = document.getElementById(group.getAttribute('data-status') || '');
    var btns = Array.prototype.slice.call(group.querySelectorAll('.filter-btn'));
    if (!container || !attr) { return; }
    var children = Array.prototype.slice.call(container.children);

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');
        btns.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        var shown = 0;
        children.forEach(function (el) {
          var tokens = ' ' + (el.getAttribute(attr) || '') + ' ';
          var match = filter === 'all' || tokens.indexOf(' ' + filter + ' ') > -1;
          el.hidden = !match;
          if (match) { shown += 1; }
        });
        if (statusEl2) {
          statusEl2.textContent = filter === 'all'
            ? 'Showing all ' + children.length + ' tracks'
            : 'Showing ' + shown + ' of ' + children.length + ' tracks';
        }
      });
    });
  });

  /* ---------- FAQ: keep one answer open at a time ---------- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq details'));
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        faqItems.forEach(function (other) { if (other !== item) { other.open = false; } });
      }
    });
  });

  /* ---------- Registration form (demo, front-end validation only) ---------- */
  var form = document.getElementById('register-form');
  var statusEl = document.getElementById('form-status');

  var rules = {
    fullName: function (el) {
      return el.value.trim().length >= 2 ? '' : 'Please enter your full name (at least 2 characters).';
    },
    email: function (el) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim()) ? '' : 'Enter a valid email address, like name@example.com.';
    },
    college: function (el) {
      return el.value.trim().length >= 2 ? '' : 'Please enter your college or organisation.';
    },
    teamSize: function (el) {
      return el.value ? '' : 'Select your team size.';
    },
    track: function (el) {
      return el.value ? '' : 'Choose a preferred track.';
    },
    agree: function (el) {
      return el.checked ? '' : 'Please accept the code of conduct to continue.';
    }
  };

  function validateField(el) {
    var rule = rules[el.name];
    if (!rule) { return true; }
    var message = rule(el);
    var errEl = document.getElementById('err-' + el.id);
    if (errEl) { errEl.textContent = message; }
    if (message) { el.setAttribute('aria-invalid', 'true'); }
    else { el.removeAttribute('aria-invalid'); }
    return !message;
  }

  if (form) {
    var fields = Array.prototype.slice.call(form.elements).filter(function (el) { return rules[el.name]; });

    fields.forEach(function (el) {
      el.addEventListener('blur', function () { validateField(el); });
      el.addEventListener('input', function () {
        if (el.getAttribute('aria-invalid') === 'true') { validateField(el); }
      });
      el.addEventListener('change', function () {
        if (el.getAttribute('aria-invalid') === 'true') { validateField(el); }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      statusEl.className = 'form-status';
      statusEl.textContent = '';

      var firstInvalid = null;
      fields.forEach(function (el) {
        if (!validateField(el) && !firstInvalid) { firstInvalid = el; }
      });

      if (firstInvalid) {
        firstInvalid.focus();
        statusEl.textContent = 'Please fix the highlighted fields and try again.';
        return;
      }

      // Demo only: no data leaves the browser.
      var name = form.elements.fullName.value.trim().split(' ')[0];
      form.reset();
      fields.forEach(function (el) { el.removeAttribute('aria-invalid'); });
      statusEl.className = 'form-status is-success';
      statusEl.textContent = 'Thanks, ' + name + '! This is a demo form, so no data was sent. In the real event, you would receive a confirmation email.';
    });
  }

  /* ---------- Track cards: cursor-following glow ---------- */
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reduceMotion) {
    Array.prototype.forEach.call(document.querySelectorAll('.track'), function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', '0%');
      });
    });
  }

  /* ---------- Hero: rotating "Build for ___" word ---------- */
  var rotor = document.getElementById('rotor');
  if (rotor && !reduceMotion) {
    var words = ['Bharat', 'Campus', 'Farmers', 'Health', 'Everyone'];
    var wi = 0;
    setInterval(function () {
      if (document.hidden) { return; }
      rotor.classList.add('is-out');
      setTimeout(function () {
        wi = (wi + 1) % words.length;
        rotor.textContent = words[wi];
        rotor.classList.remove('is-out');
      }, 230);
    }, 2400);
  }

  /* ---------- Hero: mouse parallax ---------- */
  var heroEl = document.querySelector('.hero');
  if (heroEl && !reduceMotion && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    heroEl.addEventListener('mousemove', function (e) {
      var r = heroEl.getBoundingClientRect();
      heroEl.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      heroEl.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    });
    heroEl.addEventListener('mouseleave', function () {
      heroEl.style.setProperty('--px', '0');
      heroEl.style.setProperty('--py', '0');
    });
  }
})();
