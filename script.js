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

// ===== Cursor follower =====
const dot = document.getElementById('cursorDot');
if (dot && !window.matchMedia('(hover:none)').matches) {
  let x = 0, y = 0, cx = 0, cy = 0;
  window.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; dot.classList.add('show'); });
  document.addEventListener('mouseleave', () => dot.classList.remove('show'));
  document.querySelectorAll('a, button, .tgl-btn, .process-step').forEach(el => {
    el.addEventListener('mouseenter', () => dot.classList.add('big'));
    el.addEventListener('mouseleave', () => dot.classList.remove('big'));
  });
  (function loop() {
    cx += (x - cx) * 0.15;
    cy += (y - cy) * 0.15;
    dot.style.transform = `translate(${cx}px, ${cy}px)`;
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
