import { useEffect, useRef, useCallback } from "react";

const ROACH_ASCII = `
   🪳  🪳  🪳
  MAIN BHI COCKROACH
   🪳  🪳  🪳
  CJP — Voice of the Lazy & Unemployed
  Join the swarm: cockroachjantaparty.org
  Instagram: @cockroachjantaparty · X: @cockroachisback
`;

export function useConsoleEasterEgg() {
  useEffect(() => {
    console.log(
      "%c🪳 Main Bhi Cockroach! 🪳",
      "font-size: 24px; font-weight: bold; color: #FF9900;"
    );
    console.log(
      "%cCJP — Voice of the Lazy & Unemployed. Join the swarm at cockroachjantaparty.org",
      "font-size: 14px; color: #999999;"
    );
    console.log(ROACH_ASCII);
  }, []);
}

export function useTabTitleEasterEgg() {
  const origTitle = useRef(document.title);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        document.title = "🪳 shhh... the cockroaches are hiding";
      } else {
        document.title = origTitle.current;
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);
}

export function useKonamiCode(onActivate: () => void) {
  const bufferRef = useRef<string[]>([]);
  const konami = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a",
  ];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      bufferRef.current.push(e.key);
      if (bufferRef.current.length > konami.length) {
        bufferRef.current.shift();
      }
      if (
        bufferRef.current.length === konami.length &&
        bufferRef.current.every((k, i) => k === konami[i])
      ) {
        onActivate();
        bufferRef.current = [];
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onActivate, konami]);
}

export function useLogoClick(count: number) {
  if (count >= 5) return true;
  return false;
}
