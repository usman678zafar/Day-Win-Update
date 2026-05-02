import Script from "next/script";

/** Must match `THEME_STORAGE_KEY` in `@/lib/theme`. */
const INIT = `
(function(){
  try {
    var k='day-win-theme';
    var s=localStorage.getItem(k);
    var dark=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark',dark);
    var c=dark?'#262626':'#fafaf9';
    document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.setAttribute('content',c);});
  } catch(e) {}
})();`;

export function ThemeInitScript() {
  return (
    <Script
      id="day-win-theme-init"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: INIT }}
    />
  );
}
