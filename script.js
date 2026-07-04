document.documentElement.classList.add("js");

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");

menuButton?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});

nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
}));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
  observer.observe(element);
});

const cvModal = document.querySelector("#cv-modal");
document.querySelectorAll("[data-cv-open]").forEach(button => {
  button.addEventListener("click", () => cvModal?.showModal());
});
document.querySelector("[data-cv-close]")?.addEventListener("click", () => cvModal?.close());
cvModal?.addEventListener("click", event => {
  if (event.target === cvModal) cvModal.close();
});

const latestPosts = document.querySelector("#latest-posts");
if (latestPosts) {
  const posts = (window.BLOG_POSTS || []).slice(0, 3);
  latestPosts.innerHTML = posts.map((post, index) => `
    <a class="post reveal visible${index === 0 ? " featured" : ""}" href="blog.html?post=${encodeURIComponent(post.slug)}">
      <div class="post-number">№ ${String(index + 1).padStart(2, "0")}</div>
      <div class="post-meta">${post.formattedDate} · ${post.readingTime} min</div>
      <h3>${post.title}</h3>
      <p>${post.description}</p>
      <span class="read">Read ↗</span>
    </a>
  `).join("");
}
