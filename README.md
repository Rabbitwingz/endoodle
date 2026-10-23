# Endoodle

An internal tool for Enparadigm employees: describe an illustration in plain
words and get it back in the Enparadigm house style. Behind the scenes, every
request is wrapped in a **master prompt** (the brand style guide) and sent to
OpenAI's `gpt-image-1`, along with any **style reference images**.

Features: shared team password · square / landscape / portrait · 1–4
variations per request · PNG download · recent history (stored in each
user's browser).

---

## Tweaking the style

| What | Where |
| --- | --- |
| Written style guide (colours, characters, do's and don'ts) | [`prompts/master-prompt.md`](prompts/master-prompt.md) |
| Example on-brand illustrations | [`style-references/`](style-references/) |
| Image quality / cost | `IMAGE_QUALITY` env var (`low`, `medium`, `high`) |

**Editing the master prompt:** open `prompts/master-prompt.md` on GitHub, click
the ✏️ pencil, edit, and commit. Vercel redeploys automatically and the new
style is live in about a minute. `{{USER_REQUEST}}` marks where the employee's
description goes. Notes inside `<!-- ... -->` are for editors only and are not
sent to the AI.

**Adding reference images:** upload 3–6 of your best on-brand illustrations
to `style-references/` (GitHub → *Add file → Upload files*). This is the
single most effective way to get a consistent style.

> The current master prompt has **placeholder** brand colours and style
> notes. Replace them with Enparadigm's real guidelines.

---

## Deploying to Vercel

1. Get an OpenAI API key at <https://platform.openai.com/api-keys>. Image
   models need a verified organisation:
   <https://platform.openai.com/settings/organization/general>.
2. In Vercel, click **Add New → Project** and import this GitHub repo. The
   defaults (Next.js) are correct.
3. Under **Environment Variables**, add:
   - `OPENAI_API_KEY`: your key
   - `APP_PASSWORD`: the shared password to give employees
   - `IMAGE_QUALITY` (optional): `low`, `medium` (default) or `high`
4. Click **Deploy**. Share the URL and password with the team.

Changing `APP_PASSWORD` later (followed by a redeploy) signs everyone out. If
`APP_PASSWORD` is missing in production, the site stays locked rather than
open.

### Cost

Each image is one OpenAI image-generation call, priced per image and
depending on quality and size (see <https://openai.com/api/pricing>).
Reference images add a bit of input cost per request. Set a monthly budget
limit in your OpenAI dashboard to be safe.

---

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in OPENAI_API_KEY
npm run dev                  # http://localhost:3000
```

Locally, leaving `APP_PASSWORD` empty skips the login screen.

## Project layout

```
prompts/master-prompt.md   ← the brand style prompt (edit me)
style-references/          ← example illustrations sent with every request
app/page.tsx               ← the generator UI
app/login/page.tsx         ← password screen
app/api/generate/route.ts  ← calls OpenAI (API key stays on the server)
app/api/login/route.ts     ← sign in / sign out
middleware.ts              ← blocks everything until signed in
lib/                       ← prompt loading, auth, options, browser history
```
