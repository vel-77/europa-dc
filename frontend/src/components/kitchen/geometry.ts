// Builds the kitchen sketch as a flat, back-to-front list of SVG primitives.
// Every primitive carries the slice of scroll progress (0..1) over which it
// is drawn, so the scene component only has to map progress onto each one.
//
// World units are centimetres. x runs along the right-hand wall, y along the
// left-hand wall, z is up; the room corner is at the origin.

type Pt = [number, number, number];
type Span = [number, number];
export type Tone = "guide" | "line" | "ghost" | "fine" | "brass" | "light";

export type Item =
  | { kind: "stroke"; d: string; from: number; to: number; tone: Tone }
  | { kind: "fill"; points: string; from: number; to: number; color: string }
  | { kind: "text"; x: number; y: number; text: string; from: number; to: number; rotate: number };

/** Where each chapter of the build starts, in scroll progress. */
export const STAGE_STARTS = [0, 0.1, 0.27, 0.43, 0.57, 0.67, 0.77, 0.91];
/** Progress reached by the page-load animation before any scrolling. */
export const INTRO_END = 0.08;

export const VIEW_BOX = "-335 -292 760 700";

const WOOD = { top: "var(--wood-1)", left: "var(--wood-2)", right: "var(--wood-3)" };
const LACQUER = { top: "var(--lacquer-1)", left: "var(--lacquer-2)", right: "var(--lacquer-3)" };
const STONE = { top: "var(--stone-1)", left: "var(--stone-2)", right: "var(--stone-3)" };
const STEEL = { top: "var(--steel-1)", left: "var(--steel-2)", right: "var(--steel-3)" };
type Shades = typeof WOOD;

const round = (value: number) => Math.round(value * 10) / 10;
const project = ([x, y, z]: Pt): [number, number] => [(x - y) * 0.866, (x + y) * 0.5 - z];

// Small seeded generator so the server and the browser draw identical wobble.
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildKitchen(): Item[] {
  const items: Item[] = [];
  const random = seeded(1217);

  /** A hand-drawn line: slightly bowed, and overshooting its end points. */
  function sketch(a: Pt, b: Pt, overshoot = 1) {
    const [ax, ay] = project(a);
    const [bx, by] = project(b);
    const length = Math.hypot(bx - ax, by - ay) || 1;
    const ux = (bx - ax) / length;
    const uy = (by - ay) / length;
    const before = overshoot * (1.5 + random() * 3.5);
    const after = overshoot * (1.5 + random() * 3.5);
    const bow = (random() - 0.5) * Math.min(3, length * 0.012);
    const mx = (ax + bx) / 2 - uy * bow;
    const my = (ay + by) / 2 + ux * bow;
    return `M${round(ax - ux * before)} ${round(ay - uy * before)}Q${round(mx)} ${round(my)} ${round(bx + ux * after)} ${round(by + uy * after)}`;
  }

  /** Adds strokes that are drawn one after another across the span. */
  function draw(span: Span, tone: Tone, paths: string[]) {
    const [start, end] = span;
    const each = (end - start) * 0.45;
    paths.forEach((d, index) => {
      const from = start + ((end - start - each) * index) / Math.max(1, paths.length - 1);
      items.push({ kind: "stroke", d, from, to: from + each, tone });
    });
  }

  function lines(span: Span, tone: Tone, segments: [Pt, Pt][], overshoot = 1) {
    draw(span, tone, segments.map(([a, b]) => sketch(a, b, overshoot)));
  }

  function fill(span: Span, color: string, points: Pt[]) {
    const flat = points.map((point) => project(point).map(round).join(",")).join(" ");
    items.push({ kind: "fill", points: flat, from: span[0], to: span[1], color });
  }

  function text(span: Span, at: Pt, value: string, rotate = 0) {
    const [x, y] = project(at);
    items.push({ kind: "text", x: round(x), y: round(y), text: value, from: span[0], to: span[1], rotate });
  }

  /**
   * A cabinet-like box. Only the three faces that point at the viewer are
   * emitted. Faces first get a paper-coloured fill so they cover what is
   * behind them, then a material wash that fades in later.
   */
  function box(x: Span, y: Span, z: Span, span: Span, wash?: { span: Span; shades: Shades }, tone: Tone = "line") {
    const [x0, x1] = x;
    const [y0, y1] = y;
    const [z0, z1] = z;
    const faces: Record<keyof Shades, Pt[]> = {
      top: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]],
      left: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]],
      right: [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]],
    };
    const cover: Span = [span[0], span[0] + 0.012];
    for (const key of ["top", "left", "right"] as const) {
      fill(cover, "var(--paper)", faces[key]);
      if (wash) fill(wash.span, wash.shades[key], faces[key]);
    }
    const edges: [Pt, Pt][] = [
      [[x0, y1, z0], [x1, y1, z0]],
      [[x1, y1, z0], [x1, y0, z0]],
      [[x0, y1, z0], [x0, y1, z1]],
      [[x1, y1, z0], [x1, y1, z1]],
      [[x1, y0, z0], [x1, y0, z1]],
      [[x0, y1, z1], [x1, y1, z1]],
      [[x1, y1, z1], [x1, y0, z1]],
      [[x1, y0, z1], [x0, y0, z1]],
      [[x0, y0, z1], [x0, y1, z1]],
    ];
    lines(span, tone, edges);
    // A second, lighter pass over a few edges is what makes it read as pencil.
    const again = edges.filter(() => random() < 0.35);
    if (tone === "line" && again.length) lines([span[0] + 0.01, span[1] + 0.01], "ghost", again, 1.6);
  }

  /** An ellipse that is a circle lying flat in the room. */
  function ring(centre: Pt, radius: number) {
    const [cx, cy] = project(centre);
    const rx = round(radius * 1.2247);
    const ry = round(radius * 0.7071);
    return `M${round(cx - rx)} ${round(cy)}A${rx} ${ry} 0 1 1 ${round(cx + rx)} ${round(cy)}A${rx} ${ry} 0 1 1 ${round(cx - rx)} ${round(cy)}`;
  }

  // Points on the two kinds of cabinet front.
  const onLeftFace = (y: number) => (x: number, z: number): Pt => [x, y, z];
  const onRightFace = (x: number) => (y: number, z: number): Pt => [x, y, z];

  /* ---------- Layout: the measured room, in construction blue ---------- */

  const ROOM = { x: 420, y: 320, z: 260 };
  const layout: Span = [0, INTRO_END];
  lines(layout, "guide", [
    [[0, 0, 0], [ROOM.x, 0, 0]],
    [[0, 0, 0], [0, ROOM.y, 0]],
    [[ROOM.x, 0, 0], [ROOM.x, ROOM.y, 0]],
    [[0, ROOM.y, 0], [ROOM.x, ROOM.y, 0]],
    [[0, 0, 0], [0, 0, ROOM.z]],
    [[ROOM.x, 0, 0], [ROOM.x, 0, ROOM.z]],
    [[0, ROOM.y, 0], [0, ROOM.y, ROOM.z]],
    [[0, 0, ROOM.z], [ROOM.x, 0, ROOM.z]],
    [[0, 0, ROOM.z], [0, ROOM.y, ROOM.z]],
  ], 2.5);

  // Dimension lines with tick marks.
  const dims: Span = [0.035, INTRO_END];
  lines(dims, "guide", [
    [[0, 345, 0], [ROOM.x, 345, 0]],
    [[0, 337, 0], [0, 353, 0]],
    [[ROOM.x, 337, 0], [ROOM.x, 353, 0]],
    [[445, 0, 0], [445, ROOM.y, 0]],
    [[437, 0, 0], [453, 0, 0]],
    [[437, ROOM.y, 0], [453, ROOM.y, 0]],
  ], 0.6);
  text([0.06, INTRO_END], [205, 372, 0], "13'-9\"", 30);
  text([0.06, INTRO_END], [470, 175, 0], "10'-6\"", -30);

  // Floor: wash and large-format tile joints arrive with the stonework.
  fill([0.37, 0.41], "var(--floor)", [[0, 0, 0], [ROOM.x, 0, 0], [ROOM.x, ROOM.y, 0], [0, ROOM.y, 0]]);
  const joints: [Pt, Pt][] = [];
  for (let x = 105; x < ROOM.x; x += 105) joints.push([[x, 0, 0], [x, ROOM.y, 0]]);
  for (let y = 80; y < ROOM.y; y += 80) joints.push([[0, y, 0], [ROOM.x, y, 0]]);
  lines([0.34, 0.39], "fine", joints, 0);

  /* ---------- Doors: an interior door in the left wall ---------- */

  const doorFace = onRightFace(0);
  const door: Span = [0.77, 0.82];
  fill([0.86, 0.89], "var(--wood-2)", [doorFace(238, 0), doorFace(302, 0), doorFace(302, 208), doorFace(238, 208)]);
  lines(door, "line", [
    [doorFace(232, 0), doorFace(232, 214)],
    [doorFace(232, 214), doorFace(308, 214)],
    [doorFace(308, 214), doorFace(308, 0)],
    [doorFace(238, 0), doorFace(238, 208)],
    [doorFace(238, 208), doorFace(302, 208)],
    [doorFace(302, 208), doorFace(302, 0)],
  ]);
  lines([0.81, 0.83], "brass", [[doorFace(294, 100), doorFace(282, 100)]], 0);

  /* ---------- Stonework: cladding on the wall behind the counter ---------- */

  const wallFace = onLeftFace(0);
  fill([0.3, 0.312], "var(--paper)", [wallFace(60, 92), wallFace(362, 92), wallFace(362, 150), wallFace(60, 150)]);
  fill([0.37, 0.41], "var(--stone-2)", [wallFace(60, 92), wallFace(362, 92), wallFace(362, 150), wallFace(60, 150)]);
  lines([0.3, 0.33], "line", [
    [wallFace(60, 150), wallFace(362, 150)],
    [wallFace(362, 150), wallFace(362, 92)],
  ]);
  lines([0.38, 0.41], "light", [
    [wallFace(70, 100), wallFace(150, 144)],
    [wallFace(118, 96), wallFace(170, 124)],
    [wallFace(200, 146), wallFace(300, 98)],
    [wallFace(262, 104), wallFace(350, 132)],
  ], 0);

  /* ---------- Cabinets: tall units on the left wall ---------- */

  const tall: Span = [0.1, 0.14];
  const woodWash = { span: [0.21, 0.25] as Span, shades: WOOD };
  box([0, 60], [0, 200], [0, 225], tall, woodWash);
  const tallFace = onRightFace(60);
  lines([0.125, 0.15], "line", [
    [tallFace(0, 10), tallFace(200, 10)],
    [tallFace(60, 10), tallFace(60, 225)],
    [tallFace(130, 10), tallFace(130, 225)],
    [tallFace(130, 168), tallFace(60, 168)],
    [tallFace(130, 56), tallFace(60, 56)],
    [tallFace(165, 10), tallFace(165, 225)],
  ], 0.5);

  // Appliances: two ovens stacked in the tall column.
  const ovens: Span = [0.43, 0.47];
  for (const [low, high] of [[60, 110], [114, 164]]) {
    const frame = [tallFace(126, low), tallFace(64, low), tallFace(64, high), tallFace(126, high)];
    const glass = [tallFace(121, low + 5), tallFace(69, low + 5), tallFace(69, high - 13), tallFace(121, high - 13)];
    fill([0.52, 0.55], "var(--steel-2)", frame);
    fill([0.52, 0.55], "var(--glass)", glass);
    lines(ovens, "line", [
      [frame[0], frame[1]], [frame[1], frame[2]], [frame[2], frame[3]], [frame[3], frame[0]],
      [glass[0], glass[1]], [glass[1], glass[2]], [glass[2], glass[3]], [glass[3], glass[0]],
      [tallFace(118, high - 6), tallFace(72, high - 6)],
    ], 0.4);
  }
  // Hardware on the tall doors.
  const handles: Span = [0.67, 0.74];
  lines(handles, "brass", [
    [tallFace(160, 95), tallFace(160, 135)],
    [tallFace(170, 95), tallFace(170, 135)],
    [tallFace(120, 180), tallFace(72, 180)],
    [tallFace(120, 46), tallFace(72, 46)],
  ], 0);

  /* ---------- Cabinets: base run along the right wall ---------- */

  const base: Span = [0.13, 0.17];
  const lacquerWash = { span: [0.21, 0.25] as Span, shades: LACQUER };
  box([60, 360], [0, 60], [0, 88], base, lacquerWash);
  const baseFace = onLeftFace(60);
  lines([0.155, 0.18], "line", [
    [baseFace(60, 10), baseFace(360, 10)],
    [baseFace(120, 10), baseFace(120, 88)],
    [baseFace(180, 10), baseFace(180, 88)],
    [baseFace(260, 10), baseFace(260, 88)],
    [baseFace(320, 10), baseFace(320, 88)],
    [baseFace(180, 36), baseFace(260, 36)],
    [baseFace(180, 62), baseFace(260, 62)],
  ], 0.5);
  lines(handles, "brass", [
    [baseFace(80, 80), baseFace(104, 80)],
    [baseFace(136, 80), baseFace(164, 80)],
    [baseFace(200, 80), baseFace(240, 80)],
    [baseFace(200, 54), baseFace(240, 54)],
    [baseFace(200, 28), baseFace(240, 28)],
    [baseFace(276, 80), baseFace(304, 80)],
    [baseFace(330, 80), baseFace(350, 80)],
  ], 0);

  /* ---------- Stonework: countertop on the base run ---------- */

  const stoneWash = { span: [0.37, 0.41] as Span, shades: STONE };
  box([60, 363], [0, 63], [88, 92], [0.27, 0.31], stoneWash);
  lines([0.38, 0.41], "light", [
    [[80, 8, 92], [118, 58, 92]],
    [[258, 4, 92], [300, 60, 92]],
    [[286, 30, 92], [352, 44, 92]],
  ], 0);

  // Plumbing fixtures: sink and faucet.
  const sink: Pt[] = [[128, 16, 92], [172, 16, 92], [172, 48, 92], [128, 48, 92]];
  const bowl: Pt[] = [[132, 20, 92], [168, 20, 92], [168, 44, 92], [132, 44, 92]];
  fill([0.57, 0.582], "var(--steel-1)", sink);
  fill([0.57, 0.582], "var(--steel-3)", bowl);
  lines([0.57, 0.61], "line", [
    [sink[0], sink[1]], [sink[1], sink[2]], [sink[2], sink[3]], [sink[3], sink[0]],
    [bowl[0], bowl[1]], [bowl[1], bowl[2]], [bowl[2], bowl[3]], [bowl[3], bowl[0]],
  ], 0.3);
  draw([0.585, 0.6], "fine", [ring([150, 32, 92], 2.5)]);
  const faucet = [[150, 9, 92], [150, 9, 122], [150, 22, 132], [150, 31, 119]].map((point) => project(point as Pt).map(round));
  draw([0.6, 0.64], "brass", [
    ring([150, 9, 92], 3),
    `M${faucet[0]}L${faucet[1]}Q${faucet[2]} ${faucet[3]}`,
    sketch([156, 9, 104], [163, 9, 104], 0),
  ]);

  // Appliances: cooktop set into the stone.
  const hob: Pt[] = [[190, 12, 92], [250, 12, 92], [250, 52, 92], [190, 52, 92]];
  fill([0.46, 0.472], "var(--paper)", hob);
  fill([0.52, 0.55], "var(--glass)", hob);
  lines([0.46, 0.48], "line", [[hob[0], hob[1]], [hob[1], hob[2]], [hob[2], hob[3]], [hob[3], hob[0]]], 0.3);
  draw([0.47, 0.49], "light", [
    ring([205, 23, 92], 7), ring([235, 23, 92], 9), ring([205, 41, 92], 9), ring([235, 41, 92], 7),
  ]);

  /* ---------- Cabinets and appliances at eye level ---------- */

  const upper: Span = [0.16, 0.2];
  const upperFace = onLeftFace(35);
  box([60, 180], [0, 35], [150, 225], upper, lacquerWash);
  lines([0.185, 0.2], "line", [[upperFace(120, 150), upperFace(120, 225)]], 0.5);

  const steelWash = { span: [0.52, 0.55] as Span, shades: STEEL };
  box([198, 242], [0, 28], [162, 225], [0.48, 0.51], steelWash);
  box([180, 260], [0, 44], [150, 162], [0.49, 0.52], steelWash);

  box([260, 360], [0, 35], [150, 225], upper, lacquerWash);
  lines([0.185, 0.2], "line", [[upperFace(310, 150), upperFace(310, 225)]], 0.5);

  /* ---------- Island ---------- */

  const island: Span = [0.18, 0.22];
  box([150, 330], [180, 270], [0, 88], island, woodWash);
  lines([0.21, 0.225], "line", [[[150, 270, 10], [330, 270, 10]]], 0.5);

  // Decorative panels: a fluted front.
  const flutes: [Pt, Pt][] = [];
  for (let x = 156; x < 330; x += 6) flutes.push([[x, 270, 11], [x, 270, 87]]);
  lines([0.81, 0.87], "fine", flutes, 0);

  // Stonework: island top with a waterfall end.
  box([330, 335], [178, 273], [0, 92], [0.33, 0.36], stoneWash);
  box([148, 335], [178, 273], [88, 92], [0.32, 0.35], stoneWash);
  lines([0.38, 0.41], "light", [
    [[160, 184, 92], [214, 268, 92]],
    [[196, 240, 92], [262, 262, 92]],
    [[270, 182, 92], [322, 250, 92]],
    [[335, 190, 84], [335, 250, 20]],
    [[335, 226, 46], [335, 266, 62]],
  ], 0);

  /* ---------- Finishing: pendants over the island ---------- */

  for (const [index, x] of [205, 275].entries()) {
    const offset = index * 0.012;
    const rim: Pt = [x, 225, 158];
    const [rx, ry] = project(rim);
    const [tx, ty] = project([x, 225, 176]);
    const shade = `M${round(rx - 17.1)} ${round(ry)}L${round(tx - 3)} ${round(ty)}L${round(tx + 3)} ${round(ty)}L${round(rx + 17.1)} ${round(ry)}`;
    items.push({
      kind: "fill",
      points: `${round(rx - 17.1)},${round(ry)} ${round(tx - 3)},${round(ty)} ${round(tx + 3)},${round(ty)} ${round(rx + 17.1)},${round(ry)}`,
      from: 0.92 + offset,
      to: 0.932 + offset,
      color: "var(--paper)",
    });
    draw([0.91 + offset, 0.95 + offset], "line", [sketch([x, 225, ROOM.z], [x, 225, 176], 0), shade, ring(rim, 14)]);
  }

  /* ---------- Hand-written notes ---------- */

  lines([0.235, 0.25], "guide", [[[30, 120, 225], [0, 150, 274]]], 0);
  text([0.24, 0.25], [0, 150, 280], "walnut veneer");
  lines([0.395, 0.41], "guide", [[[335, 225, 60], [368, 207, 36]]], 0);
  text([0.4, 0.41], [372, 205, 30], "waterfall end");
  lines([0.86, 0.875], "guide", [[[190, 270, 40], [100, 290, 6]]], 0);
  text([0.865, 0.88], [60, 330, 0], "fluted panel");

  return items;
}
