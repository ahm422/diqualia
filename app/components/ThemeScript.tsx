import Script from "next/script";

export function ThemeScript() {
  // Runs before paint (in <head>) to avoid a theme flash.
  // Uses stored preference when present, otherwise falls back to system.
  const code = `(function(){try{var k='diqualia-theme';var v=null;try{v=localStorage.getItem(k);}catch(e){};var isDark=false;if(v==='dark'){isDark=true;}else if(v==='light'){isDark=false;}else{isDark=!!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);}document.documentElement.classList.toggle('dark',isDark);}catch(e){}})();`;
  return (
    <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: code }} />
  );
}

