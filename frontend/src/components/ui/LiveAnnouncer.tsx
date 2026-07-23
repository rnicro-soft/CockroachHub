import { useEffect, useRef } from "react";

interface LiveAnnouncerProps {
  messages: string[];
}

export function LiveAnnouncer({ messages }: LiveAnnouncerProps) {
  const prevRef = useRef<string[]>([]);

  const newMsgs = messages.filter((m) => !prevRef.current.includes(m));
  const lastNew = newMsgs[newMsgs.length - 1] || "";

  useEffect(() => {
    prevRef.current = messages;
  });

  if (!lastNew) return null;

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {lastNew}
    </div>
  );
}
