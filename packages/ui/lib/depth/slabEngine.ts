import type * as ThreeType from 'three';
import { bundledSkins } from '../../skins';
import { supportsWebgl2 } from '../skin/capabilities';
import type { Lighting, Pbr, Role, Skin } from '../skin/types';
import { SLAB_ROLES } from '../skin/types';

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
      update();
      render();
    });
  }

  function scheduleEnsure() {
    if (disposed || !active) return;
    if (ensureTimeout !== null) clearTimeout(ensureTimeout);
    ensureTimeout = setTimeout(() => {
      ensureTimeout = null;
      if (disposed || !active) return;
      ensure();
      schedule();
    }, 150);
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

    keyLight.castShadow = degradationStep === 0;
    keyLight.shadow.camera.left = -0.75 * W;
    keyLight.shadow.camera.right = 0.75 * W;
    keyLight.shadow.camera.top = 0.75 * H;
    keyLight.shadow.camera.bottom = -0.75 * H;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 4 * R;
    // 1024² is plenty for screen-space slabs and roughly halves the shadow
    // pass cost vs 2048² (the single biggest GPU cost of the engine).
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
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
    shadowCatcher.visible = degradationStep === 0;
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
    const isMobile = W <= 430;
    const baseCap = isMobile
      ? (currentSkin.slabCap?.mobile ?? 36)
      : (currentSkin.slabCap?.desktop ?? 80);
    const effectiveCap = Math.max(4, Math.floor(baseCap * activeCapScale));

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
        mesh.castShadow = degradationStep === 0;
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
    if (!supportsWebgl2()) {
      deactivate();
      return;
    }

    if (!active) {
      activate(skin);
    } else if (currentSkinId !== skinId) {
      currentSkinId = skinId;
      reconfigure(skin);
    }
  }

  function activate(skin: Skin) {
    if (!canvas) return;
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
    if (disposed || !renderer || !camera) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const D = H / 2 / Math.tan(((FOV / 2) * Math.PI) / 180);

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
      keyLight.shadow.camera.updateProjectionMatrix();
    }

    if (shadowCatcher) {
      shadowCatcher.geometry.dispose();
      if (THREE) shadowCatcher.geometry = new THREE.PlaneGeometry(2 * W, 2 * H);
    }

    ensure();
    schedule();
  }

  async function init() {
    try {
      THREE = await import('three');
    } catch {
      // Three.js not available; engine remains inert
      return;
    }

    if (disposed) return;
    const T = THREE;

    canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-9';
    canvas.style.pointerEvents = 'none';
    canvas.style.display = 'none';

    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      onFallback(currentSkin?.fallback ?? 'system');
      deactivate();
    });

    document.body.appendChild(canvas);

    try {
      renderer = new T.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      });
    } catch {
      canvas.remove();
      canvas = null;
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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

    // Window / container listeners
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

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      active = false;

      if (rAFId !== null) cancelAnimationFrame(rAFId);
      if (ensureTimeout !== null) clearTimeout(ensureTimeout);

      window.removeEventListener('scroll', schedule, { capture: true });
      window.removeEventListener('resize', onResize);

      container.removeEventListener('pointerover', onPointerStateChange, { capture: true });
      container.removeEventListener('pointerout', onPointerStateChange, { capture: true });
      container.removeEventListener('pointerdown', onPointerStateChange, { capture: true });
      container.removeEventListener('pointerup', onPointerStateChange, { capture: true });

      rootObserver?.disconnect();
      domObserver?.disconnect();

      clearSlabFlags();
      teardownScene();

      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
      }

      if (canvas?.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    },
  };
}
