// Recent generations, stored in the browser's IndexedDB (images are too large
// for localStorage). History is per-browser and never leaves the device.

import type { Aspect } from "./options";

export type HistoryItem = {
  id: string;
  request: string;
  aspect: Aspect;
  images: string[]; // data URLs
  createdAt: number;
};

const DB_NAME = "endoodle";
const STORE = "history";
const MAX_ITEMS = 30;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadHistory(): Promise<HistoryItem[]> {
  try {
    const items = await run<HistoryItem[]>("readonly", (s) => s.getAll());
    return items.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return []; // private browsing etc. History is a convenience, not critical.
  }
}

export async function saveHistoryItem(item: HistoryItem): Promise<void> {
  try {
    await run("readwrite", (s) => s.put(item));
    const items = await loadHistory();
    await Promise.all(items.slice(MAX_ITEMS).map((old) => deleteHistoryItem(old.id)));
  } catch {
    // ignore
  }
}

export async function deleteHistoryItem(id: string): Promise<void> {
  try {
    await run("readwrite", (s) => s.delete(id));
  } catch {
    // ignore
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await run("readwrite", (s) => s.clear());
  } catch {
    // ignore
  }
}
