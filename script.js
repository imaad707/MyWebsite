// ===== NAV scroll state =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
  document.getElementById('toTop').classList.toggle('show', window.scrollY > 600);
});

// ===== Mobile menu =====
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => {
  burger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('active');
    mobileMenu.classList.remove('open');
  });
});

// ===== Recent Work toggle (Shorts / Videos) =====
const tglBtns = document.querySelectorAll('.tgl-btn');
tglBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tglBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.target;
    document.querySelectorAll('.video-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + target).classList.add('active');
  });
});

// ===== Back to top =====
document.getElementById('toTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== Scroll reveal =====
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// ===== Smooth anchor scroll w/ offset for fixed nav =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (id.length > 1) {
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const offset = target.getBoundingClientRect().top + window.scrollY - 78;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    }
  });
});

// ===== Cursor follower (liquid) =====
const dot = document.getElementById('cursorDot');
if (dot && !window.matchMedia('(hover:none)').matches) {
  const HOVER_SEL = 'h1, h2, h3, h4, h5, h6, p, span, li, a, button, label, strong, em, small, blockquote, .tgl-btn, .stat-num, .stat-label, .marquee-item';
  const HOVER_SCALE = 2.4;
  let mx = 0, my = 0, x = 0, y = 0, px = 0, py = 0;
  let scale = 1, scaleV = 0, target = 1, angle = 0, stretch = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (!dot.classList.contains('show')) { x = px = mx; y = py = my; }
    dot.classList.add('show');
  });
  document.addEventListener('mouseleave', () => dot.classList.remove('show'));
  document.addEventListener('mouseover', e => {
    const on = !!(e.target.closest && e.target.closest(HOVER_SEL));
    dot.classList.toggle('big', on);
    target = on ? HOVER_SCALE : 1;
  });

  (function loop() {
    // smooth follow
    x += (mx - x) * 0.14;
    y += (my - y) * 0.14;
    // velocity -> stretch along the direction of movement (liquid feel)
    const vx = x - px, vy = y - py;
    px = x; py = y;
    const speed = Math.hypot(vx, vy);
    if (speed > 0.3) angle = Math.atan2(vy, vx);
    stretch += (Math.min(speed * 0.045, 0.55) - stretch) * 0.2;
    // springy scale (slight overshoot, then settles)
    scaleV += (target - scale) * 0.12;
    scaleV *= 0.78;
    scale += scaleV;
    const sx = scale * (1 + stretch);
    const sy = scale * (1 - stretch * 0.5);
    dot.style.transform = `translate(${x}px, ${y}px) rotate(${angle}rad) scale(${sx}, ${sy})`;
    requestAnimationFrame(loop);
  })();
}

// ===== Only one video plays at a time =====
(function () {
  const frames = [...document.querySelectorAll('iframe[src*="youtube.com/embed"]')];
  if (!frames.length) return;

  frames.forEach(f => {
    const u = new URL(f.src);
    u.searchParams.set('enablejsapi', '1');
    f.src = u.toString();
  });

  const players = [];
  window.onYouTubeIframeAPIReady = () => {
    frames.forEach(f => {
      const p = new YT.Player(f, {
        events: {
          onStateChange: e => {
            if (e.data === YT.PlayerState.PLAYING) {
              players.forEach(o => {
                if (o !== p && o.getPlayerState && o.getPlayerState() === YT.PlayerState.PLAYING) {
                  o.pauseVideo();
                }
              });
            }
          }
        }
      });
      players.push(p);
    });
  };

  document.querySelectorAll('.tgl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      players.forEach(o => o.pauseVideo && o.pauseVideo());
    });
  });

  const s = document.createElement('script');
  s.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(s);
})();

// ===== Sleepy editor mascot: hover wakes him up, drag to move =====
(function () {
  const box = document.getElementById('sleepyEditor');
  if (!box) return;
  let sleepTimer = null, dragging = false, sx = 0, sy = 0, bx = 0, by = 0;

  function wake() {
    clearTimeout(sleepTimer);
    box.classList.remove('sleeping');
    box.classList.add('awake');
  }
  function sleepSoon(ms) {
    clearTimeout(sleepTimer);
    sleepTimer = setTimeout(() => {
      if (dragging) return;
      box.classList.remove('awake');
      box.classList.add('sleeping');
    }, ms);
  }
  function clamp() {
    const r = box.getBoundingClientRect();
    const nx = Math.max(4, Math.min(window.innerWidth - r.width - 4, r.left));
    const ny = Math.max(4, Math.min(window.innerHeight - r.height - 4, r.top));
    box.style.left = nx + 'px'; box.style.top = ny + 'px';
    box.style.right = 'auto'; box.style.bottom = 'auto';
  }

  box.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') wake(); });
  box.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !dragging) sleepSoon(900); });

  box.addEventListener('pointerdown', e => {
    dragging = true;
    wake();
    box.classList.add('dragging');
    const r = box.getBoundingClientRect();
    bx = r.left; by = r.top; sx = e.clientX; sy = e.clientY;
    box.setPointerCapture(e.pointerId);
  });
  box.addEventListener('pointermove', e => {
    if (!dragging) return;
    const w = box.offsetWidth, h = box.offsetHeight;
    const nx = Math.max(4, Math.min(window.innerWidth - w - 4, bx + e.clientX - sx));
    const ny = Math.max(4, Math.min(window.innerHeight - h - 4, by + e.clientY - sy));
    box.style.left = nx + 'px'; box.style.top = ny + 'px';
    box.style.right = 'auto'; box.style.bottom = 'auto';
  });
  function end(e) {
    if (!dragging) return;
    dragging = false;
    box.classList.remove('dragging');
    if (e.pointerType !== 'mouse') sleepSoon(4000);
    else if (!box.matches(':hover')) sleepSoon(900);
  }
  box.addEventListener('pointerup', end);
  box.addEventListener('pointercancel', end);
  window.addEventListener('resize', () => { if (box.style.top) clamp(); });
})();

// ===== Book a call modal =====
(function () {
  const modal = document.getElementById('bookModal');
  if (!modal) return;
  const msg = document.getElementById('bookMsg');
  const DEFAULT_MSG = msg.value;
  const WHATSAPP_NUMBER = '8801676289444';               // country code + number, no + or leading 0
  const MESSENGER_URL = 'https://m.me/imad.chowdhury.79';
  const INSTAGRAM_URL = 'https://ig.me/m/e_madcreations';
  let lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    // close the mobile menu if it is open
    const bg = document.getElementById('burger'), mm = document.getElementById('mobileMenu');
    if (bg) bg.classList.remove('active');
    if (mm) mm.classList.remove('open');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setTimeout(() => msg.focus(), 80);
  }
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.querySelectorAll('[data-book-call]').forEach(b =>
    b.addEventListener('click', e => { e.preventDefault(); openModal(); }));
  modal.addEventListener('click', e => {
    if (e.target === modal || e.target.closest('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text); return; }
    } catch (_) {}
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (_) {}
    ta.remove();
  }

  modal.querySelectorAll('[data-send]').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = msg.value.trim() || DEFAULT_MSG;
      const kind = btn.dataset.send;
      if (kind === 'whatsapp') {
        window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
        return;
      }
      copyText(text);                                     // Messenger / Instagram can't prefill, so copy it
      window.open(kind === 'messenger' ? MESSENGER_URL : INSTAGRAM_URL, '_blank', 'noopener');
      const label = btn.textContent;
      btn.textContent = 'Message copied — paste it & send';
      setTimeout(() => { btn.textContent = label; }, 2600);
    });
  });
})();

// ===== Shorts: arrow buttons scroll the row =====
(function () {
  const grid = document.getElementById('shortsGrid');
  const scroller = document.getElementById('shortsScroller');
  if (!grid || !scroller) return;
  const left = scroller.querySelector('.scroll-arrow.left');
  const right = scroller.querySelector('.scroll-arrow.right');

  function update() {
    const max = grid.scrollWidth - grid.clientWidth - 2;
    left.classList.toggle('is-hidden', grid.scrollLeft <= 2);
    right.classList.toggle('is-hidden', grid.scrollLeft >= max);
  }
  scroller.querySelectorAll('.scroll-arrow').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = Math.max(grid.clientWidth * 0.8, 260);
      grid.scrollBy({ left: step * Number(btn.dataset.dir), behavior: 'smooth' });
    });
  });
  grid.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  document.querySelectorAll('.tgl-btn').forEach(b => b.addEventListener('click', () => setTimeout(update, 60)));
  window.addEventListener('load', update);
  update();
})();
