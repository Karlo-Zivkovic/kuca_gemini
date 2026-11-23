"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { Maximize2, X } from "lucide-react";
import type { Dict } from "@/lib/i18n";

/*
 * Schematic floor plans drawn from the owners' hand sketches.
 * Units are arbitrary (not to scale); each floor has its own coordinate system.
 */

type P = [number, number];
type Labels = Dict["floorPlan"];

/* ------------------------------- primitives ------------------------------ */

function Walls({ outer = [], inner = [] }: { outer?: [P, P][]; inner?: [P, P][] }) {
  return (
    <g className="stroke-ink" strokeLinecap="square" fill="none">
      {outer.map(([a, b], i) => (
        <line key={`o${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} strokeWidth={1.4} />
      ))}
      {inner.map(([a, b], i) => (
        <line key={`i${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} strokeWidth={0.8} />
      ))}
    </g>
  );
}

function Windows({ list }: { list: [P, P][] }) {
  return (
    <>
      {list.map(([a, b], i) => {
        const vertical = a[0] === b[0];
        return (
          <g key={i}>
            <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className="stroke-paper" strokeWidth={1.4} />
            <rect
              x={vertical ? a[0] - 0.7 : a[0]}
              y={vertical ? a[1] : a[1] - 0.7}
              width={vertical ? 1.4 : b[0] - a[0]}
              height={vertical ? b[1] - a[1] : 1.4}
              className="fill-sea-light stroke-sea"
              strokeWidth={0.3}
            />
          </g>
        );
      })}
    </>
  );
}

// Hinged doors: hinge, closed end (other side of the opening), open end.
function Doors({ list }: { list: [P, P, P][] }) {
  return (
    <>
      {list.map(([h, c, o], i) => {
        const r = Math.hypot(o[0] - h[0], o[1] - h[1]);
        const cross = (o[0] - h[0]) * (c[1] - h[1]) - (o[1] - h[1]) * (c[0] - h[0]);
        const d = `M${h[0]} ${h[1]} L${o[0]} ${o[1]} A${r} ${r} 0 0 ${cross > 0 ? 1 : 0} ${c[0]} ${c[1]}`;
        return <path key={i} d={d} className="fill-none stroke-terracotta" strokeWidth={0.4} />;
      })}
    </>
  );
}

function Bed({
  x,
  y,
  w,
  h,
  head,
  single,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  head: "left" | "top" | "right";
  single?: boolean;
}) {
  let pillows: { x: number; y: number; w: number; h: number }[];
  if (head === "top") {
    pillows = single
      ? [{ x: x + 1.5, y: y + 1, w: w - 3, h: 3.5 }]
      : [
          { x: x + 1, y: y + 1, w: w / 2 - 1.5, h: 3.5 },
          { x: x + w / 2 + 0.5, y: y + 1, w: w / 2 - 1.5, h: 3.5 },
        ];
  } else {
    const px = head === "left" ? x + 1 : x + w - 4.5;
    pillows = single
      ? [{ x: px, y: y + 1.5, w: 3.5, h: h - 3 }]
      : [
          { x: px, y: y + 1, w: 3.5, h: h / 2 - 1.5 },
          { x: px, y: y + h / 2 + 0.5, w: 3.5, h: h / 2 - 1.5 },
        ];
  }
  return (
    <g className="fill-paper stroke-sea" strokeWidth={0.4}>
      <rect x={x} y={y} width={w} height={h} rx={1} />
      {pillows.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={0.8} className="fill-sea-light" />
      ))}
    </g>
  );
}

function Box({ x, y, w = 3, h = 3 }: { x: number; y: number; w?: number; h?: number }) {
  return <rect x={x} y={y} width={w} height={h} className="fill-stone stroke-muted" strokeWidth={0.3} />;
}

function Wardrobe({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g className="fill-stone stroke-muted" strokeWidth={0.3}>
      <rect x={x} y={y} width={w} height={h} />
      <path d={`M${x} ${y} L${x + w} ${y + h} M${x + w} ${y} L${x} ${y + h}`} fill="none" />
    </g>
  );
}

function Shower({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g className="fill-sea-light stroke-sea" strokeWidth={0.3}>
      <rect x={x} y={y} width={w} height={h} />
      <path d={`M${x} ${y} L${x + w} ${y + h}`} />
    </g>
  );
}

function Toilet({ cx, cy }: { cx: number; cy: number }) {
  return <ellipse cx={cx} cy={cy} rx={2} ry={2.8} className="fill-paper stroke-muted" strokeWidth={0.3} />;
}

function Sink({ x, y }: { x: number; y: number }) {
  return <rect x={x} y={y} width={5} height={3.5} rx={1.5} className="fill-paper stroke-muted" strokeWidth={0.3} />;
}

function Stool({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={1.5} className="fill-stone stroke-muted" strokeWidth={0.3} />;
}

// Staircase; steps run across the shorter side.
function Stairs({ x, y, w, h, steps }: { x: number; y: number; w: number; h: number; steps: number }) {
  const vertical = h > w;
  return (
    <g className="stroke-muted" strokeWidth={0.4}>
      <rect x={x} y={y} width={w} height={h} className="fill-paper" />
      {Array.from({ length: steps - 1 }, (_, i) => {
        const f = (i + 1) / steps;
        return vertical ? (
          <line key={i} x1={x} x2={x + w} y1={y + f * h} y2={y + f * h} />
        ) : (
          <line key={i} y1={y} y2={y + h} x1={x + f * w} x2={x + f * w} />
        );
      })}
    </g>
  );
}

function Label({
  x,
  y,
  children,
  small,
  rotate,
  accent,
}: {
  x: number;
  y: number;
  children: string;
  small?: boolean;
  rotate?: number;
  accent?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
      className={`${accent ? "fill-terracotta" : "fill-ink"} stroke-paper font-sans font-semibold`}
      fontSize={small ? 2.8 : 3.4}
      strokeWidth={0.9}
      paintOrder="stroke"
    >
      {children}
    </text>
  );
}

function Outdoor({ d }: { d: string }) {
  return <path d={d} className="fill-olive/10 stroke-olive" strokeWidth={0.4} strokeDasharray="1.5 1" />;
}

// True inside the full-screen viewer: the plan then fills the available box instead of the page width.
const FullScreen = createContext(false);

function Svg({ viewBox, label, children }: { viewBox: string; label: string; children: ReactNode }) {
  const full = useContext(FullScreen);
  return (
    <svg
      viewBox={viewBox}
      role="img"
      aria-label={label}
      className={full ? "block h-full w-full" : "mx-auto block h-auto w-full max-w-4xl"}
    >
      {children}
    </svg>
  );
}

/* ------------------------------ ground floor ----------------------------- */

function GroundFloor({ t }: { t: Labels }) {
  return (
    <Svg viewBox="-3 0 160 122" label={`${t.title}: ${t.ground}`}>
      {/* Outside: covered terrace, barbecue, outdoor WC */}
      <Outdoor d="M75 2 H154 V114 H115 V14 H75 Z" />
      <rect x={75} y={3} width={27} height={11} className="fill-stone/70" />
      <g className="fill-stone stroke-muted" strokeWidth={0.3}>
        <rect x={124} y={4} width={26} height={8} rx={0.5} />
        {[128, 131, 134, 137, 140, 143, 146].map((x) => (
          <line key={x} x1={x} x2={x} y1={5.5} y2={10.5} />
        ))}
      </g>
      <rect x={130} y={60} width={14} height={38} rx={0.8} className="fill-paper stroke-sea" strokeWidth={0.4} />
      {[62, 68, 74, 80, 86, 92].map((y) => (
        <g key={y}>
          <Box x={126} y={y} />
          <Box x={145} y={y} />
        </g>
      ))}
      <Box x={135.5} y={56} />
      <Box x={135.5} y={99} />

      {/* Room fills */}
      <rect x={2} y={14} width={37} height={31} className="fill-sea-light/50" />
      <rect x={39} y={14} width={37} height={18} className="fill-stone/70" />
      <rect x={76} y={14} width={39} height={27} className="fill-sea-light/50" />
      <rect x={2} y={45} width={57} height={22} className="fill-sea-light/50" />
      <rect x={2} y={67} width={41} height={18} className="fill-stone/70" />
      <rect x={2} y={85} width={46} height={29} className="fill-sea-light/50" />
      <path d="M39 32 H76 V41 H115 V114 H48 V85 H43 V67 H59 V45 H39 Z" className="fill-paper" />

      {/* Bedroom top-left: double bed */}
      <Box x={5.5} y={19.5} />
      <Box x={5.5} y={38} />
      <Bed x={9} y={23} w={22} h={14} head="left" />
      <Wardrobe x={12} y={40.5} w={12} h={4} />

      {/* WC top */}
      <Shower x={40} y={15} w={7} h={9} />
      <Sink x={49} y={15} />
      <Toilet cx={72} cy={20} />

      {/* Bedroom top-right: double bed */}
      <Bed x={85} y={15.5} w={19} h={17} head="top" />

      {/* Bedroom middle-left: single bed */}
      <Bed x={4} y={53} w={22} h={10} head="left" single />
      <Wardrobe x={50} y={60} w={8} h={6} />

      {/* WC + shower (left) */}
      <Shower x={3} y={68} w={8} h={8} />
      <Toilet cx={7} cy={80.5} />
      <Sink x={14} y={68} />

      {/* Bedroom bottom-left: single bed */}
      <Bed x={14} y={87} w={11} h={21} head="top" single />
      <Wardrobe x={39} y={87} w={7.5} h={11} />

      {/* Kitchen: counter with hob and sink, island with stools */}
      <rect x={77} y={41} width={37.5} height={4.5} className="fill-stone stroke-muted" strokeWidth={0.3} />
      {[
        [95, 42.5],
        [98.5, 42.5],
        [95, 44.2],
        [98.5, 44.2],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={0.7} className="fill-none stroke-ink" strokeWidth={0.25} />
      ))}
      <rect x={104} y={41.8} width={6} height={3} rx={1} className="fill-paper stroke-muted" strokeWidth={0.3} />
      <rect x={82} y={51} width={24} height={10} rx={0.5} className="fill-stone stroke-muted" strokeWidth={0.3} />
      {[
        [79, 54],
        [79, 58.5],
        [109, 54],
        [109, 58.5],
        [86, 64.5],
        [91.5, 64.5],
        [97, 64.5],
        [102.5, 64.5],
      ].map(([cx, cy], i) => (
        <Stool key={i} cx={cx} cy={cy} />
      ))}

      {/* Living: L-sofa and TV */}
      <path d="M82 77 H108 V99 H102 V82 H82 Z" className="fill-sea-light stroke-sea" strokeWidth={0.4} strokeLinejoin="round" />
      <rect x={90} y={111} width={18} height={2.4} className="fill-ink" />

      <Walls
        outer={[
          [[2, 14], [115, 14]],
          [[2, 14], [2, 114]],
          [[115, 14], [115, 23]],
          [[115, 30], [115, 114]],
          [[2, 114], [58, 114]],
          [[68, 114], [115, 114]],
        ]}
        inner={[
          [[39, 14], [39, 36]],
          [[39, 43], [39, 45]],
          [[39, 32], [63, 32]],
          [[70, 32], [76, 32]],
          [[76, 14], [76, 33]],
          [[76, 40], [76, 41]],
          [[76, 41], [115, 41]],
          [[2, 45], [59, 45]],
          [[59, 52], [59, 67]],
          [[2, 67], [59, 67]],
          [[43, 67], [43, 74]],
          [[43, 81], [43, 85]],
          [[2, 85], [48, 85]],
          [[48, 85], [48, 102]],
          [[48, 109], [48, 114]],
          // Outdoor WC
          [[75, 3], [102, 3]],
          [[75, 3], [75, 14]],
          [[102, 3], [102, 4]],
          [[102, 11], [102, 14]],
        ]}
      />
      <Windows
        list={[
          [[21, 14], [37, 14]],
          [[56, 14], [66, 14]],
          [[2, 52], [2, 61]],
          [[2, 71], [2, 80]],
          [[23, 114], [35, 114]],
          [[115, 50], [115, 62]],
          [[115, 81], [115, 97]],
        ]}
      />
      <Doors
        list={[
          [[39, 43], [39, 36], [32, 43]],
          [[70, 32], [63, 32], [70, 25]],
          [[76, 40], [76, 33], [83, 40]],
          [[59, 52], [59, 45.5], [52.5, 52]],
          [[43, 81], [43, 74], [36, 81]],
          [[48, 109], [48, 102], [41, 109]],
          [[58, 114], [68, 114], [58, 104]],
          [[115, 30], [115, 23], [108, 30]],
          [[102, 11], [102, 4], [95, 11]],
        ]}
      />

      <Label x={22} y={18}>{`${t.room} 1`}</Label>
      <Label x={57} y={25}>{t.wc}</Label>
      <Label x={96} y={38}>{`${t.room} 4`}</Label>
      <Label x={40} y={56}>{`${t.room} 2`}</Label>
      <Label x={23} y={80}>{t.wc}</Label>
      <Label x={24} y={111.3}>{`${t.room} 3`}</Label>
      <Label x={52} y={38.5}>{t.hall}</Label>
      <Label x={94} y={56}>{t.kitchen}</Label>
      <Label x={70} y={92}>{t.living}</Label>
      <Label x={88.5} y={8.5} small>{t.wcOut}</Label>
      <Label x={137} y={15.5} small>{t.bbq}</Label>
      <Label x={137} y={45}>{t.coveredTerrace}</Label>
      <Label x={63} y={118.5} accent>{`${t.entrance} ↑`}</Label>
    </Svg>
  );
}

/* ------------------------------- first floor ----------------------------- */

function FirstFloor({ t }: { t: Labels }) {
  return (
    <Svg viewBox="-8 0 197 106" label={`${t.title}: ${t.floor1}`}>
      {/* Outdoor: terrace + balcony */}
      <Outdoor d="M125 4 H172 V103 H2 V89 H125 Z" />

      {/* Room fills */}
      <rect x={2} y={1} width={45} height={33} className="fill-sea-light/50" />
      <rect x={74} y={1} width={51} height={33} className="fill-sea-light/50" />
      <rect x={2} y={34} width={45} height={11} className="fill-stone/70" />
      <rect x={47} y={1} width={27} height={21} className="fill-stone/70" />
      <path d="M47 22 H74 V34 H78 V55 H2 V45 H47 Z" className="fill-sand" />
      <path d="M2 55 H78 V34 H125 V89 H2 Z" className="fill-paper" />

      {/* Bedroom (left) */}
      <Box x={4} y={7.5} />
      <Box x={4} y={29.5} />
      <Bed x={4} y={12} w={23} h={16} head="left" />
      <Wardrobe x={38} y={3} w={7} h={15} />

      {/* WC (left) */}
      <Shower x={3} y={35} w={9} h={9} />
      <Toilet cx={19} cy={39.5} />
      <Sink x={23} y={35.5} />

      {/* WC (top) */}
      <Shower x={66} y={2} w={7} h={7} />

      {/* Bedroom (right) */}
      <Box x={80} y={2.5} w={4} h={3.5} />
      <Box x={115} y={2.5} w={4} h={3.5} />
      <Bed x={88} y={2} w={23} h={19} head="top" />
      <Wardrobe x={92} y={30} w={32} h={4} />

      {/* Hall cabinet */}
      <Wardrobe x={70} y={37} w={7} h={7} />

      {/* Kitchen */}
      <rect x={86} y={34.5} width={38.5} height={4.5} className="fill-stone stroke-muted" strokeWidth={0.3} />
      {[
        [103, 36],
        [106.5, 36],
        [103, 37.8],
        [106.5, 37.8],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={0.8} className="fill-none stroke-ink" strokeWidth={0.25} />
      ))}
      <rect x={88} y={42} width={24} height={7} rx={0.5} className="fill-stone stroke-muted" strokeWidth={0.3} />
      <rect x={102} y={53} width={22.5} height={6} rx={0.5} className="fill-stone stroke-muted" strokeWidth={0.3} />

      {/* Living: sofa + TV */}
      <path d="M30 63 h7 v22 h-22 v-6 h15 Z" className="fill-sea-light stroke-sea" strokeWidth={0.4} strokeLinejoin="round" />
      <rect x={2.6} y={67} width={2.4} height={13} className="fill-ink" />

      {/* Dining */}
      <ellipse cx={100} cy={77} rx={12} ry={4.5} className="fill-paper stroke-sea" strokeWidth={0.4} />
      {[89, 96, 104, 111].map((cx) => (
        <Stool key={cx} cx={cx} cy={70.5} />
      ))}

      {/* Stairs up to the gallery (bottom-right corner) */}
      <Stairs x={117} y={61} w={7.5} h={27.5} steps={10} />

      {/* Terrace table with 8 chairs */}
      <rect x={142} y={34} width={13} height={24} rx={0.8} className="fill-paper stroke-sea" strokeWidth={0.4} />
      {[37, 44.5, 52].map((y) => (
        <g key={y}>
          <Box x={137.5} y={y} />
          <Box x={156.5} y={y} />
        </g>
      ))}
      <Box x={147} y={29.5} />
      <Box x={147} y={59.5} />

      {/* Stairs down to the garden */}
      <Stairs x={172} y={26} w={9} h={58} steps={14} />

      <Walls
        outer={[
          [[2, 1], [125, 1]],
          [[2, 1], [2, 46.5]],
          [[2, 53.5], [2, 89]],
          [[125, 1], [125, 89]],
          [[2, 89], [53, 89]],
          [[73, 89], [92, 89]],
          [[116, 89], [125, 89]],
        ]}
        inner={[
          [[47, 1], [47, 26]],
          [[47, 32], [47, 45]],
          [[2, 34], [47, 34]],
          [[2, 45], [31, 45]],
          [[38, 45], [47, 45]],
          [[47, 22], [49, 22]],
          [[55, 22], [74, 22]],
          [[74, 1], [74, 26]],
          [[74, 32], [74, 34]],
          [[74, 34], [125, 34]],
          [[78, 34], [78, 55]],
          [[2, 55], [60, 55]],
          [[71, 55], [78, 55]],
        ]}
      />
      <Windows
        list={[
          [[17, 1], [32, 1]],
          [[12, 89], [27, 89]],
          [[125, 9], [125, 20]],
          [[125, 41], [125, 53]],
        ]}
      />
      <Doors
        list={[
          [[47, 32], [47, 26], [41, 32]],
          [[38, 45], [31, 45], [38, 52]],
          [[2, 53.5], [2, 46.5], [9, 53.5]],
          [[49, 22], [55, 22], [49, 16]],
          [[74, 32], [74, 26], [80, 32]],
          [[71, 55], [60, 55], [71, 66]],
        ]}
      />
      {/* Sliding glass doors to the balcony */}
      {[
        [53, 73],
        [92, 116],
      ].map(([x1, x2]) => (
        <g key={x1} className="stroke-terracotta" strokeWidth={0.5}>
          <line x1={x1} x2={(x1 + x2) / 2 + 1} y1={88.4} y2={88.4} />
          <line x1={(x1 + x2) / 2 - 1} x2={x2} y1={89.6} y2={89.6} />
        </g>
      ))}

      <Label x={24} y={4.5}>{`${t.room} 5`}</Label>
      <Label x={37} y={40}>{t.wc}</Label>
      <Label x={58} y={10}>{t.wc}</Label>
      <Label x={99} y={26}>{`${t.room} 6`}</Label>
      <Label x={58} y={40}>{t.hall}</Label>
      <Label x={100} y={45.5}>{t.kitchen}</Label>
      <Label x={58} y={77}>{t.living}</Label>
      <Label x={100} y={85.5}>{t.dining}</Label>
      <Label x={114.8} y={74.5} small rotate={-90} accent>{t.toGallery}</Label>
      <Label x={148.5} y={72}>{t.terrace}</Label>
      <Label x={64} y={96.5}>{t.balcony}</Label>
      <Label x={-3} y={50} small rotate={-90} accent>{`${t.entrance} ↓`}</Label>
      <Label x={185} y={55} small rotate={90}>{`${t.stairs} ↓`}</Label>
    </Svg>
  );
}

/* --------------------------------- gallery -------------------------------- */

function Gallery({ t }: { t: Labels }) {
  return (
    <Svg viewBox="-2 0 153 62" label={`${t.title}: ${t.gallery}`}>
      <Outdoor d="M0 28 H14 V58 H0 Z" />

      {/* Room fills */}
      <rect x={14} y={2} width={66} height={56} className="fill-sea-light/50" />
      <rect x={80} y={2} width={68} height={42} className="fill-sea-light/50" />
      <rect x={80} y={44} width={68} height={14} className="fill-sand" />

      {/* Left bedroom: two single beds */}
      <Bed x={17} y={3} w={14} h={26} head="top" single />
      <Bed x={63} y={3} w={14} h={26} head="top" single />
      <Box x={35} y={3} w={4} h={4} />
      <Box x={55} y={3} w={4} h={4} />

      {/* Right bedroom: two single beds */}
      <Wardrobe x={81} y={4} w={8} h={12} />
      <Wardrobe x={81} y={17} w={8} h={12} />
      <Bed x={119} y={3} w={27} h={12} head="right" single />
      <Bed x={119} y={30} w={27} h={12} head="right" single />
      <Box x={142.5} y={17} w={3.5} h={3.5} />
      <Box x={142.5} y={23} w={3.5} h={3.5} />

      {/* Stairs down to the 1st floor */}
      <Stairs x={132} y={45} w={15.5} h={12.5} steps={8} />

      <Walls
        outer={[
          [[14, 2], [148, 2]],
          [[14, 2], [14, 48]],
          [[14, 56], [14, 58]],
          [[148, 2], [148, 58]],
          [[14, 58], [148, 58]],
        ]}
        inner={[
          [[80, 2], [80, 47]],
          [[80, 55], [80, 58]],
          [[80, 44], [83, 44]],
          [[93, 44], [148, 44]],
        ]}
      />
      <Windows
        list={[
          [[33, 58], [47, 58]],
          [[116, 58], [128, 58]],
        ]}
      />
      <Doors
        list={[
          [[14, 56], [14, 48], [22, 56]],
          [[80, 55], [80, 47], [72, 55]],
          [[83, 44], [93, 44], [83, 34]],
        ]}
      />

      <Label x={47} y={36}>{`${t.room} 7`}</Label>
      <Label x={105} y={24}>{`${t.room} 8`}</Label>
      <Label x={100} y={51}>{t.hall}</Label>
      <Label x={123} y={51} small accent>{t.toFloor1}</Label>
      <Label x={7} y={43} small rotate={-90}>{t.balcony}</Label>
    </Svg>
  );
}

/* --------------------------------- wrapper -------------------------------- */

const floors = ["ground", "floor1", "gallery"] as const;

export function FloorPlan({ t }: { t: Labels }) {
  const [floor, setFloor] = useState<(typeof floors)[number]>("ground");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const plan =
    floor === "ground" ? <GroundFloor t={t} /> : floor === "floor1" ? <FirstFloor t={t} /> : <Gallery t={t} />;
  // On phones the plan is shrunk to the screen width; tapping it opens a full-screen view turned sideways.
  const openFull = () => {
    if (window.matchMedia("(max-width: 639px)").matches) dialogRef.current?.showModal();
  };
  return (
    <figure id="floor-plan" className="mt-14 scroll-mt-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="font-serif text-3xl font-semibold">{t.title}</h3>
        <div role="tablist" aria-label={t.title} className="flex gap-1 rounded-full bg-stone/70 p-1">
          {floors.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={floor === f}
              onClick={() => setFloor(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                floor === f ? "bg-sea text-white shadow" : "text-ink hover:bg-paper"
              }`}
            >
              {t[f]}
            </button>
          ))}
        </div>
      </div>
      <div role="tabpanel" onClick={openFull} className="mt-6 rounded-2xl border border-line bg-paper p-2 sm:p-6">
        {plan}
      </div>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-sea px-4 py-2 text-sm font-semibold text-white sm:hidden"
      >
        <Maximize2 className="size-4" /> {t.zoom}
      </button>
      <figcaption className="mt-3 text-sm text-muted">{t.note}</figcaption>

      <dialog
        ref={dialogRef}
        aria-label={`${t.title}: ${t[floor]}`}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-paper p-0 backdrop:bg-black/60"
      >
        {/* Turned sideways in portrait so the plan uses the phone's full length */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 portrait:h-[calc(100dvw-1.5rem)] portrait:w-[calc(100dvh-4.5rem)] portrait:rotate-90 landscape:h-[calc(100dvh-1.5rem)] landscape:w-[calc(100dvw-4.5rem)]">
          <FullScreen.Provider value={true}>{plan}</FullScreen.Provider>
        </div>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label={t.close}
          className="absolute right-2 top-2 rounded-full bg-ink/10 p-2.5 text-ink"
        >
          <X className="size-6" />
        </button>
      </dialog>
    </figure>
  );
}
