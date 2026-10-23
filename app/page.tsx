"use client";

import { useEffect, useState } from "react";
import { ASPECTS, MAX_REQUEST_LENGTH, MAX_VARIATIONS, type Aspect } from "@/lib/options";
import {
  clearHistory,
  deleteHistoryItem,
  loadHistory,
  saveHistoryItem,
  type HistoryItem,
} from "@/lib/history";

type Slot = { status: "loading" } | { status: "done"; image: string } | { status: "error"; error: string };

const EXAMPLES = [
  "A team brainstorming around a whiteboard full of sticky notes",
  "A manager giving feedback to an employee in a one-on-one meeting",
  "A learner climbing a staircase made of books towards a trophy",
];

async function generateOne(request: string, aspect: Aspect): Promise<Slot> {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request, aspect }),
    });
    if (res.status === 401) {
      window.location.href = "/login";
      return { status: "error", error: "Signed out." };
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.image) {
      return { status: "error", error: data.error ?? `Generation failed (${res.status}).` };
    }
    return { status: "done", image: data.image };
  } catch {
    return { status: "error", error: "Network error. Please try again." };
  }
}

// Images arrive as WebP (small and fast); download as PNG so they drop
// straight into PowerPoint, Google Slides, Canva, etc.
async function downloadPng(dataUrl: string, request: string, index: number) {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.getContext("2d")!.drawImage(img, 0, 0);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
  if (!blob) return;
  const slug = request.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `endoodle-${slug || "illustration"}-${index + 1}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export default function Home() {
  const [request, setRequest] = useState("");
  const [aspect, setAspect] = useState<Aspect>("square");
  const [count, setCount] = useState(2);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [shownRequest, setShownRequest] = useState("");
  const [shownAspect, setShownAspect] = useState<Aspect>("square");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory().then(setHistory);
  }, []);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    const text = request.trim();
    if (!text || busy) return;

    setBusy(true);
    setShownRequest(text);
    setShownAspect(aspect);
    setSlots(Array.from({ length: count }, () => ({ status: "loading" })));

    const results = await Promise.all(
      Array.from({ length: count }, (_, i) =>
        generateOne(text, aspect).then((slot) => {
          setSlots((prev) => prev.map((s, j) => (j === i ? slot : s)));
          return slot;
        }),
      ),
    );
    setBusy(false);

    const images = results.flatMap((s) => (s.status === "done" ? [s.image] : []));
    if (images.length) {
      await saveHistoryItem({ id: crypto.randomUUID(), request: text, aspect, images, createdAt: Date.now() });
      setHistory(await loadHistory());
    }
  }

  function showHistoryItem(item: HistoryItem) {
    setShownRequest(item.request);
    setShownAspect(item.aspect);
    setSlots(item.images.map((image) => ({ status: "done", image })));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function signOut() {
    await fetch("/api/login", { method: "DELETE" });
    window.location.href = "/login";
  }

  return (
    <main className="container">
      <header className="header">
        <div>
          <h1 className="brand">Endoodle</h1>
          <p className="muted">Describe an illustration and get it in the Enparadigm house style.</p>
        </div>
        <button className="link" onClick={signOut}>
          Sign out
        </button>
      </header>

      <form className="card" onSubmit={generate}>
        <label htmlFor="request">What should the illustration show?</label>
        <textarea
          id="request"
          rows={4}
          maxLength={MAX_REQUEST_LENGTH}
          placeholder="e.g. A diverse group of employees celebrating a project launch"
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(e);
          }}
        />
        <div className="examples">
          <span className="muted">Try:</span>
          {EXAMPLES.map((ex) => (
            <button type="button" key={ex} className="chip" onClick={() => setRequest(ex)}>
              {ex}
            </button>
          ))}
        </div>

        <div className="options">
          <fieldset>
            <legend>Shape</legend>
            <div className="segmented">
              {(Object.keys(ASPECTS) as Aspect[]).map((key) => (
                <button
                  type="button"
                  key={key}
                  className={aspect === key ? "active" : ""}
                  onClick={() => setAspect(key)}
                >
                  <span className={`shape shape-${key}`} />
                  {ASPECTS[key].label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Variations</legend>
            <div className="segmented">
              {Array.from({ length: MAX_VARIATIONS }, (_, i) => i + 1).map((n) => (
                <button type="button" key={n} className={count === n ? "active" : ""} onClick={() => setCount(n)}>
                  {n}
                </button>
              ))}
            </div>
          </fieldset>
          <button className="primary generate" disabled={busy || !request.trim()}>
            {busy ? "Generating…" : "Generate"}
          </button>
        </div>
      </form>

      {slots.length > 0 && (
        <section className="results">
          <p className="muted results-caption">“{shownRequest}”</p>
          <div className="grid">
            {slots.map((slot, i) => (
              <div key={i} className={`tile tile-${shownAspect}`}>
                {slot.status === "loading" && (
                  <div className="placeholder">
                    <div className="spinner" />
                    <span>Drawing… this can take up to a minute</span>
                  </div>
                )}
                {slot.status === "error" && <div className="placeholder error">{slot.error}</div>}
                {slot.status === "done" && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={slot.image} alt={shownRequest} />
                    <button className="download" onClick={() => downloadPng(slot.image, shownRequest, i)}>
                      Download PNG
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section className="history">
          <div className="history-header">
            <h2>Recent</h2>
            <button
              className="link"
              onClick={async () => {
                if (!confirm("Clear all recent illustrations from this browser?")) return;
                await clearHistory();
                setHistory([]);
              }}
            >
              Clear all
            </button>
          </div>
          <p className="muted small">Saved only in this browser. The last 30 requests are kept.</p>
          <div className="history-grid">
            {history.map((item) => (
              <div key={item.id} className="history-item">
                <button className="history-thumb" onClick={() => showHistoryItem(item)} title="View">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.images[0]} alt={item.request} />
                  {item.images.length > 1 && <span className="badge">{item.images.length}</span>}
                </button>
                <p className="history-text">{item.request}</p>
                <div className="history-actions">
                  <button className="link" onClick={() => setRequest(item.request)}>
                    Reuse prompt
                  </button>
                  <button
                    className="link danger"
                    onClick={async () => {
                      await deleteHistoryItem(item.id);
                      setHistory((h) => h.filter((x) => x.id !== item.id));
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
