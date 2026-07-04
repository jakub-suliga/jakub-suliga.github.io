const posts = window.BLOG_POSTS || [];
const list = document.querySelector("#blog-list");
const article = document.querySelector("#article-view");
const header = document.querySelector(".blog-header");
const params = new URLSearchParams(window.location.search);
const activeSlug = params.get("post");

const escapeHtml = value => value.replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[char]));

const inlineMarkdown = text => escapeHtml(text)
  .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  .replace(/`([^`]+)`/g, "<code>$1</code>")
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  .replace(/\*([^*]+)\*/g, "<em>$1</em>");

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  let html = "";
  let paragraph = [];
  let inCode = false;
  let code = [];
  let listType = null;

  const flushParagraph = () => {
    if (paragraph.length) html += `<p>${inlineMarkdown(paragraph.join(" "))}</p>`;
    paragraph = [];
  };
  const closeList = () => {
    if (listType) html += `</${listType}>`;
    listType = null;
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      flushParagraph();
      closeList();
      if (inCode) {
        html += `<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`;
        code = [];
      }
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      code.push(line);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      closeList();
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length + 1;
      html += `<h${level}>${inlineMarkdown(heading[2])}</h${level}>`;
      continue;
    }
    const item = line.match(/^(\s*)([-*]|\d+\.)\s+(.+)$/);
    if (item) {
      flushParagraph();
      const nextType = /\d+\./.test(item[2]) ? "ol" : "ul";
      if (listType !== nextType) {
        closeList();
        listType = nextType;
        html += `<${listType}>`;
      }
      html += `<li>${inlineMarkdown(item[3])}</li>`;
      continue;
    }
    if (line.startsWith("> ")) {
      flushParagraph();
      closeList();
      html += `<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`;
      continue;
    }
    paragraph.push(line.trim());
  }
  flushParagraph();
  closeList();
  return html;
}

function renderList() {
  if (!posts.length) {
    list.innerHTML = "<p>No posts yet.</p>";
    return;
  }
  list.innerHTML = posts.map(post => `
    <article class="blog-entry">
      <time datetime="${post.date}">${post.formattedDate}</time>
      <div>
        <span class="tag">${post.tags.join(" · ")}</span>
        <h2><a href="blog.html?post=${encodeURIComponent(post.slug)}">${post.title}</a></h2>
        <p>${post.description}</p>
        <a class="read" href="blog.html?post=${encodeURIComponent(post.slug)}">Read ${post.readingTime} min ↗</a>
      </div>
    </article>
  `).join("");
}

function renderArticle(post) {
  document.title = `${post.title} — Jakub Suliga`;
  header.hidden = true;
  list.hidden = true;
  article.hidden = false;
  article.innerHTML = `
    <a class="article-back" href="blog.html">← All notes</a>
    <header>
      <p class="tag">${post.tags.join(" · ")}</p>
      <h1>${post.title}</h1>
      <p class="article-deck">${post.description}</p>
      <div class="article-meta">${post.formattedDate} · ${post.readingTime} min read</div>
    </header>
    <div class="article-body">${markdownToHtml(post.content)}</div>
  `;
}

const selected = posts.find(post => post.slug === activeSlug);
if (selected) renderArticle(selected);
else renderList();
