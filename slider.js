/* ==========================================================
   Image Slider (Carousel Banner)
   Data dibaca dari window.IMT_SLIDER (assets/slider/slides.js)
   Fitur: fade halus, panah, dots, swipe/drag, autoplay 4,5 detik,
          jeda saat hover/fokus/tab tidak aktif/di luar layar,
          navigasi keyboard, tanpa library tambahan.
   ========================================================== */
(function () {
    'use strict';

    var section = document.getElementById('slider-section');
    var mount = document.getElementById('slider');
    var cfg = window.IMT_SLIDER || {};
    var slides = Array.isArray(cfg.slides) ? cfg.slides.filter(function (s) { return s && s.src; }) : [];

    if (!section || !mount) return;
    if (!slides.length) { section.hidden = true; return; }

    var INTERVAL = Math.max(2000, Number(cfg.interval) || 4500);
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var multiple = slides.length > 1;

    /* ---------- util ---------- */
    function el(tag, className, attrs) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (attrs) Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
        return node;
    }

    // Hanya izinkan http(s), mailto, anchor, dan path relatif (cegah javascript:)
    function safeUrl(url) {
        url = String(url || '').trim();
        if (!url) return '';
        if (/^(https?:|mailto:|tel:|#|\/|\.\/|\.\.\/)/i.test(url)) return url;
        if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return '';
        return url;
    }

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    var arrowSvg = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';

    /* ---------- bangun DOM ---------- */
    mount.setAttribute('role', 'region');
    mount.setAttribute('aria-roledescription', 'carousel');
    mount.setAttribute('aria-label', 'Event highlights');
    mount.style.setProperty('--slider-interval', INTERVAL + 'ms');

    var viewport = el('div', 'slider-viewport');
    var track = el('div', 'slider-track', { 'aria-live': 'off' });
    var slideEls = [];
    var dotEls = [];

    slides.forEach(function (data, i) {
        var slide = el('div', 'slide', {
            role: 'group',
            'aria-roledescription': 'slide',
            'aria-label': (i + 1) + ' / ' + slides.length
        });

        var img = el('img', 'slide-img', {
            src: data.src,
            alt: data.alt || data.title || '',
            decoding: 'async',
            draggable: 'false'
        });
        img.loading = i === 0 ? 'eager' : 'lazy';
        if (i === 0) img.setAttribute('fetchpriority', 'high');
        if (data.position) slide.style.setProperty('--pos', String(data.position));
        img.addEventListener('error', function () { slide.classList.add('is-broken'); });

        // Mode "contain": poster/flyer tampil utuh dengan latar blur dari gambar yang sama
        if (data.fit === 'contain') {
            slide.classList.add('is-contain');
            var bg = el('div', 'slide-bg');
            bg.dataset.src = data.src;
            slide.appendChild(bg);
            if (data.zoom !== false) {
                img.classList.add('is-zoomable');
                img.addEventListener('click', function () { openLightbox(data); });
            }
        }
        slide.appendChild(img);

        var hasText = data.title || data.description || (data.buttonText && safeUrl(data.buttonUrl));
        if (hasText) {
            var caption = el('div', 'slide-caption');
            if (data.title) {
                var h = el('h3', 'slide-title');
                h.textContent = data.title;
                caption.appendChild(h);
            }
            if (data.description) {
                var p = el('p', 'slide-desc');
                p.textContent = data.description;
                caption.appendChild(p);
            }
            var href = safeUrl(data.buttonUrl);
            if (data.buttonText && href) {
                var a = el('a', 'slide-btn');
                a.href = href;
                if (/^https?:/i.test(href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
                var label = el('span');
                label.textContent = data.buttonText;
                a.appendChild(label);
                a.insertAdjacentHTML('beforeend', arrowSvg);
                caption.appendChild(a);
            }
            slide.appendChild(caption);
        }

        track.appendChild(slide);
        slideEls.push(slide);
    });
    viewport.appendChild(track);

    var counter, progress, prevBtn, nextBtn, dotsWrap;

    if (multiple) {
        prevBtn = el('button', 'slider-arrow slider-prev', { type: 'button', 'aria-label': 'Previous slide' });
        prevBtn.innerHTML = arrowSvg;
        nextBtn = el('button', 'slider-arrow slider-next', { type: 'button', 'aria-label': 'Next slide' });
        nextBtn.innerHTML = arrowSvg;

        var controls = el('div', 'slider-controls');
        counter = el('span', 'slider-counter', { 'aria-hidden': 'true' });
        dotsWrap = el('div', 'slider-dots', { role: 'group', 'aria-label': 'Choose slide' });
        slides.forEach(function (_, i) {
            var dot = el('button', 'slider-dot', { type: 'button', 'aria-label': 'Go to slide ' + (i + 1) });
            dot.addEventListener('click', function () { go(i, true); });
            dotsWrap.appendChild(dot);
            dotEls.push(dot);
        });
        controls.appendChild(counter);
        controls.appendChild(dotsWrap);

        progress = el('div', 'slider-progress', { 'aria-hidden': 'true' });
        progress.appendChild(el('span', 'slider-progress-bar'));

        viewport.appendChild(prevBtn);
        viewport.appendChild(nextBtn);
        viewport.appendChild(controls);
        viewport.appendChild(progress);
    }
    mount.appendChild(viewport);

    /* ---------- lightbox (perbesar poster) ---------- */
    var lb = null, lbImg = null, lbClose = null, lastFocus = null;

    function buildLightbox() {
        lb = el('div', 'slider-lightbox', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Enlarged image' });
        lb.hidden = true;
        lbImg = el('img', 'slider-lightbox-img', { alt: '' });
        lbClose = el('button', 'slider-lightbox-close', { type: 'button', 'aria-label': 'Close' });
        lbClose.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg>';
        lb.appendChild(lbImg);
        lb.appendChild(lbClose);
        lb.addEventListener('click', function (e) { if (e.target !== lbImg) closeLightbox(); });
        lbClose.addEventListener('click', closeLightbox);
        document.addEventListener('keydown', function (e) {
            if (lb.hidden) return;
            if (e.key === 'Escape') closeLightbox();
            else if (e.key === 'Tab') { e.preventDefault(); lbClose.focus(); }
        });
        document.body.appendChild(lb);
    }

    function openLightbox(data) {
        if (!lb) buildLightbox();
        lastFocus = document.activeElement;
        lbImg.src = data.src;
        lbImg.alt = data.alt || data.title || '';
        lb.hidden = false;
        document.body.classList.add('slider-lightbox-open');
        holds.lightbox = true;
        sync();
        lbClose.focus();
    }

    function closeLightbox() {
        if (!lb || lb.hidden) return;
        lb.hidden = true;
        document.body.classList.remove('slider-lightbox-open');
        holds.lightbox = false;
        if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (_) {} }
        sync();
    }

    /* ---------- state & navigasi ---------- */
    var index = 0;
    var timer = null;
    var remaining = INTERVAL;
    var startedAt = 0;
    var holds = { hover: false, focus: false, hidden: document.hidden, offscreen: false, drag: false, lightbox: false };

    function isHeld() {
        return holds.hover || holds.focus || holds.hidden || holds.offscreen || holds.drag || holds.lightbox || reduceMotion;
    }

    function render() {
        slideEls.forEach(function (s, i) {
            var active = i === index;
            s.classList.toggle('is-active', active);
            s.setAttribute('aria-hidden', active ? 'false' : 'true');
            // elemen interaktif di slide non-aktif tidak bisa difokus
            Array.prototype.forEach.call(s.querySelectorAll('a'), function (a) {
                a.tabIndex = active ? 0 : -1;
            });
        });
        if (multiple) {
            dotEls.forEach(function (d, i) {
                if (i === index) d.setAttribute('aria-current', 'true');
                else d.removeAttribute('aria-current');
            });
            counter.textContent = pad(index + 1) + ' / ' + pad(slides.length);
        }
        // pra-muat gambar berikutnya agar transisi mulus
        var nextSlide = slideEls[(index + 1) % slideEls.length];
        var next = nextSlide.querySelector('img');
        if (next && next.loading === 'lazy') next.loading = 'eager';
        // latar blur dimuat hanya untuk slide aktif dan berikutnya (hemat data)
        [slideEls[index], nextSlide].forEach(function (sl) {
            var bg = sl.querySelector('.slide-bg');
            if (bg && !bg.style.backgroundImage) bg.style.backgroundImage = 'url("' + bg.dataset.src.replace(/"/g, '%22') + '")';
        });
    }

    function restartProgress() {
        if (!multiple) return;
        var bar = progress.firstChild;
        bar.style.animation = 'none';
        void bar.offsetWidth; // reflow agar animasi mulai ulang
        bar.style.animation = '';
    }

    function clearTimer() {
        if (timer) { clearTimeout(timer); timer = null; }
    }

    function schedule(ms) {
        clearTimer();
        if (!multiple || reduceMotion) return;
        remaining = ms;
        startedAt = Date.now();
        timer = setTimeout(function () { go(index + 1, false); }, ms);
    }

    function pause() {
        if (!timer) { mount.classList.add('is-paused'); return; }
        remaining = Math.max(300, remaining - (Date.now() - startedAt));
        clearTimer();
        mount.classList.add('is-paused');
    }

    function resume() {
        if (isHeld()) return;
        mount.classList.remove('is-paused');
        if (!timer) schedule(remaining);
    }

    function go(i, byUser) {
        index = (i + slides.length) % slides.length;
        render();
        restartProgress();
        remaining = INTERVAL;
        clearTimer();
        if (!isHeld()) {
            mount.classList.remove('is-paused');
            schedule(INTERVAL);
        } else {
            mount.classList.add('is-paused');
        }
        if (byUser) track.setAttribute('aria-live', 'polite');
    }

    function sync() { isHeld() ? pause() : resume(); }

    if (multiple) {
        prevBtn.addEventListener('click', function () { go(index - 1, true); });
        nextBtn.addEventListener('click', function () { go(index + 1, true); });

        // Jeda saat kursor di atas slider / fokus di dalam slider
        mount.addEventListener('mouseenter', function () { holds.hover = true; sync(); });
        mount.addEventListener('mouseleave', function () { holds.hover = false; sync(); });
        // Jeda karena fokus hanya untuk pengguna keyboard (klik mouse tidak menghentikan autoplay)
        mount.addEventListener('focusin', function (e) {
            var kb = true;
            try { kb = e.target.matches(':focus-visible'); } catch (_) {}
            if (kb) { holds.focus = true; sync(); }
        });
        mount.addEventListener('focusout', function (e) {
            if (!mount.contains(e.relatedTarget)) { holds.focus = false; sync(); }
        });

        // Jeda saat tab tidak aktif atau slider di luar layar
        document.addEventListener('visibilitychange', function () { holds.hidden = document.hidden; sync(); });
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                holds.offscreen = !entries[0].isIntersecting;
                sync();
            }, { threshold: 0.25 }).observe(mount);
        }

        // Keyboard: panah kiri/kanan saat fokus di slider
        mount.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') { go(index - 1, true); e.preventDefault(); }
            else if (e.key === 'ArrowRight') { go(index + 1, true); e.preventDefault(); }
        });

        // Swipe / drag (sentuh, mouse, pen)
        var sx = 0, sy = 0, dragging = false, moved = false;
        viewport.addEventListener('pointerdown', function (e) {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            if (e.target.closest('.slider-arrow, .slider-dot')) return;
            dragging = true; moved = false; sx = e.clientX; sy = e.clientY;
            holds.drag = true; sync();
        });
        window.addEventListener('pointermove', function (e) {
            if (!dragging) return;
            if (Math.abs(e.clientX - sx) > 8) moved = true;
        });
        function endDrag(e, cancelled) {
            if (!dragging) return;
            dragging = false;
            holds.drag = false;
            var dx = e.clientX - sx, dy = e.clientY - sy;
            if (!cancelled && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
                go(dx < 0 ? index + 1 : index - 1, true);
            } else {
                sync();
            }
        }
        window.addEventListener('pointerup', function (e) { endDrag(e, false); });
        window.addEventListener('pointercancel', function (e) { endDrag(e, true); });
        // Cegah klik tombol/link tak sengaja setelah menggeser
        viewport.addEventListener('click', function (e) {
            if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
        }, true);
    }

    /* ---------- mulai ---------- */
    render();
    mount.classList.add('is-ready');
    if (multiple) {
        restartProgress();
        if (reduceMotion) mount.classList.add('is-paused');
        else schedule(INTERVAL);
    }
})();
