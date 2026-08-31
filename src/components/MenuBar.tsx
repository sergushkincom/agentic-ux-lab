"use client";

import { useEffect, useState } from "react";
import { formatTime } from "@/lib/format";

export function MenuBar() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex h-7 items-center justify-end border-b px-4"
      style={{
        background: "var(--menubar-bg)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderColor: "var(--menubar-border)",
      }}
      aria-label="Menu bar"
    >
      <time
        className="text-[13px] font-medium tabular-nums"
        style={{ color: "var(--menubar-text)" }}
        dateTime={time?.toISOString()}
      >
        {time ? formatTime(time) : ""}
      </time>
    </header>
  );
}
