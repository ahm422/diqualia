// Render-blocking inline script injected into <head> in the root layout. It runs
// synchronously during HTML parsing — before first paint — so the correct theme
// (and `color-scheme`) is applied to <html> without a flash on a full document
// load (hard refresh, or crossing (site) ↔ (admin) ↔ (portal)). Must NOT be
// `next/script`, which does not block paint. See:
// node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
//
// Keys/values mirror ThemeToggle.tsx: localStorage["diqualia-theme"] is
// "light" | "dark", anything else (incl. missing) means "system".

const THEME_INIT_SCRIPT = `(function(){try{
var s=localStorage.getItem("diqualia-theme");
var dark=s==="dark"||(s!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
var d=document.documentElement;
d.classList.toggle("dark",dark);
d.style.colorScheme=dark?"dark":"light";
}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
