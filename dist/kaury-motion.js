/*! Kaury Motion v0.1.0 | MIT | https://kaury.studio */

// src/core/ease.ts
function cubicBezier(x1, y1, x2, y2) {
  if (x1 === y1 && x2 === y2) return (t) => t;
  const ax = 3 * x1 - 3 * x2 + 1, bx = 3 * x2 - 6 * x1, cx = 3 * x1;
  const ay = 3 * y1 - 3 * y2 + 1, by = 3 * y2 - 6 * y1, cy = 3 * y1;
  const sampleX = (s) => ((ax * s + bx) * s + cx) * s;
  const sampleY = (s) => ((ay * s + by) * s + cy) * s;
  const slopeX = (s) => (3 * ax * s + 2 * bx) * s + cx;
  const solve = (x) => {
    let s = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(s) - x;
      if (Math.abs(err) < 1e-6) return s;
      const d = slopeX(s);
      if (Math.abs(d) < 1e-6) break;
      s -= err / d;
    }
    let lo = 0, hi = 1;
    s = x;
    while (lo < hi) {
      const v = sampleX(s);
      if (Math.abs(v - x) < 1e-6) return s;
      if (x > v) lo = s;
      else hi = s;
      s = (lo + hi) / 2;
      if (hi - lo < 1e-7) break;
    }
    return s;
  };
  return (t) => t <= 0 ? 0 : t >= 1 ? 1 : sampleY(solve(t));
}
function spring({ mass = 1, stiffness = 120, damping = 12, velocity = 0 } = {}) {
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
  const a = 1, b = zeta < 1 ? (zeta * w0 - velocity) / wd : -velocity + w0;
  const at = (sec) => {
    let p;
    if (zeta < 1) p = Math.exp(-sec * zeta * w0) * (a * Math.cos(wd * sec) + b * Math.sin(wd * sec));
    else p = (a + b * sec) * Math.exp(-sec * w0);
    return 1 - p;
  };
  let settle = 0, still = 0;
  for (let s = 0; s < 10; s += 1 / 120) {
    if (Math.abs(1 - at(s)) < 1e-3) {
      if (++still > 12) {
        settle = s;
        break;
      }
    } else still = 0;
  }
  if (!settle) settle = 10;
  const ease = (t) => t <= 0 ? 0 : t >= 1 ? 1 : at(t * settle);
  ease.duration = Math.round(settle * 1e3);
  return ease;
}
var pow = (p) => ({
  in: (t) => t ** p,
  out: (t) => 1 - (1 - t) ** p,
  inOut: (t) => t < 0.5 ? 2 ** (p - 1) * t ** p : 1 - (-2 * t + 2) ** p / 2
});
var q = pow(2);
var c = pow(3);
var qu = pow(4);
var qi = pow(5);
var c1 = 1.70158;
var c3 = c1 + 1;
var easings = {
  linear: (t) => t,
  inQuad: q.in,
  outQuad: q.out,
  inOutQuad: q.inOut,
  inCubic: c.in,
  outCubic: c.out,
  inOutCubic: c.inOut,
  inQuart: qu.in,
  outQuart: qu.out,
  inOutQuart: qu.inOut,
  inQuint: qi.in,
  outQuint: qi.out,
  inOutQuint: qi.inOut,
  inSine: (t) => 1 - Math.cos(t * Math.PI / 2),
  outSine: (t) => Math.sin(t * Math.PI / 2),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  inExpo: (t) => t === 0 ? 0 : 2 ** (10 * t - 10),
  outExpo: (t) => t === 1 ? 1 : 1 - 2 ** (-10 * t),
  inOutExpo: (t) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2,
  inBack: (t) => c3 * t ** 3 - c1 * t ** 2,
  outBack: (t) => 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2,
  outElastic: (t) => t === 0 ? 0 : t === 1 ? 1 : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1,
  outBounce: (t) => {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
  },
  /** The Kaury Studio house curve: fast start, long silky finish. */
  kaury: cubicBezier(0.16, 1, 0.3, 1)
};
function resolveEase(e) {
  if (typeof e === "function") return e;
  if (!e) return easings.kaury;
  const m = /^(cubic-bezier|spring)\(([^)]*)\)$/.exec(e.replace(/\s/g, ""));
  if (m) {
    const n = m[2].split(",").filter(Boolean).map(Number);
    if (m[1] === "cubic-bezier" && n.length === 4) return cubicBezier(n[0], n[1], n[2], n[3]);
    if (m[1] === "spring") return spring({ mass: n[0], stiffness: n[1], damping: n[2], velocity: n[3] });
  }
  const found = easings[e];
  if (!found) throw new Error(`[kaury-motion] Unknown easing "${e}"`);
  return found;
}

// src/core/interpolate.ts
var NUM = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;
function hexToRgba(hex) {
  let h = hex.slice(1);
  if (h.length === 3 || h.length === 4) h = [...h].map((c2) => c2 + c2).join("");
  const n = parseInt(h.slice(0, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1;
  return `rgba(${n >> 16 & 255}, ${n >> 8 & 255}, ${n & 255}, ${+a.toFixed(3)})`;
}
function normalise(v) {
  let s = String(v).trim();
  s = s.replace(/#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi, hexToRgba);
  s = s.replace(/rgb\(\s*([^,)]+),\s*([^,)]+),\s*([^,)]+)\)/g, "rgba($1, $2, $3, 1)");
  return s;
}
function parse(v) {
  const s = normalise(v);
  const nums = (s.match(NUM) || []).map(Number);
  const parts = s.split(NUM);
  return { nums, parts };
}
function unitOf(v) {
  const m = /^-?\d*\.?\d+(?:e[-+]?\d+)?([a-z%]*)$/i.exec(String(v).trim());
  return m ? m[1] : "";
}
function interpolator(from, to) {
  if (typeof from === "number" && typeof to === "number") return (t) => from + (to - from) * t;
  let a = parse(from);
  const b = parse(to);
  let b2 = b;
  if (a.nums.length === 1 && b.nums.length === 1 && a.parts.join("|") !== b.parts.join("|")) {
    if (a.parts.join("") === "" || a.nums[0] === 0) a = { nums: a.nums, parts: b.parts };
    else if (b.parts.join("") === "" || b.nums[0] === 0) b2 = { nums: b.nums, parts: a.parts };
  }
  const bb = b2;
  if (a.nums.length !== bb.nums.length || a.parts.join("|") !== bb.parts.join("|")) {
    return (t) => t < 1 ? from : to;
  }
  const { parts } = bb;
  const channel = [];
  let prefix = "";
  for (let i = 0; i < bb.nums.length; i++) {
    prefix += parts[i];
    const open = prefix.lastIndexOf("rgba(");
    const inside = open >= 0 && prefix.indexOf(")", open) < 0;
    channel.push(inside && (prefix.slice(open).match(/,/g) || []).length < 3);
    prefix += "0";
  }
  return (t) => {
    let out = parts[0];
    for (let i = 0; i < bb.nums.length; i++) {
      const n = a.nums[i] + (bb.nums[i] - a.nums[i]) * t;
      out += (channel[i] ? Math.round(clamp(n, 0, 255)) : Math.round(n * 1e4) / 1e4) + parts[i + 1];
    }
    return out;
  };
}
var clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
var lerp = (a, b, t) => a + (b - a) * t;
var mapRange = (v, a, b, c2, d) => c2 + (v - a) / (b - a) * (d - c2);

// src/core/ticker.ts
var subs = /* @__PURE__ */ new Set();
var running = false;
var last = 0;
var now = () => typeof performance !== "undefined" ? performance.now() : Date.now();
var raf = typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : (cb) => setTimeout(() => cb(now()), 16);
function loop(t) {
  const delta = Math.min(t - last, 64);
  last = t;
  subs.forEach((fn) => fn(t, delta));
  if (subs.size) raf(loop);
  else running = false;
}
var ticker = {
  add(fn) {
    subs.add(fn);
    if (!running) {
      running = true;
      last = now();
      raf(loop);
    }
    return () => ticker.remove(fn);
  },
  remove(fn) {
    subs.delete(fn);
  },
  now
};
var config = {
  /** 'auto' follows the OS "reduce motion" setting; 'always' / 'never' force it. */
  reducedMotion: "auto"
};
function prefersReducedMotion() {
  if (config.reducedMotion !== "auto") return config.reducedMotion === "always";
  return typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// src/core/playback.ts
var Playback = class {
  constructor(opts = {}) {
    /** Length of one iteration in ms. */
    this.duration = 0;
    this.currentTime = 0;
    this.paused = true;
    this.reversed = false;
    this.completed = false;
    this.began = false;
    this.lastIteration = 0;
    this.tick = (_, delta) => {
      var _a, _b;
      if (this.paused) return;
      if (!this.began) {
        this.began = true;
        (_b = (_a = this.opts).onBegin) == null ? void 0 : _b.call(_a, this);
      }
      const next = this.currentTime + delta * this.speed * (this.reversed ? -1 : 1);
      this.seek(next);
      const done = this.reversed ? next <= 0 : next >= this.totalDuration;
      if (done) this.complete();
    };
    var _a;
    this.opts = opts;
    this.speed = (_a = opts.speed) != null ? _a : 1;
    this.iterations = opts.loop === true ? Infinity : typeof opts.loop === "number" ? Math.max(1, opts.loop) : 1;
    this.yoyo = !!opts.yoyo;
    this.resetPromise();
  }
  resetPromise() {
    this.finished = new Promise((r) => this.resolveFinished = r);
  }
  get totalDuration() {
    return this.duration === 0 ? 0 : this.duration * this.iterations;
  }
  /** 0..1 over the whole playback (all iterations). */
  get progress() {
    const total = this.totalDuration;
    return total === Infinity ? this.currentTime % this.duration / this.duration : total ? this.currentTime / total : 1;
  }
  seek(time) {
    var _a, _b, _c, _d;
    const total = this.totalDuration;
    const t = Math.max(0, Math.min(time, total));
    this.currentTime = t;
    const d = this.duration;
    let iteration = d > 0 ? Math.floor(t / d) : 0;
    let local = d > 0 ? t - iteration * d : 0;
    if (d > 0 && t === total && total !== Infinity) {
      iteration = this.iterations - 1;
      local = d;
    }
    if (iteration !== this.lastIteration) {
      this.lastIteration = iteration;
      (_b = (_a = this.opts).onLoop) == null ? void 0 : _b.call(_a, this);
    }
    if (this.yoyo && iteration % 2 === 1) local = d - local;
    this.render(local);
    (_d = (_c = this.opts).onUpdate) == null ? void 0 : _d.call(_c, this);
    return this;
  }
  complete() {
    var _a, _b;
    this.paused = true;
    this.completed = true;
    ticker.remove(this.tick);
    (_b = (_a = this.opts).onComplete) == null ? void 0 : _b.call(_a, this);
    this.resolveFinished(this);
  }
  play() {
    var _a, _b;
    if (this.completed) {
      this.completed = false;
      this.resetPromise();
      this.seek(this.reversed ? this.totalDuration : 0);
    }
    if (this.totalDuration === 0) {
      this.render(0);
      (_b = (_a = this.opts).onUpdate) == null ? void 0 : _b.call(_a, this);
      this.complete();
      return this;
    }
    this.paused = false;
    ticker.add(this.tick);
    return this;
  }
  pause() {
    this.paused = true;
    ticker.remove(this.tick);
    return this;
  }
  /** Flips direction and keeps playing from the current point. */
  reverse() {
    this.reversed = !this.reversed;
    if (this.completed) {
      this.completed = false;
      this.resetPromise();
    }
    return this.play();
  }
  restart() {
    this.pause();
    this.completed = false;
    this.began = false;
    this.resetPromise();
    this.seek(this.reversed ? this.totalDuration : 0);
    return this.play();
  }
  /** Jumps to the end state and resolves. */
  finish() {
    this.pause();
    if (this.totalDuration !== Infinity) this.seek(this.reversed ? 0 : this.totalDuration);
    this.complete();
    return this;
  }
};

// src/core/animate.ts
function toArray(targets) {
  if (!targets) return [];
  if (typeof targets === "string") return typeof document === "undefined" ? [] : Array.from(document.querySelectorAll(targets));
  if (typeof Element !== "undefined" && targets instanceof Element) return [targets];
  if (Array.isArray(targets)) return targets.flatMap((t) => toArray(t));
  if (typeof targets.length === "number" && typeof targets !== "function") {
    return Array.from(targets);
  }
  return [targets];
}
var TRANSFORMS = ["x", "y", "z", "translateX", "translateY", "translateZ", "perspective", "rotate", "rotateX", "rotateY", "rotateZ", "scale", "scaleX", "scaleY", "scaleZ", "skewX", "skewY"];
var ALIAS = { x: "translateX", y: "translateY", z: "translateZ" };
var ORDER = ["perspective", "translateX", "translateY", "translateZ", "rotate", "rotateX", "rotateY", "rotateZ", "scale", "scaleX", "scaleY", "scaleZ", "skewX", "skewY"];
var defaultUnit = (p) => /^(translate|perspective)/.test(p) ? "px" : /^(rotate|skew)/.test(p) ? "deg" : "";
var defaultValue = (p) => p.startsWith("scale") ? "1" : "0" + defaultUnit(p);
var transformState = /* @__PURE__ */ new WeakMap();
function stateOf(el) {
  let s = transformState.get(el);
  if (!s) transformState.set(el, s = {});
  return s;
}
function writeTransform(el) {
  const s = stateOf(el);
  let out = "";
  for (const p of ORDER) if (s[p] !== void 0) out += `${p}(${s[p]}) `;
  el.style.transform = out.trim();
}
function getTransform(el, prop) {
  var _a;
  const p = ALIAS[prop] || prop;
  return (_a = stateOf(el)[p]) != null ? _a : defaultValue(p);
}
function set(targets, props) {
  const els = toArray(targets);
  els.forEach((el, i) => {
    for (const k in props) {
      const raw = props[k];
      const v = typeof raw === "function" ? raw(el, i, els.length) : raw;
      const kind = kindOf(el, k);
      apply(el, k, kind, withUnit(k, kind, v));
    }
    if (isEl(el) && Object.keys(props).some((k) => TRANSFORMS.includes(k))) writeTransform(el);
  });
}
var isEl = (t) => typeof Element !== "undefined" && t instanceof Element;
var UNITLESS = /* @__PURE__ */ new Set(["opacity", "zIndex", "fontWeight", "lineHeight", "flexGrow", "flexShrink", "order", "zoom", "fillOpacity", "strokeOpacity", "strokeDashoffset", "scale"]);
function kindOf(t, p) {
  if (!isEl(t)) return "prop";
  if (TRANSFORMS.includes(p)) return "transform";
  if (p.startsWith("--") || p in t.style) return "css";
  if (t.hasAttribute(p) || typeof SVGElement !== "undefined" && t instanceof SVGElement) return "attr";
  return "prop";
}
function read(t, p, kind) {
  var _a, _b;
  if (kind === "transform") return getTransform(t, p);
  if (kind === "css") {
    const cs = getComputedStyle(t);
    const v = p.startsWith("--") ? cs.getPropertyValue(p) : cs[p];
    return v === "" || v == null ? t.style[p] || "0" : v;
  }
  if (kind === "attr") return (_a = t.getAttribute(p)) != null ? _a : "0";
  return (_b = t[p]) != null ? _b : 0;
}
function apply(t, p, kind, v) {
  if (kind === "transform") stateOf(t)[ALIAS[p] || p] = String(v);
  else if (kind === "css") p.startsWith("--") ? t.style.setProperty(p, String(v)) : t.style[p] = v;
  else if (kind === "attr") t.setAttribute(p, String(v));
  else t[p] = v;
}
function withUnit(p, kind, v) {
  if (typeof v !== "number") return v;
  if (kind === "transform") return v + defaultUnit(ALIAS[p] || p);
  if (kind === "css" && !UNITLESS.has(p) && !p.startsWith("--")) return v + "px";
  return v;
}
function relative(from, to) {
  var _a;
  const m = typeof to === "string" && /^([+\-*])=(.*)$/.exec(to);
  if (!m) return to;
  const a = (_a = parse(from).nums[0]) != null ? _a : 0;
  const b = parseFloat(m[2]);
  const unit = unitOf(m[2]) || unitOf(from);
  const r = m[1] === "+" ? a + b : m[1] === "-" ? a - b : a * b;
  return typeof from === "number" && !unit ? r : r + unit;
}
var Tween = class extends Playback {
  constructor(targets, props, opts = {}) {
    super(opts);
    this.items = [];
    this.targets = toArray(targets);
    const reduce = prefersReducedMotion();
    const n = this.targets.length;
    const baseEase = resolveEase(opts.ease);
    this.targets.forEach((target, i) => {
      var _a, _b, _c;
      const call = (v, d) => typeof v === "function" ? v(target, i, n) : v != null ? v : d;
      for (const prop in props) {
        let raw = props[prop];
        if (typeof raw === "function") raw = raw(target, i, n);
        const obj = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : null;
        const ease = (obj == null ? void 0 : obj.ease) ? resolveEase(obj.ease) : baseEase;
        const kind = kindOf(target, prop);
        const pair = Array.isArray(raw) ? raw : obj ? [obj.from, obj.to] : [void 0, raw];
        const item = {
          target,
          prop,
          kind,
          from: pair[0] === void 0 ? void 0 : withUnit(prop, kind, pair[0]),
          to: withUnit(prop, kind, pair[1]),
          delay: reduce ? 0 : (_a = obj == null ? void 0 : obj.delay) != null ? _a : call(opts.delay, 0),
          duration: reduce ? 0 : (_c = obj == null ? void 0 : obj.duration) != null ? _c : call(opts.duration, (_b = ease.duration) != null ? _b : 800),
          ease
        };
        if (item.from !== void 0) this.prepare(item);
        this.items.push(item);
      }
    });
    this.duration = this.items.reduce((m, it) => Math.max(m, it.delay + it.duration), 0);
    if (this.items.some((it) => it.from !== void 0)) this.flush(new Set(this.items.filter((it) => it.from !== void 0)));
    if (opts.autoplay !== false) this.play();
  }
  prepare(it) {
    var _a;
    const from = (_a = it.from) != null ? _a : read(it.target, it.prop, it.kind);
    const to = relative(from, it.to);
    it.mix = interpolator(from, to);
    if (it.from !== void 0) apply(it.target, it.prop, it.kind, it.mix(0));
  }
  flush(items) {
    const dirty = /* @__PURE__ */ new Set();
    items.forEach((it) => it.kind === "transform" && dirty.add(it.target));
    dirty.forEach(writeTransform);
  }
  render(local) {
    const dirty = /* @__PURE__ */ new Set();
    for (const it of this.items) {
      if (!it.mix) {
        if (local < it.delay && it.from === void 0) continue;
        this.prepare(it);
      }
      const p = it.duration === 0 ? local >= it.delay ? 1 : 0 : Math.max(0, Math.min(1, (local - it.delay) / it.duration));
      apply(it.target, it.prop, it.kind, it.mix(it.ease(p)));
      if (it.kind === "transform") dirty.add(it.target);
    }
    dirty.forEach(writeTransform);
  }
};
function animate(targets, props, opts) {
  return new Tween(targets, props, opts);
}

// src/core/timeline.ts
var Timeline = class extends Playback {
  constructor(opts = {}) {
    var _a;
    super(opts);
    this.children = [];
    this.scheduled = false;
    this.defaults = (_a = opts.defaults) != null ? _a : {};
    if (opts.autoplay !== false) {
      this.scheduled = true;
      queueMicrotask(() => this.scheduled && this.play());
    }
  }
  resolve(pos) {
    var _a;
    const end = this.duration;
    const prev = this.children[this.children.length - 1];
    if (pos === void 0) return end;
    if (typeof pos === "number") return pos;
    const m = /^(<)?([+-]=)?(-?\d*\.?\d+)?$/.exec(pos.replace(/\s/g, ""));
    if (!m) throw new Error(`[kaury-motion] Bad timeline position "${pos}"`);
    const base = m[1] ? (_a = prev == null ? void 0 : prev.start) != null ? _a : 0 : end;
    const n = m[3] ? parseFloat(m[3]) : 0;
    if (!m[2]) return m[1] ? base + n : n;
    return m[2] === "+=" ? base + n : base - n;
  }
  add(a, b, c2, d) {
    let anim, pos;
    if (a instanceof Playback) {
      anim = a.pause();
      pos = b;
    } else {
      anim = new Tween(a, b, { ...this.defaults, ...c2, autoplay: false });
      pos = d;
    }
    const start = Math.max(0, this.resolve(pos));
    this.children.push({ anim, start, touched: false });
    this.duration = Math.max(this.duration, start + anim.totalDuration);
    return this;
  }
  /** Runs a function at a point in time. */
  call(fn, position) {
    const at = Math.max(0, this.resolve(position));
    let fired = false;
    const cb = new class extends Playback {
      render(local) {
        if (local > 0 && !fired) fired = true, fn();
        if (local === 0) fired = false;
      }
    }();
    cb.duration = 1;
    this.children.push({ anim: cb, start: at, touched: false });
    this.duration = Math.max(this.duration, at + 1);
    return this;
  }
  play() {
    this.scheduled = false;
    return super.play();
  }
  pause() {
    this.scheduled = false;
    return super.pause();
  }
  render(local) {
    for (const c2 of this.children) {
      const t = local - c2.start;
      if (t >= 0) {
        c2.anim.seek(t);
        c2.touched = true;
      } else if (c2.touched) {
        c2.anim.seek(0);
        c2.touched = false;
      }
    }
  }
};
function timeline(opts) {
  return new Timeline(opts);
}

// src/core/stagger.ts
function stagger(each, opts = {}) {
  const { from = "first", start = 0, grid, axis } = opts;
  const ease = opts.ease ? resolveEase(opts.ease) : null;
  let cache = null;
  let cachedFor = -1;
  return (_el, i, total) => {
    if (!cache || cachedFor !== total) {
      cachedFor = total;
      const origin = from === "first" ? 0 : from === "last" ? total - 1 : from === "center" || from === "edges" ? (total - 1) / 2 : typeof from === "number" ? from : 0;
      const dist = [];
      for (let k = 0; k < total; k++) {
        if (from === "random") dist.push(Math.random() * (total - 1));
        else if (grid) {
          const [cols] = grid;
          const ox = origin % cols, oy = Math.floor(origin / cols);
          const fx = from === "center" ? (cols - 1) / 2 : ox;
          const fy = from === "center" ? (grid[1] - 1) / 2 : oy;
          const dx = k % cols - fx, dy = Math.floor(k / cols) - fy;
          dist.push(axis === "x" ? Math.abs(dx) : axis === "y" ? Math.abs(dy) : Math.hypot(dx, dy));
        } else dist.push(Math.abs(origin - k));
      }
      let max = Math.max(...dist, 0);
      if (from === "edges") {
        for (let k = 0; k < total; k++) dist[k] = max - dist[k];
        max = Math.max(...dist, 0);
      }
      cache = dist.map((d) => {
        const norm = max ? d / max : 0;
        const e = ease ? ease(norm) * max : d;
        if (Array.isArray(each)) return start + each[0] + (each[1] - each[0]) * (max ? e / max : 0);
        return start + e * each;
      });
    }
    return cache[i];
  };
}

// src/fx/split.ts
var originals = /* @__PURE__ */ new WeakMap();
function span(cls, style, text) {
  const s = document.createElement("span");
  s.className = cls;
  s.setAttribute("style", style);
  if (text !== void 0) s.textContent = text;
  return s;
}
var MASK_STYLE = "display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.12em;margin-bottom:-.12em";
function splitOne(el, opts) {
  var _a, _b;
  if (!originals.has(el)) originals.set(el, el.innerHTML);
  else el.innerHTML = originals.get(el);
  const type = (_a = opts.type) != null ? _a : "words";
  const wantChars = type.includes("chars");
  const wantLines = type.includes("lines");
  const text = (_b = el.textContent) != null ? _b : "";
  el.setAttribute("aria-label", text.trim().replace(/\s+/g, " "));
  el.textContent = "";
  const words = [];
  const chars = [];
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  tokens.forEach((token, wi) => {
    const w = span("km-word", "display:inline-block;white-space:nowrap");
    w.setAttribute("aria-hidden", "true");
    if (wantChars) {
      for (const ch of Array.from(token)) {
        const c2 = span("km-char", "display:inline-block", ch);
        chars.push(c2);
        w.appendChild(opts.mask && !wantLines ? wrapMask(c2) : c2);
      }
    } else w.textContent = token;
    words.push(w);
    el.appendChild(opts.mask && !wantChars && !wantLines ? wrapMask(w) : w);
    if (wi < tokens.length - 1) el.appendChild(document.createTextNode(" "));
  });
  const lines = [];
  if (wantLines) {
    const rows = [];
    let top = null;
    for (const w of words) {
      const t = w.offsetTop;
      if (top === null || Math.abs(t - top) > 2) rows.push([]), top = t;
      rows[rows.length - 1].push(w);
    }
    el.textContent = "";
    rows.forEach((row) => {
      const line = span("km-line", "display:block");
      const inner = span("km-line-inner", "display:inline-block");
      row.forEach((w, i) => {
        inner.appendChild(w);
        if (i < row.length - 1) inner.appendChild(document.createTextNode(" "));
      });
      line.appendChild(inner);
      if (opts.mask) line.setAttribute("style", "display:block;overflow:hidden;padding-bottom:.12em;margin-bottom:-.12em");
      el.appendChild(line);
      lines.push(inner);
    });
  }
  const units = wantChars ? chars : wantLines ? lines : words;
  return {
    el,
    chars,
    words,
    lines,
    units,
    revert() {
      var _a2;
      el.innerHTML = (_a2 = originals.get(el)) != null ? _a2 : text;
      originals.delete(el);
      el.removeAttribute("aria-label");
    }
  };
}
function wrapMask(child) {
  const m = span("km-mask", MASK_STYLE);
  m.appendChild(child);
  return m;
}
function split(targets, opts = {}) {
  var _a;
  const results = toArray(targets).map((el) => splitOne(el, opts));
  if (results.length === 1) return results[0];
  const pick = (k) => results.flatMap((r) => r[k]);
  return {
    el: (_a = results[0]) == null ? void 0 : _a.el,
    chars: pick("chars"),
    words: pick("words"),
    lines: pick("lines"),
    units: pick("units"),
    revert: () => results.forEach((r) => r.revert())
  };
}

// src/fx/text.ts
var presets = {
  rise: { y: ["110%", "0%"] },
  fade: { opacity: [0, 1], y: [18, 0] },
  blur: { opacity: [0, 1], filter: ["blur(12px)", "blur(0px)"], y: [10, 0] },
  flip: { rotateX: [-95, 0], opacity: [0, 1], y: ["40%", "0%"] },
  pop: { scale: [0, 1], opacity: [0, 1] },
  slide: { x: ["-60%", "0%"], opacity: [0, 1] },
  swing: { rotate: [14, 0], y: ["120%", "0%"] },
  zoom: { scale: [2.2, 1], opacity: [0, 1], filter: ["blur(8px)", "blur(0px)"] },
  /** Typewriter: each piece appears at once, the stagger sets the typing speed. */
  type: { opacity: [0, 1] }
};
function reveal(targets, opts = {}) {
  const { effect = "rise", by = "words", each, staggerFrom, ...anim } = opts;
  const props = typeof effect === "string" ? presets[effect] : effect;
  if (!props) throw new Error(`[kaury-motion] Unknown reveal effect "${effect}"`);
  const needsMask = effect === "rise" || effect === "swing" || effect === "flip";
  const s = split(targets, { type: by, mask: needsMask });
  if (effect === "flip") s.units.forEach((u) => u.parentElement.style.perspective = "600px");
  return animate(s.units, props, {
    duration: effect === "type" ? 1 : 1100,
    ease: "kaury",
    ...anim,
    delay: stagger(each != null ? each : by === "chars" ? 28 : by === "lines" ? 110 : 60, { from: staggerFrom, start: typeof anim.delay === "number" ? anim.delay : 0 })
  });
}
var GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/\\?!";
function scramble(target, opts = {}) {
  var _a, _b, _c;
  const el = toArray(target)[0];
  const final = (_b = (_a = opts.text) != null ? _a : el.textContent) != null ? _b : "";
  const pool = (_c = opts.chars) != null ? _c : GLYPHS;
  const state = { p: 0 };
  el.setAttribute("aria-label", final);
  let lastFrame = -1;
  let cached = "";
  return animate(state, { p: [0, 1] }, {
    duration: Math.max(600, final.length * 45),
    ease: "linear",
    ...opts,
    onUpdate: (self) => {
      var _a2;
      const frame = Math.floor(self.currentTime / 33);
      if (frame !== lastFrame || state.p === 1) {
        lastFrame = frame;
        cached = Array.from(final).map((ch, i) => ch === " " || state.p >= (i + 1) / final.length ? ch : pool[Math.random() * pool.length | 0]).join("");
        el.textContent = cached;
      }
      (_a2 = opts.onUpdate) == null ? void 0 : _a2.call(opts, self);
    }
  });
}
function counter(target, opts) {
  const el = toArray(target)[0];
  const { from = 0, to, decimals = 0, prefix = "", suffix = "", separator = "\u202F", ...anim } = opts;
  const state = { v: from };
  const fmt = (v) => {
    const [int, dec] = v.toFixed(decimals).split(".");
    return prefix + int.replace(/\B(?=(\d{3})+(?!\d))/g, separator) + (dec ? "." + dec : "") + suffix;
  };
  el.textContent = fmt(from);
  return animate(state, { v: [from, to] }, {
    duration: 1800,
    ease: "outExpo",
    ...anim,
    onUpdate: (self) => {
      var _a;
      el.textContent = fmt(state.v);
      (_a = anim.onUpdate) == null ? void 0 : _a.call(anim, self);
    }
  });
}
function wave(targets, opts = {}) {
  const { amplitude = 14, duration = 1400, offset = 0.08, by = "chars", rotate = 0 } = opts;
  const s = split(targets, { type: by });
  if (prefersReducedMotion()) return () => s.revert();
  const start = ticker.now();
  const stop = ticker.add((t) => {
    const phase = (t - start) / duration * Math.PI * 2;
    s.units.forEach((u, i) => {
      const k = Math.sin(phase - i * offset * Math.PI * 2);
      set(u, rotate ? { y: +(-k * amplitude).toFixed(2), rotate: +(k * rotate).toFixed(2) } : { y: +(-k * amplitude).toFixed(2) });
    });
  });
  return () => {
    stop();
    s.revert();
  };
}

// src/fx/scroll.ts
function inView(targets, onEnter, opts = {}) {
  const { threshold = 0.2, rootMargin = "0px", once = true } = opts;
  const els = toArray(targets);
  if (typeof IntersectionObserver === "undefined") {
    els.forEach((el) => onEnter(el));
    return () => {
    };
  }
  const leaves = /* @__PURE__ */ new Map();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const leave = onEnter(e.target);
          if (once) io.unobserve(e.target);
          else if (typeof leave === "function") leaves.set(e.target, leave);
        } else if (leaves.has(e.target)) {
          leaves.get(e.target)();
          leaves.delete(e.target);
        }
      }
    },
    { threshold, rootMargin }
  );
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}
var scrollVelocity = /* @__PURE__ */ (() => {
  let v = 0, lastY = 0, lastT = 0, started = false;
  const state = { get value() {
    return v;
  } };
  const start = () => {
    if (started || typeof window === "undefined") return;
    started = true;
    lastY = window.scrollY;
    lastT = ticker.now();
    ticker.add((t) => {
      const y = window.scrollY;
      const dt = Math.max(1, t - lastT);
      const raw = (y - lastY) / dt;
      v = lerp(v, raw, 0.2);
      if (Math.abs(v) < 1e-3) v = 0;
      lastY = y;
      lastT = t;
    });
  };
  return { start, read: () => (start(), state.value) };
})();
function parallax(targets, opts = {}) {
  const { speed = 0.2, axis = "y" } = opts;
  const els = toArray(targets);
  if (prefersReducedMotion()) return () => {
  };
  return ticker.add(() => {
    const vh = window.innerHeight;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;
      const offset = (r.top + r.height / 2 - vh / 2) * -speed;
      set(el, { [axis]: offset });
    }
  });
}
function scrub(anim, opts) {
  const el = toArray(opts.trigger)[0];
  const { start = 1, end = 0, smooth = 0.12 } = opts;
  anim.pause();
  let current = 0;
  return ticker.add((_, dt) => {
    const vh = window.innerHeight;
    const r = el.getBoundingClientRect();
    const from = r.top - start * vh;
    const to = r.bottom - end * vh;
    const p = clamp(-from / (to - from || 1));
    const k = smooth ? 1 - Math.pow(smooth, dt / 16.67 / 4) : 1;
    current = Math.abs(p - current) < 5e-4 ? p : lerp(current, p, smooth ? k : 1);
    const total = anim.totalDuration === Infinity ? anim.duration : anim.totalDuration;
    anim.seek(current * total);
  });
}

// src/fx/marquee.ts
function marquee(target, opts = {}) {
  const el = toArray(target)[0];
  let { speed = 80 } = opts;
  const { direction = "left", gap = 48, pauseOnHover = false, scrollBoost = 0, skew = 0 } = opts;
  const original = el.innerHTML;
  el.style.overflow = "hidden";
  const track = document.createElement("div");
  track.className = "km-marquee-track";
  track.setAttribute("style", "display:flex;width:max-content;will-change:transform");
  const group = document.createElement("div");
  group.className = "km-marquee-group";
  group.setAttribute("style", `display:flex;align-items:center;gap:${gap}px;padding-right:${gap}px;flex-shrink:0`);
  while (el.firstChild) group.appendChild(el.firstChild);
  track.appendChild(group);
  el.appendChild(track);
  let groupWidth = 0;
  const fill = () => {
    while (track.children.length > 1) track.lastChild.remove();
    groupWidth = group.getBoundingClientRect().width;
    const needed = Math.ceil(el.clientWidth * 2 / Math.max(groupWidth, 1)) + 1;
    for (let i = 1; i < Math.min(needed, 40); i++) {
      const c2 = group.cloneNode(true);
      c2.setAttribute("aria-hidden", "true");
      track.appendChild(c2);
    }
  };
  fill();
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(fill) : null;
  ro == null ? void 0 : ro.observe(el);
  let offset = 0, hover = 1, hoverTarget = 1, running2 = true, sign = direction === "left" ? -1 : 1, lean = 0;
  const enter = () => hoverTarget = 0;
  const leave = () => hoverTarget = 1;
  if (pauseOnHover) {
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
  }
  if (scrollBoost) scrollVelocity.start();
  const reduce = prefersReducedMotion();
  const stop = ticker.add((_, dt) => {
    if (!running2 || reduce || !groupWidth) return;
    hover = lerp(hover, hoverTarget, 1 - Math.pow(1e-3, dt / 1e3));
    let v = speed;
    if (scrollBoost) {
      const sv = scrollVelocity.read();
      if (Math.abs(sv) > 0.05) sign = (sv > 0 ? -1 : 1) * (direction === "left" ? 1 : -1);
      v *= 1 + Math.abs(sv) * scrollBoost;
      lean = lerp(lean, Math.max(-1, Math.min(1, sv / 3)) * skew, 0.15);
    }
    offset += sign * v * hover * dt / 1e3;
    offset = (offset % groupWidth - groupWidth) % groupWidth;
    track.style.transform = `translate3d(${offset}px,0,0)${lean ? ` skewX(${-lean}deg)` : ""}`;
  });
  return {
    setSpeed: (s) => speed = s,
    pause: () => running2 = false,
    play: () => running2 = true,
    destroy() {
      stop();
      ro == null ? void 0 : ro.disconnect();
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.innerHTML = original;
    }
  };
}

// src/fx/ring.ts
var uid = 0;
function ring(target, opts = {}) {
  var _a, _b;
  const el = toArray(target)[0];
  const original = el.innerHTML;
  const text = ((_b = (_a = opts.text) != null ? _a : el.textContent) != null ? _b : "").trim();
  const { radius = 90, fontSize = 14, speed = 18, scrollBoost = 0, color = "currentColor", fontWeight = 700, letterSpacing = 0 } = opts;
  const size = radius * 2 + fontSize * 2.4;
  const c2 = size / 2;
  const id = `km-ring-${++uid}`;
  const circumference = 2 * Math.PI * radius;
  el.innerHTML = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="display:block;overflow:visible;will-change:transform" aria-label="${text.replace(/"/g, "&quot;")}" role="img">
<defs><path id="${id}" d="M${c2},${c2} m-${radius},0 a${radius},${radius} 0 1,1 ${radius * 2},0 a${radius},${radius} 0 1,1 -${radius * 2},0"/></defs>
<text font-size="${fontSize}" font-weight="${fontWeight}" fill="${color}" letter-spacing="${letterSpacing}" style="text-transform:uppercase"><textPath href="#${id}" textLength="${circumference - fontSize * 0.5}" lengthAdjust="spacing">${text.replace(/</g, "&lt;")}</textPath></text></svg>`;
  const svg = el.firstElementChild;
  if (scrollBoost) scrollVelocity.start();
  let angle = 0, extra = 0;
  const reduce = prefersReducedMotion();
  const stop = ticker.add((_, dt) => {
    if (reduce) return;
    if (scrollBoost) extra = lerp(extra, scrollVelocity.read() * scrollBoost * 60, 0.1);
    angle = (angle + (speed + extra) * dt / 1e3) % 360;
    svg.style.transform = `rotate(${angle}deg)`;
  });
  return {
    el: svg,
    destroy() {
      stop();
      el.innerHTML = original;
    }
  };
}

// src/fx/pointer.ts
var damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * (dt / 1e3)));
var fine = () => typeof matchMedia === "undefined" || matchMedia("(pointer: fine)").matches;
var px = -9999;
var py = -9999;
var listening = false;
function trackPointer() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("pointermove", (e) => (px = e.clientX, py = e.clientY), { passive: true });
}
function magnetic(targets, opts = {}) {
  const { strength = 0.4, radius = 80, stiffness = 10, inner } = opts;
  const els = toArray(targets);
  if (prefersReducedMotion() || !fine()) return () => {
  };
  trackPointer();
  const state = els.map((el) => ({ el, x: 0, y: 0, inner: inner ? el.querySelector(inner) : null }));
  return ticker.add((_, dt) => {
    for (const s of state) {
      const r = s.el.getBoundingClientRect();
      const cx = r.left + r.width / 2 - s.x, cy = r.top + r.height / 2 - s.y;
      const dx = px - cx, dy = py - cy;
      const near = Math.abs(dx) < r.width / 2 + radius && Math.abs(dy) < r.height / 2 + radius;
      s.x = damp(s.x, near ? dx * strength : 0, stiffness, dt);
      s.y = damp(s.y, near ? dy * strength : 0, stiffness, dt);
      set(s.el, { x: +s.x.toFixed(2), y: +s.y.toFixed(2) });
      if (s.inner) set(s.inner, { x: +(s.x * 0.5).toFixed(2), y: +(s.y * 0.5).toFixed(2) });
    }
  });
}
function tilt(targets, opts = {}) {
  const { max = 14, perspective = 900, scale = 1.04, glare = true, stiffness = 9 } = opts;
  const els = toArray(targets);
  if (prefersReducedMotion()) return () => {
  };
  const state = els.map((el) => {
    el.style.transformStyle = "preserve-3d";
    let g = null;
    if (glare) {
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      g = document.createElement("div");
      g.className = "km-glare";
      g.setAttribute("style", "position:absolute;inset:0;border-radius:inherit;pointer-events:none;mix-blend-mode:soft-light;opacity:0;transition:opacity .3s");
      el.appendChild(g);
    }
    const s = { el, g, rx: 0, ry: 0, sc: 1, tx: 0, ty: 0, ts: 1, gx: 50, gy: 50 };
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
      s.ty = (nx - 0.5) * 2 * max;
      s.tx = -(ny - 0.5) * 2 * max;
      s.ts = scale;
      s.gx = nx * 100;
      s.gy = ny * 100;
      if (g) g.style.opacity = "1";
    });
    el.addEventListener("pointerleave", () => {
      s.tx = s.ty = 0;
      s.ts = 1;
      if (g) g.style.opacity = "0";
    });
    return s;
  });
  return ticker.add((_, dt) => {
    for (const s of state) {
      s.rx = damp(s.rx, s.tx, stiffness, dt);
      s.ry = damp(s.ry, s.ty, stiffness, dt);
      s.sc = damp(s.sc, s.ts, stiffness, dt);
      set(s.el, { perspective, rotateX: +s.rx.toFixed(3), rotateY: +s.ry.toFixed(3), scale: +s.sc.toFixed(4) });
      if (s.g) s.g.style.background = `radial-gradient(circle at ${s.gx}% ${s.gy}%, rgba(255,255,255,.55), rgba(255,255,255,0) 60%)`;
    }
  });
}
function cursor(opts = {}) {
  const { size = 14, color = "#F56E2E", blend = "normal", hoverScale = 3.2, stiffness = 16 } = opts;
  if (!fine() || prefersReducedMotion()) return () => {
  };
  trackPointer();
  const dot = document.createElement("div");
  dot.className = "km-cursor";
  dot.setAttribute("style", `position:fixed;left:0;top:0;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;border-radius:50%;background:${color};pointer-events:none;z-index:2147483647;mix-blend-mode:${blend};display:grid;place-items:center;will-change:transform`);
  const label = document.createElement("span");
  label.setAttribute("style", `font:700 ${Math.max(3, size / 4.2)}px/1 system-ui,sans-serif;color:#fff;white-space:nowrap;opacity:0;transition:opacity .2s;letter-spacing:.02em`);
  dot.appendChild(label);
  document.body.appendChild(dot);
  let x = px, y = py, s = 0, ts = 1;
  const over = (e) => {
    var _a, _b;
    const t = (_b = (_a = e.target).closest) == null ? void 0 : _b.call(_a, 'a,button,[data-km-cursor],[data-km="magnetic"]');
    ts = t ? hoverScale : 1;
    const txt = (t == null ? void 0 : t.getAttribute("data-km-cursor")) || "";
    label.textContent = txt;
    label.style.opacity = txt ? "1" : "0";
  };
  const down = () => ts *= 0.7;
  const up = (e) => over(e);
  document.addEventListener("pointerover", over);
  document.addEventListener("pointerdown", down);
  document.addEventListener("pointerup", up);
  const stop = ticker.add((_, dt) => {
    x = damp(x, px, stiffness, dt);
    y = damp(y, py, stiffness, dt);
    s = damp(s, px < -1e3 ? 0 : ts, 12, dt);
    dot.style.transform = `translate3d(${x}px,${y}px,0) scale(${s})`;
    label.style.transform = `scale(${1 / Math.max(s, 0.01)})`;
  });
  return () => {
    stop();
    dot.remove();
    document.removeEventListener("pointerover", over);
    document.removeEventListener("pointerdown", down);
    document.removeEventListener("pointerup", up);
  };
}

// src/fx/depth.ts
function extrude(targets, opts = {}) {
  const { depth = 36, layers = 18, shade = 0.45 } = opts;
  const cleanups = toArray(targets).map((el) => {
    const face = el.firstElementChild;
    if (!face) return () => {
    };
    el.style.transformStyle = "preserve-3d";
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    face.style.transform = "translateZ(0.5px)";
    face.style.position = "relative";
    const slices = [];
    for (let i = 1; i <= layers; i++) {
      const s = face.cloneNode(true);
      s.setAttribute("aria-hidden", "true");
      s.classList.add("km-slice");
      const k = i / layers;
      s.style.position = "absolute";
      s.style.left = face.offsetLeft + "px";
      s.style.top = face.offsetTop + "px";
      s.style.transform = `translateZ(${-k * depth}px)`;
      s.style.filter = `brightness(${1 - shade * (0.35 + 0.65 * k)})`;
      s.style.pointerEvents = "none";
      el.insertBefore(s, face);
      slices.push(s);
    }
    return () => {
      slices.forEach((s) => s.remove());
      face.style.transform = "";
    };
  });
  return () => cleanups.forEach((c2) => c2());
}
function float(targets, opts = {}) {
  const { y = 14, rotate = 3, sway = 0, duration = 3600 } = opts;
  const loops = [
    animate(targets, { y: [-y / 2, y / 2] }, { duration: duration / 2, ease: "inOutSine", loop: true, yoyo: true }),
    rotate ? animate(targets, { rotate: [-rotate, rotate] }, { duration: duration * 0.69, ease: "inOutSine", loop: true, yoyo: true }) : null,
    sway ? animate(targets, { rotateY: [-sway, sway] }, { duration: duration * 0.91, ease: "inOutSine", loop: true, yoyo: true }) : null
  ].filter(Boolean);
  return {
    pause: () => loops.forEach((l) => l.pause()),
    play: () => loops.forEach((l) => l.play()),
    destroy: () => loops.forEach((l) => l.pause())
  };
}

// src/auto.ts
function readOptions(el) {
  const out = {};
  for (const [k, raw] of Object.entries(el.dataset)) {
    if (!k.startsWith("km") || k === "km" || raw === void 0) continue;
    const key = k[2].toLowerCase() + k.slice(3);
    out[key] = raw === "" || raw === "true" ? true : raw === "false" ? false : raw.trim() !== "" && !isNaN(+raw) ? +raw : raw;
  }
  return out;
}
var handlers = {
  marquee: (el, o) => marquee(el, o),
  ring: (el, o) => ring(el, o),
  magnetic: (el, o) => magnetic(el, o),
  tilt: (el, o) => tilt(el, o),
  parallax: (el, o) => parallax(el, o),
  extrude: (el, o) => extrude(el, o),
  float: (el, o) => float(el, o),
  scramble: (el, o) => inView(el, () => void scramble(el, o), o),
  counter: (el, o) => inView(el, () => void counter(el, { ...o, to: +o.to }), o),
  wave: (el, o) => wave(el, o)
};
function auto(root = document) {
  const cleanups = [];
  root.querySelectorAll("[data-km]").forEach((el) => {
    if (el.dataset.kmReady) return;
    el.dataset.kmReady = "true";
    const o = readOptions(el);
    for (const name of (el.dataset.km || "").split(/\s+/).filter(Boolean)) {
      const h = handlers[name];
      if (h) {
        const r = h(el, o);
        if (typeof r === "function") cleanups.push(r);
        else if (r && "destroy" in r) cleanups.push(() => r.destroy());
        continue;
      }
      el.style.visibility = "hidden";
      cleanups.push(
        inView(el, () => {
          el.style.visibility = "";
          reveal(el, { effect: name, ...o });
        }, o)
      );
    }
  });
  return () => cleanups.forEach((c2) => c2());
}

// src/index.ts
var version = "0.1.0";
if (typeof document !== "undefined") {
  const s = document.currentScript;
  if (s && s.hasAttribute("data-auto")) {
    const run = () => auto();
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", run) : run();
  }
}
export {
  Playback,
  Timeline,
  Tween,
  animate,
  auto,
  clamp,
  config,
  counter,
  cubicBezier,
  cursor,
  easings,
  extrude,
  float,
  getTransform,
  inView,
  interpolator,
  lerp,
  magnetic,
  mapRange,
  marquee,
  parallax,
  prefersReducedMotion,
  presets,
  readOptions,
  resolveEase,
  reveal,
  ring,
  scramble,
  scrollVelocity,
  scrub,
  set,
  split,
  spring,
  stagger,
  ticker,
  tilt,
  timeline,
  version,
  wave
};
