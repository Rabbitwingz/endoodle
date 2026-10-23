import { promises as fs } from "fs";
import path from "path";

const PROMPT_FILE = path.join(process.cwd(), "prompts", "master-prompt.md");
const REFERENCES_DIR = path.join(process.cwd(), "style-references");
const MAX_REFERENCES = 10;
const IMAGE_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

// Builds the full prompt from prompts/master-prompt.md and the user's request.
// The file is re-read on every request so edits show up immediately in dev.
export async function buildPrompt(userRequest: string): Promise<string> {
  const template = (await fs.readFile(PROMPT_FILE, "utf8"))
    .replace(/<!--[\s\S]*?-->/g, "") // editor notes aren't sent to the AI
    .trim();

  if (template.includes("{{USER_REQUEST}}")) {
    return template.replaceAll("{{USER_REQUEST}}", userRequest);
  }
  return `${template}\n\nSubject to illustrate:\n${userRequest}`;
}

export type ReferenceImage = { name: string; type: string; data: Buffer };

export async function loadStyleReferences(): Promise<ReferenceImage[]> {
  let files: string[];
  try {
    files = await fs.readdir(REFERENCES_DIR);
  } catch {
    return [];
  }
  const images = files
    .filter((f) => IMAGE_TYPES[path.extname(f).toLowerCase()])
    .sort()
    .slice(0, MAX_REFERENCES);

  return Promise.all(
    images.map(async (name) => ({
      name,
      type: IMAGE_TYPES[path.extname(name).toLowerCase()],
      data: await fs.readFile(path.join(REFERENCES_DIR, name)),
    })),
  );
}
