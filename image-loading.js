// Keep decoded originals cached, sharing requests between preloading and the viewer.
window.portfolioImages = (() => {
  const cache = new Map();
  function load(src, priority = 'low') {
    const existing = cache.get(src);
    if (existing) {
      if (priority === 'high') existing.image.fetchPriority = 'high';
      return existing.promise;
    }
    const image = new Image();
    image.decoding = 'async';
    image.fetchPriority = priority;
    const entry = { image };
    entry.promise = new Promise((resolve, reject) => {
      image.onload = async () => {
        try { await image.decode(); } catch (_) { /* Loaded images can still display. */ }
        resolve(image);
      };
      image.onerror = () => { cache.delete(src); reject(new Error('Image failed to load')); };
    });
    cache.set(src, entry);
    image.src = src;
    return entry.promise;
  }
  function preloadAfterLoad(sources) {
    const queue = [...new Set(sources)];
    const idle = callback => 'requestIdleCallback' in window
      ? window.requestIdleCallback(callback, { timeout: 2000 })
      : setTimeout(callback, 250);
    async function next() {
      if (!queue.length) return;
      try { await load(queue.shift()); } catch (_) { /* A failed original must not block others. */ }
      if (queue.length) idle(next);
    }
    const start = () => idle(next);
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
  }
  return { load, preloadAfterLoad };
})();
