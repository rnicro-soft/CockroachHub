import { useCallback, useEffect, useRef, useState } from "react";

interface Drop {
  id: number;
  x: number;
  delay: number;
  size: number;
}

export function CockroachRain() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [active, setActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const trigger = useCallback(() => {
    setActive(true);
    const newDrops = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      size: 16 + Math.random() * 24,
    }));
    setDrops(newDrops);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setActive(false);
      setDrops([]);
    }, 5000);
  }, []);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return { trigger, CockroachRainUI: active ? (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {drops.map((drop) => (
        <span
          key={drop.id}
          className="absolute animate-bounce"
          style={{
            left: `${drop.x}%`,
            top: `-5%`,
            fontSize: `${drop.size}px`,
            animationDelay: `${drop.delay}s`,
            animationDuration: "1.5s",
            opacity: 0.8,
          }}
        >
          🪳
        </span>
      ))}
    </div>
  ) : null };
}
