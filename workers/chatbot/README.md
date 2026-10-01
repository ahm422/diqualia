# DiQualia AI Website Assistant

The chat assistant on the DiQualia website, deployed as its own Cloudflare
Worker. It answers visitors' questions using only the site's own published
content, such as services, industries, blog posts and job openings.

## How it works

- **Knowledge base.** Published content is split into chunks, embedded with
  Workers AI, and stored in a Vectorize index. When content changes in the admin
  panel, it is re-indexed automatically.
- **Answering.** Each question is matched against the index, the best passages
  are re-ranked, and a Workers AI language model writes the answer from those
  passages only.
- **Conversations.** Each browser session's chat history is kept in a Durable
  Object.
- **Connection to the site.** The website calls this Worker through a Cloudflare
  service binding (`CHATBOT`), so it is not exposed as a public endpoint of its
  own.

## Development

```bash
npm install
npx wrangler login       # Workers AI and Vectorize always run remotely
npm run dev              # or `npm run chatbot:dev` from the repository root
npm test                 # unit tests
npm run typecheck
```

## Deployment

Deploy this Worker before the website, because the website's service binding
points to it:

```bash
npm run deploy:all
```

Before deploying to your own account, point `wrangler.jsonc` at your own
Cloudflare account, D1 database and Vectorize index (`npm run vectorize:create`).
