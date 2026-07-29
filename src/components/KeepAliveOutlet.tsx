import { useRef, useEffect, type ReactNode } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';

const KEEP_ALIVE_PATHS = [
  '/app/dashboard',
  '/app/assistant',
  '/app/notes',
  '/app/quiz',
  '/app/planner',
  '/app/analytics',
  '/app/profile',
  '/app/settings',
];

interface CacheItem {
  outlet: ReactNode;
  scrollY: number;
}

export function KeepAliveOutlet() {
  const location = useLocation();
  const currentOutlet = useOutlet();
  const cache = useRef<Map<string, CacheItem>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPath = KEEP_ALIVE_PATHS.find((p) => location.pathname.startsWith(p));

  // Save scroll position before switching
  useEffect(() => {
    const handler = () => {
      if (containerRef.current) {
        const existing = cache.current.get(currentPath || '');
        if (existing) {
          existing.scrollY = window.scrollY;
        }
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [currentPath]);

  // Update cache with current outlet
  if (currentPath && currentOutlet) {
    const existing = cache.current.get(currentPath);
    cache.current.set(currentPath, {
      outlet: currentOutlet,
      scrollY: existing?.scrollY ?? 0,
    });
  }

  // Restore scroll position after render
  useEffect(() => {
    if (currentPath) {
      const cached = cache.current.get(currentPath);
      if (cached && cached.scrollY > 0) {
        requestAnimationFrame(() => window.scrollTo(0, cached.scrollY));
      }
    }
  }, [currentPath, location.pathname]);

  // Clean up cache entries that are no longer valid (prevent memory growth)
  useEffect(() => {
    const validPaths = new Set(KEEP_ALIVE_PATHS);
    for (const key of cache.current.keys()) {
      if (!validPaths.has(key)) {
        cache.current.delete(key);
      }
    }
  }, []);

  return (
    <div ref={containerRef}>
      {Array.from(cache.current.entries()).map(([path, item]) => (
        <div
          key={path}
          style={{ display: path === currentPath ? 'block' : 'none' }}
        >
          {item.outlet}
        </div>
      ))}
    </div>
  );
}
