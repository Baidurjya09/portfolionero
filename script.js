/* ═══════════════════════════════════════════════════════════
   NERO PORTFOLIO — script.js
   Loader · Custom Cursor · Canvas BG · Scroll Reveals
   Marquee · Counters · Nav · Contact Form
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── LOADER ─────────────────────────────────────────────────── */
(function initLoader() {
  const loader = document.getElementById('loader');
  const progress = document.getElementById('loaderProgress');
  const count = document.getElementById('loaderCount');
  const body = document.body;

  body.classList.add('loading');

  let pct = 0;
  const step = () => {
    const jump = Math.random() * 12 + 4;
    pct = Math.min(pct + jump, 100);
    progress.style.width = pct + '%';
    count.textContent = Math.floor(pct);

    if (pct < 100) {
      setTimeout(step, Math.random() * 80 + 40);
    } else {
      progress.style.width = '100%';
      count.textContent = '100';
      setTimeout(() => {
        loader.classList.add('hidden');
        body.classList.remove('loading');
        // trigger initial reveals
        handleReveal();
        animateHeroTitle();
      }, 500);
    }
  };

  // small delay so fonts load
  setTimeout(step, 300);
})();

/* ─── HERO TITLE ANIMATION ───────────────────────────────────── */
function animateHeroTitle() {
  const lines = document.querySelectorAll('.hero-title .line');
  lines.forEach((line, i) => {
    line.style.opacity = '0';
    line.style.transform = 'translateY(40px)';
    line.style.transition = `opacity 1s ${0.1 + i * 0.15}s cubic-bezier(0.16,1,0.3,1), transform 1s ${0.1 + i * 0.15}s cubic-bezier(0.16,1,0.3,1)`;
    requestAnimationFrame(() => {
      line.style.opacity = '1';
      line.style.transform = 'translateY(0)';
    });
  });

  const sub = document.querySelector('.hero-sub');
  const actions = document.querySelector('.hero-actions');
  [sub, actions].forEach((el, i) => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.9s ${0.5 + i * 0.15}s cubic-bezier(0.16,1,0.3,1), transform 0.9s ${0.5 + i * 0.15}s cubic-bezier(0.16,1,0.3,1)`;
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  });
}

/* ─── CUSTOM CURSOR ──────────────────────────────────────────── */
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  let mx = -100, my = -100;
  let fx = -100, fy = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  // follower uses lerp
  function loop() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    requestAnimationFrame(loop);
  }
  loop();

  // hover effects
  const hoverEls = document.querySelectorAll('a, button, [role="button"], select, input, textarea');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovering');
      follower.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovering');
      follower.classList.remove('hovering');
    });
  });

  // hide on leave
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    follower.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    follower.style.opacity = '1';
  });
})();

/* ─── HERO CANVAS — particle field ──────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -1000, y: -1000 };

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // track mouse for subtle repulsion
  canvas.parentElement.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x = Math.random() * (W || 1400);
      this.y = initial ? Math.random() * (H || 900) : H + 10;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(Math.random() * 0.5 + 0.1);
      this.size = Math.random() * 1.5 + 0.3;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.life = 0;
      this.maxLife = Math.random() * 400 + 200;
    }
    update() {
      // subtle mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120 * 0.5;
        this.vx += (dx / dist) * force * 0.05;
        this.vy += (dy / dist) * force * 0.05;
      }
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }
    draw() {
      const progress = this.life / this.maxLife;
      const fade = progress < 0.1 ? progress / 0.1 : progress > 0.8 ? 1 - (progress - 0.8) / 0.2 : 1;
      ctx.save();
      ctx.globalAlpha = this.alpha * fade;
      ctx.fillStyle = '#ff590d';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // init particles
  const COUNT = window.innerWidth < 768 ? 60 : 130;
  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  // grid lines
  function drawGrid() {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 1;
    const cols = 8, rows = 6;
    for (let i = 1; i < cols; i++) {
      ctx.beginPath();
      ctx.moveTo((W / cols) * i, 0);
      ctx.lineTo((W / cols) * i, H);
      ctx.stroke();
    }
    for (let i = 1; i < rows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (H / rows) * i);
      ctx.lineTo(W, (H / rows) * i);
      ctx.stroke();
    }
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(tick);
  }
  tick();
})();

/* ─── NAVIGATION ─────────────────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeLinks = document.querySelectorAll('[data-menu-close]');

  // scroll class
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // burger toggle
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('active');
    mobileMenu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  closeLinks.forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

/* ─── SCROLL REVEALS ─────────────────────────────────────────── */
function handleReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = (i % 3) * 0.1 + 's';
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(el => io.observe(el));
}
document.addEventListener('DOMContentLoaded', handleReveal);

/* ─── PROJECT CARD STACK (3D FAN) ────────────────────────────── */
(function initCardStack() {
  const projects = [
    {
      id: 1,
      title: 'RJB Realtors',
      description: 'Centauri Dharapur — A luxury residential complex in Assam with RERA compliance.',
      imageSrc: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
      href: 'https://rjbrealtors.in',
      tag: 'Real Estate'
    },
    {
      id: 2,
      title: 'ARJB Farms',
      description: 'A premium agri-brand digital presence communicating trust and sustainability.',
      imageSrc: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80',
      href: 'https://arjbfarms.in',
      tag: 'Agriculture'
    },
    {
      id: 3,
      title: 'KDS Creations',
      description: 'Museum-quality 3D photo frames with immersive product showcases.',
      imageSrc: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&q=80',
      href: 'https://kdscreation.com',
      tag: 'E-Commerce'
    },
    {
      id: 4,
      title: 'NERO Studio',
      description: 'Our own digital home — An immersive studio website in active development.',
      imageSrc: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      href: 'https://nerot90.com',
      tag: 'Featured'
    },
    {
      id: 5,
      title: 'FMV Markup',
      description: 'Pixel-perfect HTML/CSS implementation demonstrating strong development fundamentals.',
      imageSrc: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80',
      href: 'https://fmv-mkup1.netlify.app',
      tag: 'UI Markup'
    },
    {
      id: 6,
      title: 'STP Markup',
      description: 'Clean, structured UI implementation with meticulous attention to detail.',
      imageSrc: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
      href: 'https://stp-1.netlify.app',
      tag: 'Frontend'
    },
    {
      id: 7,
      title: 'TW Markup',
      description: 'Tailwind CSS-powered build with sharp eye for spacing and typography.',
      imageSrc: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
      href: 'https://tw-mkup.netlify.app',
      tag: 'TailwindCSS'
    }
  ];

  const stage = document.getElementById('cardStackStage');
  const navigation = document.getElementById('stackNavigation');
  if (!stage || !navigation) return;

  let activeIndex = 0;
  let dragStartX = 0;
  let isDragging = false;
  let autoplayInterval = null;

  const settings = {
    maxVisible: 7,
    cardWidth: 520,
    cardHeight: 320,
    overlap: 0.48,
    spreadDeg: 48,
    depthPx: 140,
    tiltXDeg: 12,
    activeLiftPx: 22,
    activeScale: 1.03,
    inactiveScale: 0.94,
    autoAdvance: true,
    intervalMs: 3000,
    loop: true
  };

  // Responsive adjustments
  function updateSettings() {
    if (window.innerWidth <= 480) {
      settings.cardWidth = 280;
      settings.cardHeight = 200;
      settings.depthPx = 80;
      settings.spreadDeg = 40;
    } else if (window.innerWidth <= 768) {
      settings.cardWidth = 340;
      settings.cardHeight = 240;
      settings.depthPx = 100;
      settings.spreadDeg = 44;
    } else if (window.innerWidth <= 1100) {
      settings.cardWidth = 450;
      settings.cardHeight = 280;
      settings.depthPx = 120;
    } else {
      settings.cardWidth = 520;
      settings.cardHeight = 320;
      settings.depthPx = 140;
      settings.spreadDeg = 48;
    }
  }

  updateSettings();
  window.addEventListener('resize', () => {
    updateSettings();
    render();
  });

  function signedOffset(i, active, len, loop) {
    const raw = i - active;
    if (!loop || len <= 1) return raw;
    const alt = raw > 0 ? raw - len : raw + len;
    return Math.abs(alt) < Math.abs(raw) ? alt : raw;
  }

  function createCard(project, index) {
    const card = document.createElement('div');
    card.className = 'stack-card';
    card.dataset.index = index;

    const inner = document.createElement('div');
    inner.className = 'stack-card-inner';

    const content = document.createElement('div');
    content.className = 'stack-card-content';

    const img = document.createElement('img');
    img.src = project.imageSrc;
    img.alt = project.title;
    img.className = 'stack-card-image';
    img.loading = 'lazy';

    const gradient = document.createElement('div');
    gradient.className = 'stack-card-gradient';

    const text = document.createElement('div');
    text.className = 'stack-card-text';

    const title = document.createElement('div');
    title.className = 'stack-card-title';
    title.textContent = project.title;

    const desc = document.createElement('div');
    desc.className = 'stack-card-desc';
    desc.textContent = project.description;

    text.appendChild(title);
    text.appendChild(desc);

    if (project.tag) {
      const tag = document.createElement('div');
      tag.className = 'stack-card-tag';
      tag.textContent = project.tag;
      content.appendChild(tag);
    }

    content.appendChild(img);
    content.appendChild(gradient);
    content.appendChild(text);
    inner.appendChild(content);
    card.appendChild(inner);

    // Click handler
    card.addEventListener('click', () => {
      if (isDragging) return;
      setActive(index);
    });

    // Drag handlers for active card
    let startX = 0;
    let currentX = 0;

    const onMouseDown = (e) => {
      if (index !== activeIndex) return;
      isDragging = false;
      startX = e.clientX || e.touches?.[0]?.clientX || 0;
      dragStartX = startX;
      currentX = 0;
      card.style.cursor = 'grabbing';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.addEventListener('touchmove', onMouseMove);
      document.addEventListener('touchend', onMouseUp);
    };

    const onMouseMove = (e) => {
      const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
      currentX = clientX - startX;
      if (Math.abs(currentX) > 5) isDragging = true;
      const rotateY = (currentX / settings.cardWidth) * 15;
      const currentTransform = card.style.transform.replace(/rotateY\([^)]+\)/g, '').trim();
      card.style.transform = `${currentTransform} rotateY(${rotateY}deg)`;
      card.style.transition = 'none'; // Disable transition during drag
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onMouseMove);
      document.removeEventListener('touchend', onMouseUp);
      card.style.cursor = 'grab';
      card.style.transition = ''; // Re-enable transition

      const threshold = settings.cardWidth * 0.22;
      if (currentX > threshold) {
        prev();
      } else if (currentX < -threshold) {
        next();
      } else {
        // Snap back if not enough distance
        render();
      }

      setTimeout(() => {
        isDragging = false;
      }, 100);
    };

    card.addEventListener('mousedown', onMouseDown);
    card.addEventListener('touchstart', onMouseDown);

    return card;
  }

  function render() {
    stage.innerHTML = '';
    const maxOffset = Math.max(0, Math.floor(settings.maxVisible / 2));
    const cardSpacing = Math.max(10, Math.round(settings.cardWidth * (1 - settings.overlap)));
    const stepDeg = maxOffset > 0 ? settings.spreadDeg / maxOffset : 0;

    projects.forEach((project, i) => {
      const offset = signedOffset(i, activeIndex, projects.length, settings.loop);
      const absOffset = Math.abs(offset);
      const visible = absOffset <= maxOffset;

      if (!visible) return;

      const card = createCard(project, i);
      const isActive = offset === 0;

      const rotateZ = offset * stepDeg;
      const x = offset * cardSpacing;
      const y = absOffset * 10;
      const z = -absOffset * settings.depthPx;
      const scale = isActive ? settings.activeScale : settings.inactiveScale;
      const lift = isActive ? -settings.activeLiftPx : 0;
      const rotateX = isActive ? 0 : settings.tiltXDeg;
      const zIndex = 100 - absOffset;

      card.style.transform = `
        translate(${x}px, ${y + lift}px)
        rotateZ(${rotateZ}deg)
        rotateX(${rotateX}deg)
        scale(${scale})
      `;
      card.style.zIndex = zIndex;
      card.style.opacity = 1;

      card.querySelector('.stack-card-inner').style.transform = `translateZ(${z}px)`;

      if (isActive) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }

      stage.appendChild(card);
    });

    renderNavigation();
  }

  function renderNavigation() {
    navigation.innerHTML = '';

    // Arrow buttons
    const arrowsContainer = document.createElement('div');
    arrowsContainer.className = 'stack-arrows';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'stack-arrow-btn';
    prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
    prevBtn.setAttribute('aria-label', 'Previous project');
    prevBtn.disabled = !settings.loop && activeIndex === 0;
    prevBtn.addEventListener('click', prev);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'stack-arrow-btn';
    nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
    nextBtn.setAttribute('aria-label', 'Next project');
    nextBtn.disabled = !settings.loop && activeIndex === projects.length - 1;
    nextBtn.addEventListener('click', next);

    arrowsContainer.appendChild(prevBtn);
    arrowsContainer.appendChild(nextBtn);
    navigation.appendChild(arrowsContainer);

    // Dots
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'stack-dots';

    projects.forEach((project, idx) => {
      const dot = document.createElement('button');
      dot.className = 'stack-dot';
      if (idx === activeIndex) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to ${project.title}`);
      dot.addEventListener('click', () => setActive(idx));
      dotsContainer.appendChild(dot);
    });

    navigation.appendChild(dotsContainer);

    // External link
    const activeProject = projects[activeIndex];
    if (activeProject?.href) {
      const link = document.createElement('a');
      link.href = activeProject.href;
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.className = 'stack-link-btn';
      link.setAttribute('aria-label', 'Open link');
      link.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>';
      navigation.appendChild(link);
    }
  }

  function setActive(index) {
    activeIndex = index;
    render();
    restartAutoplay();
  }

  function next() {
    if (settings.loop || activeIndex < projects.length - 1) {
      activeIndex = (activeIndex + 1) % projects.length;
      render();
    }
  }

  function prev() {
    if (settings.loop || activeIndex > 0) {
      activeIndex = (activeIndex - 1 + projects.length) % projects.length;
      render();
    }
  }

  function startAutoplay() {
    if (!settings.autoAdvance) return;
    autoplayInterval = setInterval(() => {
      next();
    }, settings.intervalMs);
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Keyboard navigation
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // Pause on hover
  stage.addEventListener('mouseenter', stopAutoplay);
  stage.addEventListener('mouseleave', startAutoplay);

  render();
  startAutoplay();
})();

/* ─── ANIMATED COUNTERS ──────────────────────────────────────── */
(function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.count);
        const suffix = entry.target.dataset.suffix || '';
        let current = 0;
        const duration = 1800;
        const start = performance.now();

        const tick = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // easeOutExpo
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          current = Math.round(eased * target);
          entry.target.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  els.forEach(el => io.observe(el));
})();

/* ─── PROCESS STEPS STAGGER ──────────────────────────────────── */
(function initProcess() {
  const steps = document.querySelectorAll('.process-step');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const i = Array.from(steps).indexOf(entry.target);
        entry.target.style.opacity = '0';
        entry.target.style.transform = 'translateY(30px)';
        entry.target.style.transition = `opacity 0.7s ${i * 0.12}s cubic-bezier(0.16,1,0.3,1), transform 0.7s ${i * 0.12}s cubic-bezier(0.16,1,0.3,1)`;
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, 60);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  steps.forEach(s => {
    s.style.opacity = '0';
    io.observe(s);
  });
})();

/* ─── SKILLS STAGGER ─────────────────────────────────────────── */
(function initSkills() {
  const items = document.querySelectorAll('.skill-item');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const i = Array.from(items).indexOf(entry.target);
        entry.target.style.opacity = '0';
        entry.target.style.transform = 'translateY(15px)';
        entry.target.style.transition = `opacity 0.5s ${i * 0.07}s var(--ease-out, cubic-bezier(0.16,1,0.3,1)), transform 0.5s ${i * 0.07}s var(--ease-out, cubic-bezier(0.16,1,0.3,1))`;
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, 60);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  items.forEach(el => {
    el.style.opacity = '0';
    io.observe(el);
  });
})();

/* ─── CONTACT FORM ───────────────────────────────────────────── */
(function initForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span>Sending...</span>';
    btn.disabled = true;

    // simulate send (replace with actual email service like EmailJS or Formspree)
    setTimeout(() => {
      form.innerHTML = `
        <div class="form-success show">
          <h3>Message Sent ✦</h3>
          <p>Thanks for reaching out. We'll get back to you within 24 hours.</p>
        </div>
      `;
    }, 1500);
  });
})();

/* ─── SMOOTH ANCHOR SCROLL ───────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ─── PAGE TRANSITION (subtle) ───────────────────────────────── */
document.querySelectorAll('a[href^="http"]').forEach(link => {
  // external links open in new tab — already handled by target="_blank"
  // no JS needed
});

/* ─── FOOTER BRAND PARALLAX ──────────────────────────────────── */
(function initFooterParallax() {
  const brand = document.querySelector('.footer-brand');
  if (!brand) return;
  window.addEventListener('scroll', () => {
    const rect = brand.parentElement.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const progress = 1 - rect.top / window.innerHeight;
      brand.style.transform = `translateX(${progress * -30}px)`;
    }
  }, { passive: true });
})();

/* ─── CURSOR UPDATE FOR DYNAMICALLY ADDED ELEMENTS ──────────── */
(function refreshCursorListeners() {
  // re-run on DOM mutations (e.g., form success state)
  const mo = new MutationObserver(() => {
    document.querySelectorAll('a:not([data-cursor-init]), button:not([data-cursor-init])').forEach(el => {
      el.dataset.cursorInit = '1';
      el.addEventListener('mouseenter', () => {
        document.getElementById('cursor')?.classList.add('hovering');
        document.getElementById('cursorFollower')?.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        document.getElementById('cursor')?.classList.remove('hovering');
        document.getElementById('cursorFollower')?.classList.remove('hovering');
      });
    });
  });
  mo.observe(document.body, { childList: true, subtree: true });
})();
