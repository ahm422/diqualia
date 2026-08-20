export function formatRelativeTime(iso: Date | string, nowMs = Date.now()) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const deltaSec = Math.round((then - nowMs) / 1000);
  const abs = Math.abs(deltaSec);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (abs < 60) return rtf.format(deltaSec, "second");
  const minutes = Math.round(deltaSec / 60);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(deltaSec / 3600);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  const days = Math.round(deltaSec / 86400);
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  const months = Math.round(deltaSec / 2592000);
  if (Math.abs(months) < 12) return rtf.format(months, "month");
  return rtf.format(Math.round(deltaSec / 31536000), "year");
}
