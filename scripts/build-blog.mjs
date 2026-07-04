import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const blogDirectory = new URL("../Blogs/", import.meta.url);
const blogDirectoryPath = fileURLToPath(blogDirectory);

function parseFrontmatter(source, filename) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: missing YAML frontmatter`);

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value.slice(1, -1).split(",").map(item => item.trim().replace(/^["']|["']$/g, ""));
    }
    data[key] = value;
  }

  const words = match[2].trim().split(/\s+/).filter(Boolean).length;
  const date = new Date(`${data.date}T12:00:00`);
  if (!data.title || Number.isNaN(date.valueOf())) {
    throw new Error(`${filename}: frontmatter needs a title and YYYY-MM-DD date`);
  }

  return {
    slug: data.slug || basename(filename, extname(filename)),
    title: data.title,
    date: data.date,
    formattedDate: new Intl.DateTimeFormat("en", { day: "2-digit", month: "long", year: "numeric" }).format(date),
    description: data.description || "",
    tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
    readingTime: Math.max(1, Math.ceil(words / 220)),
    content: match[2].trim()
  };
}

const files = (await readdir(blogDirectory)).filter(file => extname(file).toLowerCase() === ".md");
const posts = await Promise.all(files.map(async file => {
  const source = await readFile(join(blogDirectoryPath, file), "utf8");
  return parseFrontmatter(source, file);
}));
posts.sort((a, b) => b.date.localeCompare(a.date));

await writeFile(new URL("../blog-data.js", import.meta.url), `window.BLOG_POSTS = ${JSON.stringify(posts, null, 2)};\n`);
console.log(`Built ${posts.length} blog post${posts.length === 1 ? "" : "s"}.`);
