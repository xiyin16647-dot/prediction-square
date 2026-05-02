// V3 — AI Cyber / 数据可视化风
// Aesthetic: 深色为主 + 网格 + 概率曲线 + 半透明发光 + 等宽数据 + 几何感
// Light: 冷白 + 钢蓝网格 + 电光蓝 / Dark: 近黑蓝 + 青蓝发光 + 紫电

const V3_T = {
  light: {
    bg: '#F2F4F7',
    grid: 'rgba(15,23,42,0.04)',
    surface: '#FFFFFF',
    surfaceAlt: '#FBFCFE',
    text: '#0B1220',
    sub: '#5A6478',
    mut: '#9AA3B5',
    line: 'rgba(15,23,42,0.08)',
    lineHard: 'rgba(15,23,42,0.18)',
    yes: '#06A36A',
    yesGlow: 'rgba(6,163,106,0.10)',
    no: '#E04344',
    noGlow: 'rgba(224,67,68,0.10)',
    accent: '#1A66FF',
    accentGlow: 'rgba(26,102,255,0.12)',
  },
  dark: {
    bg: '#07080C',
    grid: 'rgba(120,160,255,0.05)',
    surface: '#0E1018',
    surfaceAlt: '#12151F',
    text: '#E6ECFA',
    sub: '#8993AC',
    mut: '#525B72',
    line: 'rgba(120,160,255,0.10)',
    lineHard: 'rgba(120,160,255,0.22)',
    yes: '#34F5A7',
    yesGlow: 'rgba(52,245,167,0.14)',
    no: '#FF5C7A',
    noGlow: 'rgba(255,92,122,0.14)',
    accent: '#5BA0FF',
    accentGlow: 'rgba(91,160,255,0.18)',
  },
};

const V3_MONO = `'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace`;
const V3_SANS = `'Inter', -apple-system, 'PingFang SC', 'Helvetica Neue', sans-serif`;

function V3StatusBar({ c }) {
  return (
    <div style={{ height: 44, padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: V3_MONO, fontSize: 14, color: c.text, fontWeight: 600 }}>
      <span>9:41</span>
      <span style={{ width: 16, height: 10, borderRadius: 2.5, border: `1.4px solid ${c.text}`, position: 'relative' }}>
        <span style={{ position: 'absolute', inset: 1.4, background: c.text, width: '78%', borderRadius: 1 }} />
      </span>
    </div>
  );
}

function V3Header({ c }) {
  return (
    <div style={{ padding: '4px 18px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: c.accentGlow,
          border: `1px solid ${c.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: V3_MONO, fontSize: 13, fontWeight: 800, color: c.accent,
        }}>◇</div>
        <div>
          <div style={{ fontFamily: V3_MONO, fontSize: 13, fontWeight: 700, color: c.text, letterSpacing: 1 }}>PSQ <span style={{ color: c.sub, fontWeight: 500 }}>// 先行版</span></div>
          <div style={{ fontFamily: V3_MONO, fontSize: 9, color: c.mut, letterSpacing: 1.5 }}>AI MARKET ENGINE v0.4</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <div style={{ fontFamily: V3_MONO, fontSize: 9, color: c.sub, letterSpacing: 1, padding: '4px 8px', borderRadius: 6, background: c.surface, border: `1px solid ${c.line}` }}>
          <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: 999, background: c.yes, marginRight: 4, boxShadow: `0 0 6px ${c.yes}` }} />
          LIVE
        </div>
      </div>
    </div>
  );
}

function V3UserModule({ c }) {
  // SVG sparkline
  const points = [40,42,38,44,46,43,48,52,50,55,53,58];
  const max = Math.max(...points), min = Math.min(...points);
  const w = 80, h = 24;
  const path = points.map((p, i) => `${i===0?'M':'L'} ${(i/(points.length-1))*w} ${h - ((p-min)/(max-min))*h}`).join(' ');
  return (
    <div style={{
      margin: '0 18px 12px', padding: 14, background: c.surface, borderRadius: 14,
      border: `1px solid ${c.line}`, fontFamily: V3_SANS, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${c.grid} 1px, transparent 1px), linear-gradient(90deg, ${c.grid} 1px, transparent 1px)`, backgroundSize: '24px 24px', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: V3_MONO, fontSize: 9, color: c.sub, letterSpacing: 1.5, marginBottom: 2 }}>WALLET.BAL</div>
          <div style={{ fontFamily: V3_MONO, fontSize: 24, fontWeight: 700, color: c.text, letterSpacing: -0.5 }}>
            4,280<span style={{ fontSize: 11, color: c.sub, marginLeft: 4 }}>P</span>
          </div>
          <div style={{ fontFamily: V3_MONO, fontSize: 11, color: c.yes, marginTop: 2 }}>
            +128 <span style={{ color: c.sub }}>· today</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <svg width={w} height={h} style={{ display: 'block', marginLeft: 'auto' }}>
            <path d={path} fill="none" stroke={c.yes} strokeWidth="1.5" />
            <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill={c.yesGlow} />
          </svg>
          <div style={{ fontFamily: V3_MONO, fontSize: 9, color: c.sub, letterSpacing: 1, marginTop: 4 }}>STREAK <span style={{ color: c.accent, fontWeight: 700 }}>×3</span> · RANK <span style={{ color: c.text, fontWeight: 700 }}>#1248</span></div>
        </div>
      </div>
    </div>
  );
}

function V3Tabs({ c }) {
  const cats = window.PS_DATA.categories;
  const [active, setActive] = React.useState('recommend');
  return (
    <div style={{ background: c.bg, position: 'sticky', top: 0, zIndex: 5, borderBottom: `1px solid ${c.line}` }}>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', padding: '0 14px 10px' }}>
        {cats.map((cat) => {
          const on = active === cat.id;
          return (
            <button key={cat.id} onClick={() => setActive(cat.id)} style={{
              padding: '7px 12px', background: on ? c.accentGlow : c.surface,
              border: `1px solid ${on ? c.accent : c.line}`, borderRadius: 999,
              fontFamily: V3_MONO, fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
              color: on ? c.accent : c.sub, whiteSpace: 'nowrap', cursor: 'pointer',
            }}>
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Probability gauge — half-circle showing yes/no split
function V3ProbGauge({ c, yes }) {
  const r = 22, cx = 26, cy = 26;
  const circ = Math.PI * r;
  return (
    <svg width="52" height="52" style={{ display: 'block' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={c.line} strokeWidth="3" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={yes>=50 ? c.yes : c.no} strokeWidth="3"
        strokeDasharray={`${(yes/100)*2*Math.PI*r} ${2*Math.PI*r}`}
        transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" />
      <text x={cx} y={cy+4} textAnchor="middle" fill={c.text} fontFamily={V3_MONO} fontSize="13" fontWeight="700">{yes}</text>
    </svg>
  );
}

// Generate a probability history line
function V3ProbLine({ c, yes, w=120, h=28 }) {
  // Make a path that ends near `yes`. Seeded variation.
  const seed = (yes * 7) % 23;
  const pts = [];
  let v = yes - 12 + (seed % 6);
  for (let i = 0; i < 12; i++) {
    v += (Math.sin(i*1.3 + seed) * 4) + (i === 11 ? (yes - v) : 0);
    pts.push(Math.max(8, Math.min(92, v)));
  }
  pts[pts.length-1] = yes;
  const stroke = yes >= 50 ? c.yes : c.no;
  const glow = yes >= 50 ? c.yesGlow : c.noGlow;
  const path = pts.map((p, i) => `${i===0?'M':'L'} ${(i/(pts.length-1))*w} ${h - (p/100)*h}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
      <line x1="0" x2={w} y1={h/2} y2={h/2} stroke={c.line} strokeDasharray="2 3" />
      <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill={glow} />
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.5" />
      <circle cx={w} cy={h - (yes/100)*h} r="3" fill={stroke} />
      <circle cx={w} cy={h - (yes/100)*h} r="6" fill="none" stroke={stroke} opacity="0.3" />
    </svg>
  );
}

function V3EventCard({ e, c, dense }) {
  if (dense) {
    return (
      <div style={{
        padding: '10px 14px', borderBottom: `1px solid ${c.line}`,
        display: 'flex', alignItems: 'center', gap: 12, fontFamily: V3_SANS,
      }}>
        <V3ProbGauge c={c} yes={e.yesPct} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
            <span style={{ fontFamily: V3_MONO, fontSize: 9, padding: '1px 5px', background: c.surfaceAlt, borderRadius: 3, color: c.sub, letterSpacing: 0.5 }}>{e.cat}</span>
            {e.ai && <span style={{ fontFamily: V3_MONO, fontSize: 9, color: c.accent, letterSpacing: 0.5 }}>·AI</span>}
            <span style={{ fontFamily: V3_MONO, fontSize: 9, color: c.mut, marginLeft: 'auto' }}>{e.deadline}</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: c.text, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {e.title}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4, fontFamily: V3_MONO, fontSize: 10 }}>
            <span style={{ color: c.yes }}>Y {e.yesPct}%·{e.yesOdd}</span>
            <span style={{ color: c.no }}>N {e.noPct}%·{e.noOdd}</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{
      margin: '0 14px 10px', padding: 14, background: c.surface, borderRadius: 14,
      border: `1px solid ${c.line}`, fontFamily: V3_SANS, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8, fontSize: 10, fontFamily: V3_MONO, color: c.sub, letterSpacing: 0.5 }}>
        <span style={{ padding: '2px 7px', background: c.surfaceAlt, border: `1px solid ${c.line}`, borderRadius: 4, color: c.text, fontWeight: 600 }}>{e.cat.toUpperCase()}</span>
        {e.ai && <span style={{ padding: '2px 7px', borderRadius: 4, background: c.accentGlow, color: c.accent, fontWeight: 700, letterSpacing: 1 }}>AI</span>}
        {e.hot && <span style={{ color: c.no, fontWeight: 700 }}>● HOT</span>}
        <span style={{ marginLeft: 'auto', color: c.mut }}>#{e.id.toUpperCase()} · {e.deadline}</span>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: c.text, lineHeight: 1.4, letterSpacing: -0.2 }}>{e.title}</div>
          <div style={{ fontSize: 11.5, color: c.sub, marginTop: 4, lineHeight: 1.45 }}>{e.desc}</div>
        </div>
        <V3ProbLine c={c} yes={e.yesPct} />
      </div>

      {/* Twin-bar probability */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: e.yesPct, padding: '10px 12px', background: c.yesGlow, border: `1px solid ${c.yes}`, borderRadius: 10, minWidth: 80 }}>
          <div style={{ fontFamily: V3_MONO, fontSize: 9, color: c.yes, letterSpacing: 1, fontWeight: 700 }}>YES</div>
          <div style={{ fontFamily: V3_MONO, fontSize: 18, color: c.yes, fontWeight: 700, letterSpacing: -0.5, marginTop: 2 }}>{e.yesPct}<span style={{ fontSize: 11 }}>%</span></div>
          <div style={{ fontFamily: V3_MONO, fontSize: 10, color: c.yes, opacity: 0.85, marginTop: 1 }}>×{e.yesOdd}</div>
        </div>
        <div style={{ flex: e.noPct, padding: '10px 12px', background: c.noGlow, border: `1px solid ${c.no}`, borderRadius: 10, minWidth: 60, textAlign: 'right' }}>
          <div style={{ fontFamily: V3_MONO, fontSize: 9, color: c.no, letterSpacing: 1, fontWeight: 700 }}>NO</div>
          <div style={{ fontFamily: V3_MONO, fontSize: 18, color: c.no, fontWeight: 700, letterSpacing: -0.5, marginTop: 2 }}>{e.noPct}<span style={{ fontSize: 11 }}>%</span></div>
          <div style={{ fontFamily: V3_MONO, fontSize: 10, color: c.no, opacity: 0.85, marginTop: 1 }}>×{e.noOdd}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, paddingTop: 8, borderTop: `1px dashed ${c.line}`, fontFamily: V3_MONO, fontSize: 10, color: c.sub, letterSpacing: 0.5 }}>
        <span>POOL <span style={{ color: c.text, fontWeight: 700 }}>{e.pool}</span></span>
        <span>USR <span style={{ color: c.text, fontWeight: 700 }}>{e.participants.toLocaleString()}</span></span>
        <span style={{ marginLeft: 'auto', color: e.change>=0 ? c.yes : c.no, fontWeight: 700 }}>
          24H {e.change>=0?'▲':'▼'}{Math.abs(e.change)}%
        </span>
      </div>
    </div>
  );
}

function V3Leaderboard({ c }) {
  return (
    <div style={{ margin: '0 14px 12px', padding: 14, background: c.surface, borderRadius: 14, border: `1px solid ${c.line}`, fontFamily: V3_SANS }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: c.accent, boxShadow: `0 0 8px ${c.accent}` }} />
          <span style={{ fontFamily: V3_MONO, fontSize: 11, fontWeight: 700, color: c.text, letterSpacing: 1.5 }}>HIGH-ROLLERS / 7D</span>
        </div>
        <span style={{ fontFamily: V3_MONO, fontSize: 10, color: c.sub }}>{'>>'} ALL</span>
      </div>
      {window.PS_DATA.leaders.map((l, i) => (
        <div key={l.rank} style={{ display: 'grid', gridTemplateColumns: '20px 28px 1fr auto', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: i>0 ? `1px solid ${c.line}` : 0 }}>
          <div style={{ fontFamily: V3_MONO, fontSize: 11, fontWeight: 700, color: l.rank===1 ? c.accent : c.sub }}>0{l.rank}</div>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: c.surfaceAlt, border: `1px solid ${c.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: c.text, fontFamily: V3_MONO }}>{l.avatar}</div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: c.text }}>{l.name}</div>
            <div style={{ fontFamily: V3_MONO, fontSize: 9, color: c.sub, letterSpacing: 0.5 }}>{l.tag} · WR {l.wr}% · ×{l.streak}</div>
          </div>
          <div style={{ fontFamily: V3_MONO, fontSize: 13, fontWeight: 700, color: c.yes }}>{l.profit}</div>
        </div>
      ))}
    </div>
  );
}

function V3HotTake({ c }) {
  const d = window.PS_DATA.discussions[0];
  return (
    <div style={{ margin: '0 14px 12px', padding: 14, background: c.surface, borderRadius: 14, border: `1px solid ${c.line}`, fontFamily: V3_SANS, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: c.no, boxShadow: `0 0 8px ${c.no}` }} />
        <span style={{ fontFamily: V3_MONO, fontSize: 11, fontWeight: 700, color: c.text, letterSpacing: 1.5 }}>HOT TAKE / FEED</span>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: c.surfaceAlt, border: `1px solid ${c.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: c.text, flexShrink: 0 }}>{d.user[0]}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, marginBottom: 4, fontFamily: V3_MONO, letterSpacing: 0.3 }}>
            <span style={{ color: c.text, fontWeight: 700 }}>{d.user}</span> <span style={{ color: c.yes, fontWeight: 700 }}>[{d.side}]</span> <span style={{ color: c.sub }}>· {d.event}</span>
          </div>
          <div style={{ fontSize: 13, color: c.text, lineHeight: 1.5 }}>{d.text}</div>
          <div style={{ fontFamily: V3_MONO, fontSize: 10, color: c.sub, marginTop: 6 }}>♥ {d.likes} · ⬡ {d.replies}</div>
        </div>
      </div>
    </div>
  );
}

function V3TabBar({ c }) {
  const items = [
    { k:'sq', label:'SQUARE', icon:'◇', on: true },
    { k:'rk', label:'RANK', icon:'△' },
    { k:'pl', icon:'+' },
    { k:'ms', label:'MSGS', icon:'◷' },
    { k:'me', label:'ME', icon:'○' },
  ];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', alignItems: 'center',
      borderTop: `1px solid ${c.line}`, background: c.surface, padding: '8px 0 24px',
      fontFamily: V3_MONO,
    }}>
      {items.map((it) => {
        if (it.k === 'pl') {
          return (
            <div key="pl" style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: c.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 300, boxShadow: `0 0 18px ${c.accentGlow}` }}>+</div>
            </div>
          );
        }
        return (
          <div key={it.k} style={{ textAlign: 'center', color: it.on ? c.accent : c.sub }}>
            <div style={{ fontSize: 16, lineHeight: 1, fontFamily: V3_MONO }}>{it.icon}</div>
            <div style={{ fontSize: 9, marginTop: 5, letterSpacing: 1, fontWeight: it.on ? 700 : 500 }}>{it.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function V3Page({ dark = false, dense = false }) {
  const c = dark ? V3_T.dark : V3_T.light;
  const events = window.PS_DATA.events;
  const list = dense ? events : events.slice(0, 3);
  return (
    <div style={{
      width: 375, height: 812, background: c.bg, color: c.text,
      overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: V3_SANS,
      backgroundImage: `linear-gradient(${c.grid} 1px, transparent 1px), linear-gradient(90deg, ${c.grid} 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
    }}>
      <V3StatusBar c={c} />
      <V3Header c={c} />
      {!dense && <V3UserModule c={c} />}
      <V3Tabs c={c} />
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: dense ? 0 : 12 }}>
        {!dense && <V3Leaderboard c={c} />}
        {list.map((e) => <V3EventCard key={e.id} e={e} c={c} dense={dense} />)}
        {!dense && <V3HotTake c={c} />}
        <div style={{ height: 12 }} />
      </div>
      <V3TabBar c={c} />
    </div>
  );
}

window.V3Page = V3Page;
