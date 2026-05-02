import Script from "next/script";

const INIT = `
(function(){
  try {
    var k='day-win-theme';
    var s=localStorage.getItem(k);
    var dark=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark',dark);
    var c=dark?'#09090b':'#fafaf9';
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
