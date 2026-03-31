import Script from "next/script";

export function ThemeScript() {
  // Runs before paint (in <head>) to avoid a theme flash.
  // Reads localStorage only if user previously chose.
  const code = `(function(){try{var k='diqualia-theme';var v=localStorage.getItem(k);if(v==='light'||v==='dark'){document.documentElement.dataset.theme=v;}}catch(e){}})();`;
  return (
    <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: code }} />
  );
}

