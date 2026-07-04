# Personal research website

A static, responsive website without a build step or framework.

## Run locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Editing content

- Bio, links, publications and experience: `index.html`
- CV: `assets/Jakub-Suliga-CV.pdf`
- Blog posts: Markdown files inside `Blogs/`
- Portrait: `assets/jakub-suliga-portrait.png`
- Colors: variables at the beginning of `styles.css`

## Writing a blog post

1. Copy `Blogs/leworldmodel.md` and rename the copy.
2. Edit its frontmatter (`title`, `date`, `description`, `tags`, `slug`) and Markdown content.
3. To preview the new post locally, run:

```bash
npm run build
```

This regenerates `blog-data.js` for the local preview. Put GIFs and images in `Blogs/assets/` and reference them with standard Markdown.

After a push to the `main` branch, GitHub Actions runs the build automatically before deploying the website to GitHub Pages. Running the build locally is not required for deployment.
