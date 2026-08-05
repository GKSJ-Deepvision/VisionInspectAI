const KEY = 'vi_inspection_log';

export function loadInspections() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveInspections(rows) {
  if (typeof window === 'undefined') return;
  try {
    // Keep storage light — only persist the most recent 200 records.
    window.localStorage.setItem(KEY, JSON.stringify(rows.slice(0, 200)));
  } catch {
    // Storage full or unavailable — fail silently, in-memory state still works for this session.
  }
}
