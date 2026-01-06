const hasGSAP = typeof gsap !== "undefined";
const hasBarba = typeof barba !== "undefined";

if (hasGSAP && gsap.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

function animateText(container = document) {
  if (!hasGSAP) return;

  container.querySelectorAll(".fx-text").forEach(el => {
    if (el.dataset.fxDone) return;
    el.dataset.fxDone = "true";

    const text = el.innerText;
    el.innerHTML = "";

    [...text].forEach((char, i) => {
      const span = document.createElement("span");
      span.innerHTML = char === " " ? "&nbsp;" : char;
      span.style.opacity = "0";
      span.style.transform = "translateY(10px)";
      span.style.display = "inline-block";

      el.appendChild(span);

      gsap.to(span, {
        opacity: 1,
        y: 0,
        delay: i * 0.04,
        duration: 0.35,
        ease: "power2.out"
      });
    });
  });
}

function initSlideshow(container = document) {
  const slides = container.querySelectorAll(".slide");
  if (!slides.length) return;

  let index = 0;
  slides[0].classList.add("active");

  setInterval(() => {
    slides[index].classList.remove("active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("active");
  }, 3500);
}

function initQuotes(container = document) {
  const cards = container.querySelectorAll(".quote-card");
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  cards.forEach(card => observer.observe(card));
}

function initMusic(container = document) {
  if (!container.querySelector("#audioPlayer")) return;

  const player = container.querySelector("#audioPlayer");
  const songs = container.querySelectorAll(".song-item");

  const currentCover = container.querySelector("#current-cover");
  const currentTitle = container.querySelector("#current-title");
  const currentArtist = container.querySelector("#current-artist");
  const playPauseBtn = container.querySelector("#play-pause-btn");
  const prevBtn = container.querySelector("#prev-btn");
  const nextBtn = container.querySelector("#next-btn");
  const rewindBtn = container.querySelector("#rewind-btn");
  const forwardBtn = container.querySelector("#forward-btn");
  const progressFill = container.querySelector(".progress-fill");
  const progressBar = container.querySelector(".progress-bar");
  const currentTimeEl = container.querySelector("#current-time");
  const durationEl = container.querySelector("#duration");

  if (!player || !playPauseBtn || !progressBar) return;

  const queue = [];
  let currentIndex = -1;

  function loadSong(index) {
    if (index < 0 || index >= queue.length) return;
    const song = queue[index];

    player.src = song.src;
    // Fallback cover image (keep this file in repo so we never reference a missing asset)
    if (currentCover) currentCover.src = song.cover || "/assets/media/placeholder.png";
    if (currentTitle) currentTitle.textContent = song.title;
    if (currentArtist) currentArtist.textContent = song.artist;

    currentIndex = index;
    player.play().catch(() => {});
    playPauseBtn.textContent = "❚❚";
  }

  function playSong(songEl) {
    const src = songEl.dataset.src;
    const cover = songEl.dataset.cover;
    const title = songEl.querySelector("strong")?.textContent || "Unknown";
    const artist = songEl.querySelector("span")?.textContent || "Unknown";

    const existingIndex = queue.findIndex(s => s.src === src);
    if (existingIndex !== -1) {
      loadSong(existingIndex);
      return;
    }

    queue.push({ src, cover, title, artist });
    loadSong(queue.length - 1);
  }

  songs.forEach(song => song.addEventListener("click", () => playSong(song)));

  playPauseBtn.addEventListener("click", () => {
    if (player.paused) {
      player.play().catch(() => {});
      playPauseBtn.textContent = "❚❚";
    } else {
      player.pause();
      playPauseBtn.textContent = "▶";
    }
  });

  prevBtn?.addEventListener("click", () => loadSong(currentIndex - 1));
  nextBtn?.addEventListener("click", () => loadSong(currentIndex + 1));
  rewindBtn?.addEventListener("click", () => (player.currentTime -= 10));
  forwardBtn?.addEventListener("click", () => (player.currentTime += 10));

  player.addEventListener("timeupdate", () => {
    if (!player.duration) return;
    const progress = (player.currentTime / player.duration) * 100;
    progressFill.style.width = `${progress}%`;
    currentTimeEl.textContent = formatTime(player.currentTime);
    durationEl.textContent = formatTime(player.duration);
  });

  progressBar.addEventListener("click", e => {
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, offsetX / rect.width));
    player.currentTime = percent * player.duration;
  });

  player.addEventListener("ended", () => nextBtn?.click());

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
}

export function animateSales(container = document) {
  const stats = container.querySelectorAll(".stat-number");

  stats.forEach(stat => {
    if (stat.dataset.animated === "true") return;
    stat.dataset.animated = "true";

    const target = Number(stat.dataset.value);
    if (isNaN(target)) return;

    const isMoney = stat.dataset.money === "true";

    let current = 0;
    const increment = Math.max(1, Math.ceil(target / 60));

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      stat.textContent = isMoney
        ? `$${current.toLocaleString()}`
        : current.toLocaleString();
    }, 16);
  });
}

function initSocialTabs(container = document) {
  const tabs = container.querySelectorAll(".social-tab");
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.onclick = () => {
      const target = tab.dataset.social;
      container.querySelectorAll(".social-tab").forEach(t => t.classList.remove("active"));
      container.querySelectorAll(".social-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      const panel = container.querySelector(`#${target}`);
      if (panel) panel.classList.add("active");
    };
  });
}

function initScrollFX(container = document) {
  if (!hasGSAP || !gsap.ScrollTrigger) return;

  container.querySelectorAll("section").forEach(section => {
    const h2 = section.querySelector("h2");
    if (!h2) return;

    gsap.from(h2, {
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        once: true
      },
      y: 40,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out"
    });
  });
}

function initPage(container = document) {
  animateText(container);
  initSlideshow(container);
  initQuotes(container);
  initMusic(container);
  animateSales(container);
  initSocialTabs(container);
  initScrollFX(container);
}

if (hasBarba) {
  barba.init({
    transitions: [
      {
        once({ next }) {
          initPage(next.container);
        },
        enter({ next }) {
          gsap.fromTo(
            next.container,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
          );
          window.scrollTo(0, 0);
          initPage(next.container);
        },
        after({ next }) {
          initPage(next.container);
        }
      }
    ]
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initPage(document);
});
