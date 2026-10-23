import { NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import { buildPrompt, loadStyleReferences } from "@/lib/prompt";
import { ASPECTS, MAX_REQUEST_LENGTH, type Aspect } from "@/lib/options";

export const runtime = "nodejs";
// Image generation (especially with reference images) can take a minute or more.
export const maxDuration = 300;

const QUALITIES = ["low", "medium", "high"] as const;
type Quality = (typeof QUALITIES)[number];

// Generates ONE image per call. The browser fires several calls in parallel
// for multiple variations, which keeps each response small and fast.
export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not set on the server." }, { status: 500 });
  }

  const body = (await req.json().catch(() => ({}))) as { request?: string; aspect?: string };
  const request = body.request?.trim() ?? "";
  if (!request) {
    return NextResponse.json({ error: "Please describe the illustration you want." }, { status: 400 });
  }
  if (request.length > MAX_REQUEST_LENGTH) {
    return NextResponse.json(
      { error: `Please keep your description under ${MAX_REQUEST_LENGTH} characters.` },
      { status: 400 },
    );
  }
  const aspect = (body.aspect && body.aspect in ASPECTS ? body.aspect : "square") as Aspect;

  const envQuality = process.env.IMAGE_QUALITY as Quality | undefined;
  const params = {
    model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
    prompt: await buildPrompt(request),
    size: ASPECTS[aspect].size,
    quality: envQuality && QUALITIES.includes(envQuality) ? envQuality : "medium",
    output_format: "webp",
    output_compression: 90,
    n: 1,
  } as const;

  const client = new OpenAI();
  try {
    const references = await loadStyleReferences();
    const result = references.length
      ? await client.images.edit({
          ...params,
          image: await Promise.all(
            references.map((r) => toFile(r.data, r.name, { type: r.type })),
          ),
        })
      : await client.images.generate(params);

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) throw new Error("The AI returned no image.");
    return NextResponse.json({ image: `data:image/webp;base64,${b64}` });
  } catch (err) {
    console.error("Image generation failed:", err);
    // Surface OpenAI's message (e.g. a content-policy rejection) to the user.
    const message =
      err instanceof OpenAI.APIError
        ? err.message
        : "Something went wrong while generating the image. Please try again.";
    const status = err instanceof OpenAI.APIError && err.status === 400 ? 400 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
