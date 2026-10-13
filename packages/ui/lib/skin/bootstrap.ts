/**
 * Head bootstrap — DESIGN.md §38.2.
 *
 * Inline in <head>, before any stylesheet. Sets theme, skin and fidelity
 * attributes with NO flash. The skin id is validated against a strict
 * pattern before it touches a stylesheet URL. The active skin's CSS is
 * injected render-blocking on purpose (document.write), so a non-default
 * skin is painted before first frame. CSP-friendly alternative: inline the
 * active skin's CSS server-side from a cookie.
 */
export const SKIN_ID_PATTERN = /^[a-z0-9-]{1,32}$/;

export const BOOTSTRAP_JS = `(function(){try{
var d=document.documentElement,ls=localStorage;
var t=ls.getItem('theme'),s=ls.getItem('skin'),f=ls.getItem('fidelity');
if(t==='dark'||t==='light')d.setAttribute('data-theme',t);
if(s&&s!=='system'&&/^[a-z0-9-]{1,32}$/.test(s)){
  d.setAttribute('data-skin',s);
  var sk=document.createElement('link');
  sk.rel='stylesheet';
  sk.href=window.__SKIN_BASE__+s+'.css';
  sk.id='skin-css';
  document.write(sk.outerHTML);
}
if(f==='low'||f==='high')d.setAttribute('data-fidelity',f);
else if((navigator.connection&&navigator.connection.saveData)||
(navigator.deviceMemory&&navigator.deviceMemory<=2)||
(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4&&/Android/.test(navigator.userAgent)))
d.setAttribute('data-fidelity','low');
}catch(e){}})();`;

export function bootstrapScript(skinBase = '/skins/'): string {
  // The script body references window.__SKIN_BASE__; define it just before.
  return `window.__SKIN_BASE__=${JSON.stringify(skinBase)};${BOOTSTRAP_JS}`;
}

export function bootstrapScriptTag(skinBase = '/skins/'): string {
  return `<script>${bootstrapScript(skinBase)}</script>`;
}
