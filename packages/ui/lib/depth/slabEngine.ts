import type * as ThreeType from 'three';
import { bundledSkins } from '../../skins';
import { supportsWebgl2 } from '../skin/capabilities';
import type { Lighting, Pbr, Role, Skin } from '../skin/types';
import { SLAB_ROLES } from '../skin/types';
import {
  RESIZE_DEBOUNCE_MS,
  slabCapFor,
  slabPixelRatio,
  slabShadowMapSize,
  slabShadowsEnabled,
} from './devicePolicy';

const CANDIDATE_SELECTOR =
  '.mat-panel, .mat-card, .mat-raised, .mat-well, .mat-control, .mat-primary';

const FOV = 42;

interface SlabRecord {
  el: HTMLElement;
  role: Role;
  mesh: ThreeType.Mesh;
  echoMeshes: ThreeType.Mesh[];
  frontMat: ThreeType.MeshBasicMaterial;
  wallMat: ThreeType.MeshPhysicalMaterial;
  lastW: number;
  lastH: number;
  lastR: number;
  lastT: number;
  lastB: number;
  geomKey: string;
}

function parseCssColor(val: string): { hex: number; alpha: number } {
  val = val.trim();
  if (!val) return { hex: 0xffffff, alpha: 1 };

  if (val.startsWith('#')) {
    if (val.length === 4) {
      const r = parseInt(val[1] + val[1], 16);
      const g = parseInt(val[2] + val[2], 16);
      const b = parseInt(val[3] + val[3], 16);
      return { hex: (r << 16) | (g << 8) | b, alpha: 1 };
    }
    if (val.length >= 7) {
      const r = parseInt(val.slice(1, 3), 16);
      const g = parseInt(val.slice(3, 5), 16);
      const b = parseInt(val.slice(5, 7), 16);
      let a = 1;
      if (val.length === 9) a = parseInt(val.slice(7, 9), 16) / 255;
      return { hex: (r << 16) | (g << 8) | b, alpha: a };
    }
  }

  const rgbMatch = val.match(
    /^rgba?\(\s*([0-9.]+)[,\s]+([0-9.]+)[,\s]+([0-9.]+)(?:[,\s/]+([0-9.%]+))?\s*\)$/i,
  );
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, parseFloat(rgbMatch[1])));
    const g = Math.min(255, Math.max(0, parseFloat(rgbMatch[2])));
    const b = Math.min(255, Math.max(0, parseFloat(rgbMatch[3])));
    let a = 1;
    if (rgbMatch[4]) {
      a = rgbMatch[4].endsWith('%') ? parseFloat(rgbMatch[4]) / 100 : parseFloat(rgbMatch[4]);
    }
    return {
      hex: ((Math.round(r) & 0xff) << 16) | ((Math.round(g) & 0xff) << 8) | (Math.round(b) & 0xff),
      alpha: Math.min(1, Math.max(0, a)),
    };
  }

  const bareMatch = val.match(/^([0-9.]+)[,\s]+([0-9.]+)[,\s]+([0-9.]+)$/);
  if (bareMatch) {
    const r = parseFloat(bareMatch[1]);
    const g = parseFloat(bareMatch[2]);
    const b = parseFloat(bareMatch[3]);
    return {
      hex: ((Math.round(r) & 0xff) << 16) | ((Math.round(g) & 0xff) << 8) | (Math.round(b) & 0xff),
      alpha: 1,
    };
  }

  return { hex: 0xffffff, alpha: 1 };
}

function resolveTokenColor(
  expr: string,
  rootStyle: CSSStyleDeclaration,
): { hex: number; alpha: number } {
  if (!expr) return { hex: 0xffffff, alpha: 1 };
  const varName = expr.startsWith('--') ? expr : expr.startsWith('k-') ? `--${expr}` : `--${expr}`;
  const raw = rootStyle.getPropertyValue(varName).trim();
  if (raw) return parseCssColor(raw);
  return parseCssColor(expr);
}

function getRole(el: HTMLElement): Role | null {
  for (const role of SLAB_ROLES) {
    if (el.classList.contains(`mat-${role}`)) return role;
  }
  return null;
}

function isStickyOrFixed(el: HTMLElement): boolean {
  let cur: HTMLElement | null = el;
  while (cur && cur !== document.body && cur !== document.documentElement) {
    const pos = getComputedStyle(cur).position;
    if (pos === 'sticky' || pos === 'fixed') return true;
    cur = cur.parentElement;
  }
  return false;
}

function inNestedScroller(el: HTMLElement, container: HTMLElement): boolean {
  let cur = el.parentElement;
  while (cur && cur !== container && cur !== document.body && cur !== document.documentElement) {
    const style = getComputedStyle(cur);
    const overflowY = style.overflowY;
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      cur.scrollHeight > cur.clientHeight
    ) {
      return true;
    }
    cur = cur.parentElement;
  }
  return false;
}

export function createSlabEngine(
  container: HTMLElement,
  onFallback: (fallbackSkinId: string) => void,
): { dispose(): void } {
  let disposed = false;
  let active = false;
  let THREE: typeof ThreeType | null = null;

  let canvas: HTMLCanvasElement | null = null;
  let renderer: ThreeType.WebGLRenderer | null = null;
  let scene: ThreeType.Scene | null = null;
  let camera: ThreeType.PerspectiveCamera | null = null;

  let keyLight: ThreeType.DirectionalLight | null = null;
  let ambientLight: ThreeType.AmbientLight | null = null;
  let hemiLight: ThreeType.HemisphereLight | null = null;
  let shadowCatcher: ThreeType.Mesh | null = null;

  let currentSkin: Skin | null = null;
  let currentSkinId = '';
  let records: SlabRecord[] = [];
  const flaggedElements = new Set<HTMLElement>();
  const geometryCache = new Map<string, ThreeType.BufferGeometry>();
  const elevationCache = new Map<Role, number>();

  let rAFId: number | null = null;
  let ensureTimeout: ReturnType<typeof setTimeout> | null = null;
  let resizeTimer: ReturnType<typeof setTimeout> | null = null;

  // Lazy boot (todo/11): three + the GL context are created only when a
  // webgl-slabs skin is actually active. A failed boot never retries.
  let bootPromise: Promise<boolean> | null = null;
  let bootFailed = false;

  // Fail-safe (todo/11): consecutive throwing frames → drop to pure 2D.
  let renderFailures = 0;
  let lastNotifiedFallback = '';

  // Guard degradation tracking
  let renderCount = 0;
  const renderTimes: number[] = [];
  let degradationStep = 0; // 0 = none, 1 = no shadow, 2 = dpr 1, 3 = halve slabs
  let activeCapScale = 1.0;

  let rootObserver: MutationObserver | null = null;
  let domObserver: MutationObserver | null = null;

  function schedule() {
    if (disposed || !active) return;
    if (rAFId !== null) return;
    rAFId = requestAnimationFrame(() => {
      rAFId = null;
      if (disposed || !active) return;
      try {
        update();
        render();
        renderFailures = 0;
      } catch {
        // A throwing frame (tile-based GPU hiccup, driver error) must never
        // take the page down — 3 consecutive failures ⇒ drop to pure 2D.
        renderFailures++;
        if (renderFailures >= 3) failTo2D();
      }
    });
  }

  function scheduleEnsure() {
    if (disposed || !active) return;
    if (ensureTimeout !== null) clearTimeout(ensureTimeout);
    ensureTimeout = setTimeout(() => {
      ensureTimeout = null;
      if (disposed || !active) return;
      try {
        ensure();
      } catch {
        failTo2D();
        return;
      }
      schedule();
    }, 150);
  }

  /** Shadows are the biggest GPU cost — off on small devices and after guard step 1. */
  function shadowsAllowed(): boolean {
    return degradationStep === 0 && slabShadowsEnabled(window.innerWidth);
  }

  /** Never let an engine callback exception reach the page (todo/11). */
  function notifyFallback(fallbackId: string) {
    if (!fallbackId || fallbackId === lastNotifiedFallback) return;
    lastNotifiedFallback = fallbackId;
    try {
      onFallback(fallbackId);
    } catch {}
  }

  /** Hard failure → deactivate and hand the skin back to its 2D fallback. */
  function failTo2D(explicitFallback?: string) {
    const fallbackId = explicitFallback ?? currentSkin?.fallback ?? 'system';
    deactivate();
    notifyFallback(fallbackId);
  }

  function invalidateElevations() {
    elevationCache.clear();
    const style = getComputedStyle(document.documentElement);
    for (const role of SLAB_ROLES) {
      const val = style.getPropertyValue(`--m-${role}-z`).trim();
      const num = parseFloat(val);
      elevationCache.set(role, Number.isNaN(num) ? 0 : num);
    }
  }

  function resolveFrontPaint(
    el: HTMLElement,
    role: Role,
    rootStyle: CSSStyleDeclaration,
  ): { hex: number; alpha: number } {
    const elStyle = getComputedStyle(el);
    let raw = '';
    if (el.matches(':active')) {
      raw = elStyle.getPropertyValue(`--m-${role}-press-bg`).trim();
    }
    if (!raw && el.matches(':hover')) {
      raw = elStyle.getPropertyValue(`--m-${role}-hover-bg`).trim();
    }
    if (!raw) {
      raw = elStyle.getPropertyValue(`--m-${role}-bg`).trim();
    }
    if (!raw) {
      raw = rootStyle.getPropertyValue('--surface-2').trim();
    }
    return parseCssColor(raw);
  }

  function createShape(w: number, h: number, r: number, T: typeof ThreeType): ThreeType.Shape {
    const shape = new T.Shape();
    const x = -w / 2;
    const y = -h / 2;
    const radius = Math.max(0, Math.min(r, w / 2, h / 2));
    if (radius === 0) {
      shape.moveTo(x, y);
      shape.lineTo(x + w, y);
      shape.lineTo(x + w, y + h);
      shape.lineTo(x, y + h);
      shape.closePath();
      return shape;
    }
    shape.moveTo(x + radius, y);
    shape.lineTo(x + w - radius, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + radius);
    shape.lineTo(x + w, y + h - radius);
    shape.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    shape.lineTo(x + radius, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);
    shape.closePath();
    return shape;
  }

  function getExtrudeGeometry(
    w: number,
    h: number,
    r: number,
    pbr: Pbr,
    T: typeof ThreeType,
  ): { geom: ThreeType.BufferGeometry; key: string } {
    const thickness = pbr.thickness ?? 10;
    const bevel = pbr.bevel ?? 2;
    const key = `${w}x${h}x${r}x${thickness}x${bevel}`;
    const cached = geometryCache.get(key);
    if (cached) return { geom: cached, key };

    const shape = createShape(w, h, r, T);
    const depth = Math.max(thickness - 2 * bevel, 1);
    const geom = new T.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: pbr.bevelSegments ?? 2,
      curveSegments: 4,
    });
    geom.computeBoundingBox();
    const maxZ = geom.boundingBox?.max.z ?? depth;
    geom.translate(0, 0, -maxZ);

    geometryCache.set(key, geom);
    return { geom, key };
  }

  function clearSlabFlags() {
    for (const el of flaggedElements) {
      el.removeAttribute('data-slab');
    }
    flaggedElements.clear();
    if (domObserver) domObserver.takeRecords();
  }

  function teardownScene() {
    if (!scene) return;
    for (const rec of records) {
      scene.remove(rec.mesh);
      for (const eMesh of rec.echoMeshes) {
        scene.remove(eMesh);
        eMesh.geometry.dispose();
        (eMesh.material as ThreeType.Material).dispose();
      }
      rec.frontMat.dispose();
      rec.wallMat.dispose();
    }
    records = [];

    for (const geom of geometryCache.values()) {
      geom.dispose();
    }
    geometryCache.clear();

    if (keyLight) {
      scene.remove(keyLight);
      keyLight = null;
    }
    if (ambientLight) {
      scene.remove(ambientLight);
      ambientLight = null;
    }
    if (hemiLight) {
      scene.remove(hemiLight);
      hemiLight = null;
    }
    if (shadowCatcher) {
      scene.remove(shadowCatcher);
      shadowCatcher.geometry.dispose();
      (shadowCatcher.material as ThreeType.Material).dispose();
      shadowCatcher = null;
    }
  }

  function setupLighting(lighting: Lighting, W: number, H: number, T: typeof ThreeType) {
    if (!scene) return;

    const R = Math.max(W, H) * 1.2;
    const phiRad = (lighting.key.phi * Math.PI) / 180;
    const thetaRad = (lighting.key.theta * Math.PI) / 180;

    const x = R * Math.sin(thetaRad) * Math.cos(phiRad);
    const y = R * Math.sin(thetaRad) * Math.sin(phiRad);
    const z = R * Math.cos(thetaRad);

    const rootStyle = getComputedStyle(document.documentElement);
    const keyCol = lighting.key.color
      ? resolveTokenColor(lighting.key.color, rootStyle).hex
      : 0xffffff;

    keyLight = new T.DirectionalLight(keyCol, lighting.key.intensity);
    keyLight.position.set(x, y, z);
    keyLight.target.position.set(0, 0, 0);
    scene.add(keyLight.target);

    keyLight.castShadow = shadowsAllowed();
    keyLight.shadow.camera.left = -0.75 * W;
    keyLight.shadow.camera.right = 0.75 * W;
    keyLight.shadow.camera.top = 0.75 * H;
    keyLight.shadow.camera.bottom = -0.75 * H;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 4 * R;
    // 1024² desktop / 512² small-device (slabShadowMapSize) — the shadow pass
    // is the single biggest GPU cost of the engine.
    const mapSize = slabShadowMapSize(W);
    keyLight.shadow.mapSize.width = mapSize;
    keyLight.shadow.mapSize.height = mapSize;
    keyLight.shadow.radius = lighting.shadow.softness;
    keyLight.shadow.camera.updateProjectionMatrix();
    scene.add(keyLight);

    ambientLight = new T.AmbientLight(0xffffff, lighting.ambient);
    scene.add(ambientLight);

    hemiLight = new T.HemisphereLight(0xffffff, 0x808080, lighting.env);
    scene.add(hemiLight);

    const catcherGeom = new T.PlaneGeometry(2 * W, 2 * H);
    const catcherMat = new T.ShadowMaterial({ opacity: lighting.shadow.catcherLight });
    shadowCatcher = new T.Mesh(catcherGeom, catcherMat);
    shadowCatcher.position.set(0, 0, 0.002);
    shadowCatcher.receiveShadow = true;
    shadowCatcher.visible = shadowsAllowed();
    scene.add(shadowCatcher);
  }

  function reconfigure(skin: Skin) {
    if (!THREE || !renderer || !scene) return;
    currentSkin = skin;
    teardownScene();
    invalidateElevations();

    const W = window.innerWidth;
    const H = window.innerHeight;

    if (skin.lighting) {
      setupLighting(skin.lighting, W, H, THREE);
    }

    ensure();
    schedule();
  }

  function ensure() {
    if (!active || !currentSkin || !THREE || !scene) return;
    const T = THREE;
    const pbrConfig = currentSkin.pbr;
    if (!pbrConfig) return;

    const rootStyle = getComputedStyle(document.documentElement);
    const W = window.innerWidth;
    const effectiveCap = slabCapFor(currentSkin.slabCap, W, activeCapScale);

    const candidates = Array.from(container.querySelectorAll<HTMLElement>(CANDIDATE_SELECTOR));

    const existingMap = new Map<HTMLElement, SlabRecord>();
    for (const rec of records) existingMap.set(rec.el, rec);

    const newRecords: SlabRecord[] = [];
    let count = 0;

    for (const el of candidates) {
      if (count >= effectiveCap) break;
      const role = getRole(el);
      if (!role) continue;
      const pbr = pbrConfig[role];
      if (!pbr) continue;

      if (isStickyOrFixed(el)) continue;
      if (inNestedScroller(el, container)) continue;

      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) continue;

      count++;
      let rec = existingMap.get(el);

      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      const elStyle = getComputedStyle(el);
      const rRaw = parseFloat(elStyle.borderTopLeftRadius) || 0;
      const r = Math.round(rRaw);
      const thickness = pbr.thickness ?? 10;
      const bevel = pbr.bevel ?? 2;

      const { geom, key: geomKey } = getExtrudeGeometry(w, h, r, pbr, T);

      if (rec) {
        existingMap.delete(el);
        if (rec.geomKey !== geomKey) {
          rec.mesh.geometry = geom;
          rec.geomKey = geomKey;
          rec.lastW = w;
          rec.lastH = h;
          rec.lastR = r;
          rec.lastT = thickness;
          rec.lastB = bevel;
        }
        newRecords.push(rec);
      } else {
        const paint = resolveFrontPaint(el, role, rootStyle);
        const frontOpacity = pbr.frontAlpha ?? paint.alpha;

        const frontMat = new T.MeshBasicMaterial({
          color: paint.hex,
          opacity: frontOpacity,
          transparent: frontOpacity < 1,
          depthWrite: frontOpacity >= 1,
          toneMapped: false,
        });

        const sideColor = resolveTokenColor(pbr.side, rootStyle);
        const wallMat = new T.MeshPhysicalMaterial({
          color: sideColor.hex,
          roughness: pbr.roughness ?? 0.5,
          metalness: pbr.metalness ?? 0,
          clearcoat: pbr.clearcoat ?? 0,
          clearcoatRoughness: pbr.clearcoatRoughness ?? 0,
          sheen: pbr.sheen ?? 0,
          transmission: pbr.transmission ?? 0,
          ior: pbr.ior ?? 1.5,
          thickness: pbr.thicknessVol ?? 0,
        });

        if (pbr.emissive) {
          wallMat.emissive.set(resolveTokenColor(pbr.emissive, rootStyle).hex);
          wallMat.emissiveIntensity = pbr.emissiveIntensity ?? 1;
        }

        const mesh = new T.Mesh(geom, [frontMat, wallMat]);
        mesh.castShadow = shadowsAllowed();
        mesh.receiveShadow = false;
        mesh.visible = false;
        scene.add(mesh);

        const echoMeshes: ThreeType.Mesh[] = [];
        if (pbr.echoes && pbr.echoes.length > 0) {
          const shape = createShape(w, h, r, T);
          const shapeGeom = new T.ShapeGeometry(shape);
          for (const echo of pbr.echoes) {
            const echoColor = resolveTokenColor(echo.color, rootStyle);
            const echoMat = new T.MeshBasicMaterial({
              color: echoColor.hex,
              transparent: true,
              opacity: 0.16,
              depthWrite: false,
            });
            const eMesh = new T.Mesh(shapeGeom, echoMat);
            eMesh.visible = false;
            scene.add(eMesh);
            echoMeshes.push(eMesh);
          }
        }

        rec = {
          el,
          role,
          mesh,
          echoMeshes,
          frontMat,
          wallMat,
          lastW: w,
          lastH: h,
          lastR: r,
          lastT: thickness,
          lastB: bevel,
          geomKey,
        };
        newRecords.push(rec);
      }
    }

    // Clean up records no longer tracked
    for (const rec of existingMap.values()) {
      scene.remove(rec.mesh);
      for (const eMesh of rec.echoMeshes) {
        scene.remove(eMesh);
        eMesh.geometry.dispose();
        (eMesh.material as ThreeType.Material).dispose();
      }
      rec.frontMat.dispose();
      rec.wallMat.dispose();
      if (flaggedElements.has(rec.el)) {
        rec.el.removeAttribute('data-slab');
        flaggedElements.delete(rec.el);
      }
    }

    records = newRecords;
    if (domObserver) domObserver.takeRecords();
  }

  function update() {
    if (!active || !camera || !currentSkin) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const D = H / 2 / Math.tan(((FOV / 2) * Math.PI) / 180);

    for (const rec of records) {
      const el = rec.el;
      if (!el.isConnected) {
        rec.mesh.visible = false;
        for (const eMesh of rec.echoMeshes) eMesh.visible = false;
        if (flaggedElements.has(el)) {
          el.removeAttribute('data-slab');
          flaggedElements.delete(el);
        }
        continue;
      }

      const rect = el.getBoundingClientRect();
      const inView =
        rect.bottom > 0 &&
        rect.top < H &&
        rect.right > 0 &&
        rect.left < W &&
        rect.width > 0 &&
        rect.height > 0;

      if (!inView) {
        rec.mesh.visible = false;
        for (const eMesh of rec.echoMeshes) eMesh.visible = false;
        if (flaggedElements.has(el)) {
          el.removeAttribute('data-slab');
          flaggedElements.delete(el);
        }
        continue;
      }

      const e = elevationCache.get(rec.role) ?? 0;
      const k = (D - e) / D;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const X = (cx - W / 2) * k;
      const Y = (H / 2 - cy) * k;
      const Z = e;

      rec.mesh.position.set(X, Y, Z);
      rec.mesh.scale.set(k, k, 1);
      rec.mesh.visible = true;

      const pbr = currentSkin.pbr?.[rec.role];
      if (pbr?.echoes && rec.echoMeshes.length === pbr.echoes.length) {
        for (let i = 0; i < pbr.echoes.length; i++) {
          const echo = pbr.echoes[i];
          const eMesh = rec.echoMeshes[i];
          const echoE = Math.max(e - echo.dz, 0.05);
          const echoK = (D - echoE) / D;
          const echoCx = cx + echo.dx;
          const echoCy = cy + echo.dy;
          eMesh.position.set((echoCx - W / 2) * echoK, (H / 2 - echoCy) * echoK, echoE);
          eMesh.scale.set(echoK, echoK, 1);
          eMesh.visible = true;
        }
      }

      if (!flaggedElements.has(el)) {
        el.setAttribute('data-slab', 'on');
        flaggedElements.add(el);
      }
    }

    if (domObserver) domObserver.takeRecords();
  }

  function guard(renderDurationMs: number) {
    if (renderCount >= 400 || degradationStep >= 3) return;
    renderCount++;
    renderTimes.push(renderDurationMs);
    if (renderTimes.length > 40) renderTimes.shift();

    if (renderCount % 40 === 0 && renderTimes.length >= 40) {
      const avg = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
      if (avg > 14) {
        degradationStep++;
        if (degradationStep === 1) {
          if (keyLight) keyLight.castShadow = false;
          if (shadowCatcher) shadowCatcher.visible = false;
          for (const rec of records) rec.mesh.castShadow = false;
        } else if (degradationStep === 2) {
          renderer?.setPixelRatio(1);
        } else if (degradationStep === 3) {
          activeCapScale = 0.5;
          ensure();
        }
      }
    }
  }

  function render() {
    if (!active || !renderer || !scene || !camera) return;
    const t0 = performance.now();
    renderer.render(scene, camera);
    const dur = performance.now() - t0;
    guard(dur);
  }

  function onPointerStateChange(e: Event) {
    if (!active || !currentSkin || records.length === 0) return;
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Find the (single) slab under the pointer before touching computed style.
    let hit: SlabRecord | null = null;
    for (const rec of records) {
      if (rec.el === target || rec.el.contains(target)) {
        hit = rec;
        break;
      }
    }
    if (!hit) return;

    const rootStyle = getComputedStyle(document.documentElement);
    const paint = resolveFrontPaint(hit.el, hit.role, rootStyle);
    hit.frontMat.color.set(paint.hex);
    const pbr = currentSkin.pbr?.[hit.role];
    const frontOpacity = pbr?.frontAlpha ?? paint.alpha;
    hit.frontMat.opacity = frontOpacity;
    hit.frontMat.transparent = frontOpacity < 1;
    hit.frontMat.depthWrite = frontOpacity >= 1;
    schedule();
  }

  function rendererReady(): boolean {
    return !!(THREE && renderer && scene && camera && canvas);
  }

  function onContextLost(e: Event) {
    e.preventDefault();
    const fallbackId = currentSkin?.fallback ?? 'system';
    deactivate();
    notifyFallback(fallbackId);
  }

  /**
   * Lazily load three + create the WebGL context (todo/11). Called only when
   * a webgl-slabs skin is actually active — phones showing a 2D skin never
   * download the engine chunk. The result is cached and a failed boot never
   * retries (`bootFailed`), so a broken GPU cannot loop.
   */
  function ensureBooted(): Promise<boolean> {
    if (rendererReady()) return Promise.resolve(true);
    if (bootFailed) return Promise.resolve(false);
    if (!bootPromise) {
      bootPromise = (async () => {
        try {
          const mod = await import('three');
          if (disposed) return false;
          THREE = mod;
          const T = mod;

          canvas = document.createElement('canvas');
          canvas.style.position = 'fixed';
          canvas.style.inset = '0';
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          canvas.style.zIndex = '-9';
          canvas.style.pointerEvents = 'none';
          canvas.style.display = 'none';
          canvas.addEventListener('webglcontextlost', onContextLost);
          document.body.appendChild(canvas);

          try {
            renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
          } catch {
            // Context creation refused (common on low-end mobile GPUs) → inert 2D.
            canvas.remove();
            canvas = null;
            return false;
          }

          // todo/11: phones cap at 1.5 DPR — a full-screen 2x canvas plus the
          // shadow pass is what loses the context on tile-based GPUs.
          renderer.setPixelRatio(slabPixelRatio(window.devicePixelRatio || 1, window.innerWidth));
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = T.PCFSoftShadowMap;
          renderer.outputColorSpace = T.SRGBColorSpace;
          renderer.toneMapping = T.NoToneMapping;

          scene = new T.Scene();

          const W = window.innerWidth;
          const H = window.innerHeight;
          const D = H / 2 / Math.tan(((FOV / 2) * Math.PI) / 180);

          camera = new T.PerspectiveCamera(FOV, W / H, 0.1, 10000);
          camera.position.set(0, 0, D);
          camera.lookAt(0, 0, 0);

          renderer.setSize(W, H);
          return true;
        } catch {
          renderer = null;
          scene = null;
          camera = null;
          if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
          canvas = null;
          return false;
        }
      })().then((ok) => {
        if (!ok) bootFailed = true;
        return ok;
      });
    }
    return bootPromise;
  }

  function checkActivation() {
    if (disposed) return;
    const skinId = document.documentElement.getAttribute('data-skin') || 'system';
    const fidelity = document.documentElement.getAttribute('data-fidelity');

    if (fidelity === 'low') {
      deactivate();
      return;
    }

    const skin = bundledSkins.find((s) => s.id === skinId);
    if (skin?.renderer !== 'webgl-slabs') {
      deactivate();
      return;
    }

    // Check WebGL2 availability (probed once app-wide — see capabilities.ts).
    // No WebGL2 (low-end phones, emulators, battery-saver modes) ⇒ hand the
    // 3D skin straight back to its 2D fallback, and never even load three.
    if (!supportsWebgl2()) {
      deactivate();
      notifyFallback(skin.fallback ?? 'system');
      return;
    }

    // Boot already failed ⇒ same 2D hand-off, no retry loop.
    if (bootFailed) {
      deactivate();
      notifyFallback(skin.fallback ?? 'system');
      return;
    }

    if (!rendererReady()) {
      ensureBooted().then((ok) => {
        if (disposed) return;
        if (ok) {
          checkActivation();
        } else {
          deactivate();
          notifyFallback(skin.fallback ?? 'system');
        }
      });
      return;
    }

    try {
      if (!active) {
        activate(skin);
      } else if (currentSkinId !== skinId) {
        currentSkinId = skinId;
        reconfigure(skin);
      }
    } catch {
      // An engine init error must degrade to 2D, never crash the page (todo/11).
      failTo2D(skin.fallback ?? 'system');
    }
  }

  function activate(skin: Skin) {
    if (!canvas || !renderer || !scene) return;
    active = true;
    currentSkinId = skin.id;
    canvas.style.display = 'block';
    reconfigure(skin);
  }

  function deactivate() {
    if (!active) return;
    active = false;
    currentSkin = null;
    currentSkinId = '';
    clearSlabFlags();
    teardownScene();
    if (canvas) canvas.style.display = 'none';
  }

  function onResize() {
    if (disposed) return;
    // Trailing debounce (todo/11): mobile browsers fire `resize` continuously
    // while the URL bar collapses/expands — re-running the full geometry
    // rebuild per event janks scrolling on phones.
    if (resizeTimer !== null) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeTimer = null;
      applyResize();
    }, RESIZE_DEBOUNCE_MS);
  }

  function applyResize() {
    if (disposed || !renderer || !camera) return;
    try {
      doResize();
    } catch {
      failTo2D();
    }
  }

  function doResize() {
    if (!renderer || !camera) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const D = H / 2 / Math.tan(((FOV / 2) * Math.PI) / 180);

    // Re-apply the small-device pixel-ratio policy (rotation can cross the
    // small-viewport boundary) before resizing the drawing buffer.
    renderer.setPixelRatio(slabPixelRatio(window.devicePixelRatio || 1, W));

    camera.aspect = W / H;
    camera.position.set(0, 0, D);
    camera.updateProjectionMatrix();

    renderer.setSize(W, H);

    if (keyLight && currentSkin?.lighting) {
      keyLight.shadow.camera.left = -0.75 * W;
      keyLight.shadow.camera.right = 0.75 * W;
      keyLight.shadow.camera.top = 0.75 * H;
      keyLight.shadow.camera.bottom = -0.75 * H;
      const R = Math.max(W, H) * 1.2;
      keyLight.shadow.camera.far = 4 * R;
      const mapSize = slabShadowMapSize(W);
      if (keyLight.shadow.mapSize.width !== mapSize) {
        keyLight.shadow.mapSize.set(mapSize, mapSize);
        keyLight.shadow.map?.dispose();
        keyLight.shadow.map = null;
      }
      keyLight.castShadow = shadowsAllowed();
      keyLight.shadow.camera.updateProjectionMatrix();
    }

    if (shadowCatcher) {
      shadowCatcher.visible = shadowsAllowed();
      shadowCatcher.geometry.dispose();
      if (THREE) shadowCatcher.geometry = new THREE.PlaneGeometry(2 * W, 2 * H);
    }

    for (const rec of records) {
      rec.mesh.castShadow = shadowsAllowed();
    }

    ensure();
    schedule();
  }

  // Synchronous, allocation-light: three + the GL context are NOT created
  // here — ensureBooted() loads them lazily the moment a webgl-slabs skin is
  // active (todo/11: 2D-skin phones never download the engine chunk).
  function init() {
    if (disposed) return;
    window.addEventListener('scroll', schedule, { capture: true, passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    container.addEventListener('pointerover', onPointerStateChange, {
      capture: true,
      passive: true,
    });
    container.addEventListener('pointerout', onPointerStateChange, {
      capture: true,
      passive: true,
    });
    container.addEventListener('pointerdown', onPointerStateChange, {
      capture: true,
      passive: true,
    });
    container.addEventListener('pointerup', onPointerStateChange, { capture: true, passive: true });

    // Root observer for skin/theme/fidelity changes
    rootObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes') {
          if (m.attributeName === 'data-skin' || m.attributeName === 'data-fidelity') {
            checkActivation();
          } else if (m.attributeName === 'data-theme' || m.attributeName === 'data-accent') {
            if (active && currentSkin) {
              invalidateElevations();
              const rootStyle = getComputedStyle(document.documentElement);
              for (const rec of records) {
                const paint = resolveFrontPaint(rec.el, rec.role, rootStyle);
                rec.frontMat.color.set(paint.hex);
              }
              schedule();
            }
          }
        }
      }
    });
    rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-skin', 'data-theme', 'data-accent', 'data-fidelity'],
    });

    // DOM observer for DOM tree changes
    domObserver = new MutationObserver(() => {
      scheduleEnsure();
    });
    domObserver.observe(container, {
      childList: true,
      subtree: true,
    });

    checkActivation();
  }

  init();

  // Shared by dispose() and any fatal engine error: release every listener,
  // observer, timer, GL resource and the canvas itself — idempotent.
  function teardownRuntime() {
    active = false;
    currentSkin = null;
    currentSkinId = '';

    if (rAFId !== null) {
      cancelAnimationFrame(rAFId);
      rAFId = null;
    }
    if (ensureTimeout !== null) {
      clearTimeout(ensureTimeout);
      ensureTimeout = null;
    }
    if (resizeTimer !== null) {
      clearTimeout(resizeTimer);
      resizeTimer = null;
    }

    window.removeEventListener('scroll', schedule, { capture: true });
    window.removeEventListener('resize', onResize);

    container.removeEventListener('pointerover', onPointerStateChange, { capture: true });
    container.removeEventListener('pointerout', onPointerStateChange, { capture: true });
    container.removeEventListener('pointerdown', onPointerStateChange, { capture: true });
    container.removeEventListener('pointerup', onPointerStateChange, { capture: true });

    rootObserver?.disconnect();
    rootObserver = null;
    domObserver?.disconnect();
    domObserver = null;

    clearSlabFlags();
    teardownScene();

    if (renderer) {
      try {
        renderer.dispose();
        renderer.forceContextLoss();
      } catch {}
      renderer = null;
    }
    scene = null;
    camera = null;

    if (canvas?.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
    canvas = null;
  }

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      teardownRuntime();
    },
  };
}
