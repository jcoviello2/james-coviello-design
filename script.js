
let siteReady = false;
import { createClient } from 'https://cdn.skypack.dev/@sanity/client'
import imageUrlBuilder from 'https://cdn.skypack.dev/@sanity/image-url'

const client = createClient({
  projectId: "617zybwg",
  dataset: "production",
  useCdn: true,
  apiVersion: "2023-01-01"
})

const builder = imageUrlBuilder(client)

function urlFor(source) {
  return builder.image(source)
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0
});

function observe(el) {
  if (!el) return;

  el.classList.remove('revealed');

  requestAnimationFrame(() => {
    observer.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loading');
  const preloader = document.querySelector('.preloader');
  const fillText = document.querySelector('.preloader-text');

  function startSite() {
    const header = document.querySelector('header');
    const hero = document.querySelector('.hero');

    header?.classList.add('revealed');
    hero?.classList.add('revealed');

    observe(document.querySelector('.projects'));

    setTimeout(() => {
      document
        .querySelectorAll('.sitemap, .footer-logo, .credit')
        .forEach(el => observe(el));
    }, 50);
  }

  window.addEventListener('load', () => {
    window.scrollTo(0, 0);

    // wait for the fill animation to finish
fillText.addEventListener('animationend', () => {
  preloader?.classList.add('hidden');
  document.body.classList.remove('loading'); // 👈 unlock scroll

  setTimeout(() => {
    startSite();
  }, 300);
}, { once: true });
  });
});

window.addEventListener('load', () => {
  window.scrollTo(0, 0);

  const ANIMATION_DURATION = 2000; // your fill
  const COLLAPSE_DURATION = 500;

  const OFFSET = 150; // start wipe before fill fully ends

  setTimeout(() => {
    preloader.classList.add('hidden');

    setTimeout(() => {
      preloader.remove();
      startSite();
    }, COLLAPSE_DURATION);

  }, ANIMATION_DURATION - OFFSET);
});


const query = `{
  "hero": *[_type == "hero"][0]{
    title,
    description,
    image
  },
  "projectSection": *[_type == "projectSection"][0]{
    title
  },
  "projects": *[_type == "project"] | order(order asc){
    title,
    image,
    hoverImage,
    overviewTitle,
    overview,
    projectUrl,
    contextTitle,
    contextApproach,
    implementationTitle,
    implementation,
    outcomeTitle,
    outcome
  }
}`

client.fetch(query).then((data) => {
  const hero = document.querySelector('.hero');

if (data.hero && hero) {
  hero.innerHTML = `
    <h1 class="hero-title">${data.hero.title || ''}</h1>
    <div class="hero-content">
      <div class="hero-media">
        ${data.hero.image ? `
          <img 
            class="hero-image reveal-child" 
            src="${urlFor(data.hero.image).url()}" 
            alt="${data.hero.title || ''}"
          >
        ` : ''}
      </div>
      <div class="hero-text">
        <h2 class="hero-description">${data.hero.description || ''}</h2>
      </div>
    </div>
  `;

  const desc = hero.querySelector('.hero-description');

  if (desc && !desc.querySelector('.word')) {
    const words = desc.textContent.split(' ');

    desc.innerHTML = words
      .map((word, i) => {
        return `<span class="word" style="transition-delay: ${0.4 + i * 0.04}s">${word}</span>`;
      })
      .join(' ');
  }
}
  
function triggerHeroReveal() {
  hero.classList.remove('revealed');
  hero.getBoundingClientRect();

  requestAnimationFrame(() => {
    hero.classList.add('revealed');
  });
}

// only run when site is ready
if (siteReady) {
  triggerHeroReveal();
} else {
  // wait until preloader finishes
  const interval = setInterval(() => {
    if (siteReady) {
      triggerHeroReveal();
      clearInterval(interval);
    }
  }, 50);
}
  const projectsSection = document.querySelector('.projects');

  if (projectsSection) {
    projectsSection.innerHTML = `
      <h2 class="projects-title">
        ${data.projectSection?.title || ''}
      </h2>
      <div class="projects-grid"></div>
    `;

    const grid = projectsSection.querySelector('.projects-grid');
    const items = [];

    data.projects.forEach((project) => {
      if (!project.image) return;
      
      const item = document.createElement('div');
      item.classList.add('project-item', 'reveal');

      item.innerHTML = `
        <div class="project-item-image">
          <img class="project-img" src="${urlFor(project.image).url()}" alt="">
          ${project.hoverImage ? `
            <img class="project-img hover" src="${urlFor(project.hoverImage).url()}" alt="">
          ` : ''}
        </div>
        <div class="project-item-footer">
          <h3 class="project-item-title">${project.title || ''}</h3>
          <div class="project-item-btn">
            <div class="line line--1"></div>
            <div class="line line--2"></div>
            <div class="line line--3"></div>
          </div>
        </div>
      `;

      items.push(item);
      grid.appendChild(item);
    });
    
    items.forEach(item => observe(item));

    items.forEach((item, index) => {
      const project = data.projects[index];

      item.addEventListener('click', () => {
        const existing = grid.querySelector('.project-detail');

        // close if same item
        if (item.classList.contains('active') && existing) {
          const content = existing.querySelector('.project-detail-content');
          existing.style.height = content.scrollHeight + 'px';
          existing.offsetHeight;
          existing.style.height = '0px';

          setTimeout(() => existing.remove(), 400);
          item.classList.remove('active');
          return;
        }

if (existing) {

  // ✅ MOBILE: instant remove + scroll + open
  if (window.innerWidth < 768) {
    existing.remove();

    item.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    setTimeout(() => {
      openProject();
    }, 200);

    return;
  }

  // ✅ DESKTOP: no collapse, just swap
  existing.remove();
  openProject();

  return;
}

        openProject();

        function openProject() {
          document.querySelectorAll('.project-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');

          const detail = document.createElement('div');
          detail.classList.add('project-detail');

          detail.innerHTML = `
            <div class="project-detail-inner">
              <div class="project-detail-content">

                <h2 class="reveal">${project.overviewTitle || project.title}</h2>
                <p class="reveal">${project.overview || ''}</p>

                ${project.projectUrl ? `
                  <a href="${project.projectUrl}" target="_blank" class="btn reveal">
                    View Site
                  </a>
                ` : ''}

                <section class="project-section reveal">
                  <h3>${project.contextTitle || 'Context & Approach'}</h3>
                  <p>${project.contextApproach || ''}</p>
                </section>

                <section class="project-section reveal">
                  <h3>${project.implementationTitle || 'Implementation & Features'}</h3>
                  <div class="implementation-grid">
                    ${
                      project.implementation 
                      ? project.implementation.map(item => `<p>${item}</p>`).join('')
                      : ''
                    }
                  </div>
                </section>

                <section class="project-section reveal">
                  <h3>${project.outcomeTitle || 'Outcome & Reflection'}</h3>
                  <p>${project.outcome || ''}</p>
                </section>

              </div>
            </div>
          `;

          const firstItem = items[0];
          const itemWidth = firstItem.getBoundingClientRect().width;
          const gridWidth = grid.getBoundingClientRect().width;

          let columns = Math.round(gridWidth / itemWidth);
          if (!columns || columns < 1) columns = 1;

          const rowIndex = Math.floor(index / columns);
          const insertIndex = Math.min((rowIndex + 1) * columns - 1, items.length - 1);

          items[insertIndex].after(detail);

          requestAnimationFrame(() => {
            detail.querySelectorAll('.reveal').forEach(el => observe(el));
          });

          enhanceButtons(detail);

          const content = detail.querySelector('.project-detail-content');

          detail.style.height = '0px';
          detail.offsetHeight;
          detail.style.height = content.scrollHeight + 'px';
          detail.classList.add('active');

          detail.addEventListener('transitionend', () => {
            if (detail.style.height !== '0px') {
              detail.style.height = 'auto';
            }
          }, { once: true });
        }
      });
    });

    document.addEventListener('click', (e) => {
      const openDetail = grid?.querySelector('.project-detail');
      const activeItem = grid?.querySelector('.project-item.active');

      if (!openDetail || !activeItem) return;
      if (e.target.closest('.project-item') || e.target.closest('.project-detail')) return;

      const content = openDetail.querySelector('.project-detail-content');

      openDetail.style.height = content.scrollHeight + 'px';
      openDetail.offsetHeight;
      openDetail.style.height = '0px';

      setTimeout(() => openDetail.remove(), 400);
      activeItem.classList.remove('active');
    });
  }
  
  observe(projectsSection);
});

function enhanceButtons(scope = document) {
  scope.querySelectorAll('.btn:not(.is-enhanced)').forEach(button => {
    button.classList.add('is-enhanced');

    const text = button.textContent.trim();
    if (!text) return;

    button.innerHTML = '';

    const inner = document.createElement('span');
    inner.classList.add('btn-inner');

    const primary = document.createElement('span');
    primary.className = 'btn-text btn-text--primary';
    primary.textContent = text;

    const secondary = document.createElement('span');
    secondary.className = 'btn-text btn-text--secondary';
    secondary.textContent = text;

    inner.append(primary, secondary);
    button.append(inner);
  });
}

enhanceButtons();

// =====================
// NAV ACTIVE STATE
// =====================
window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll("#projects, #skills, #experience");
  const navLinks = document.querySelectorAll("header .site-nav a");

  let current = "";

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();

    const trigger = window.innerWidth < 1024
      ? window.innerHeight * 0.3
      : window.innerHeight * 0.5;

    if (rect.top <= trigger && rect.bottom >= trigger) {
      current = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");

    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// =====================
// MOBILE NAV 
// =====================
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  const body = document.body;
  const links = document.querySelectorAll('.site-nav a');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('active');

    if (isOpen) {
      nav.style.height = nav.scrollHeight + 'px';
      nav.offsetHeight;
      nav.style.height = '0px';

      setTimeout(() => {
        nav.classList.remove('active');
      }, 300);
    } else {
      nav.classList.add('active');

      nav.style.height = '0px';
      nav.offsetHeight;

      const height = nav.scrollHeight;
      nav.style.height = height + 'px';

      nav.addEventListener('transitionend', () => {
        if (nav.style.height !== '0px') {
          nav.style.height = 'auto';
        }
      }, { once: true });
    }

    toggle.classList.toggle('active');
    body.classList.toggle('menu-open');
  });

  links.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth >= 1024) return;

      nav.style.height = nav.scrollHeight + 'px';
      nav.offsetHeight;
      nav.style.height = '0px';

      setTimeout(() => {
        nav.classList.remove('active');
        toggle.classList.remove('active');
        body.classList.remove('menu-open');
      }, 300);
    });
  });
});