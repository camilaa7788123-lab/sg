import { PublishedGame } from '../types/sg';

const DB_NAME = 'sg_published_html5_db';
const DB_VERSION = 1;
const STORE_NAME = 'games';
const FALLBACK_KEY = 'sg_published_html5_fallback_v1';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Failed to open IndexedDB'));
  });
}

function loadFallback(): PublishedGame[] {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFallback(games: PublishedGame[]): void {
  try {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(games));
  } catch {
    // Ignore storage overflow
  }
}

export async function getAllPublishedGames(): Promise<PublishedGame[]> {
  try {
    const db = await openDatabase();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result as PublishedGame[]) || [];
        list.sort((a, b) => b.createdAt - a.createdAt);
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return loadFallback().sort((a, b) => b.createdAt - a.createdAt);
  }
}

export async function savePublishedGame(game: PublishedGame): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(game);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const list = loadFallback();
    const idx = list.findIndex((g) => g.id === game.id);
    if (idx >= 0) list[idx] = game;
    else list.unshift(game);
    saveFallback(list);
  }
}

export async function deletePublishedGame(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const list = loadFallback().filter((g) => g.id !== id);
    saveFallback(list);
  }
}
