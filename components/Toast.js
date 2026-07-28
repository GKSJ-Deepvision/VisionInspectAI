import { useEffect } from 'react';

export default function Toast({ message, level = 'info', onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const styles =
    level === 'critical'
      ? 'border-signal text-signal bg-signal/10'
      : 'border-ok text-ok bg-ok/10';

  return (
    <div
      className={`fixed bottom-6 right-6 z-30 border px-4 py-3 font-mono text-sm shadow-lg backdrop-blur ${styles}`}
      role="alert"
    >
      {message}
    </div>
  );
}
