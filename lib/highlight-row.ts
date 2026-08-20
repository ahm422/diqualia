export function highlightRowRef(el: HTMLElement | null) {
  if (!el) return;
  el.scrollIntoView({ block: "center", behavior: "smooth" });
  el.focus();
}
