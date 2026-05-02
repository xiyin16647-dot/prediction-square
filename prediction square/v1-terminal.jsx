// V1 — Terminal / Bloomberg style
// Aesthetic: 等宽字 + 细线分割 + 高对比 + 单色克制 + 强数据感
// Light variant: 米白底 + 墨黑字 + 朱红强调 / Dark variant: 近黑底 + 米色字 + 琥珀强调

const V1_T = {
  // Light theme
  light: {
    bg: '#F4F1EA',
    surface: '#FFFFFF',
    line: '#1A1A1A',
    lineSoft: 'rgba(26,26,26,0.12)',
    text: '#0E0E0E',
    sub: 'rgba(14,14,14,0.55)',
    mut: 'rgba(14,14,14,0.42)',
    yes: '#0A6B3A',
    no: '#B81E2C',
    accent: '#B81E2C',
    chip: 'rgba(26,26,26,0.06)',
  },
  // Dark theme
  dark: {
    bg: '#0B0B0C',
    surface: '#141416',
    line: '#E8E4D8',
    lineSoft: 'rgba(232,228,216,0.14)',
    text: '#EDE7D6',
    sub: 'rgba(237,231,214,0.55)',
    mut: 'rgba(237,231,214,0.40)',
    yes: '#3FCB7E',
    no: '#FF6470',
    accent: '#FFB23F',
    chip: 'rgba(237,231,214,0.07)',
  },
};

const V1_FONTS = `'IBM Plex Mono', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace`;
const V1_SANS = `'Inter', -apple-system, 'PingFang SC', 'Helvetica Neue', sans-serif`;

function V1StatusBar({ c }) {
  return (
    <div style={{
      height: 44, padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: V1_FONTS, fontSize: 14, color: c.text, fontWeight: 600,
    }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
        <span style={{ letterSpacing: 1 }}>•••</span>
        <span style={{ width: 16, height: 10, border: `1.2px solid ${c.text}`, borderRadius: 2, position: 'relative' }}>
          <span style={{ position: 'absolute', inset: 1, background: c.text, width: '78%' }} />
        </span>
      </div>
    </div>
  );
}

function V1Header({ c, dense }) {
  return (
    <div style={{ borderBottom: `1px solid ${c.line}`, background: c.bg }}>
      <div style={{ padding: '6px 16px 10px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: V1_FONTS, fontSize: 11, letterSpacing: 2, color: c.text, fontWeight: 700 }}>
          PREDICTION SQUARE / <span style={{ color: c.accent }}>先行版</span>
        </div>
        <div style={{ fontFamily: V1_FONTS, fontSize: 10, color: c.sub, letterSpacing: 1 }}>
          MON 06.09 · 09:41
        </div>
      </div>
      {/* live ticker */}
      <div style={{
        display: 'flex', gap: 18, padding: '6px 16px', borderTop: `1px solid ${c.lineSoft}`,
        fontFamily: V1_FONTS, fontSize: 10, letterSpacing: 0.5, color: c.sub, whiteSpace: 'nowrap', overflow: 'hidden',
      }}>
        <span><span style={{ color: c.yes }}>▲</span> FED.RATE 62%</span>
        <span><span style={{ color: c.no }}>▼</span> BTC.120K 28%</span>
        <span><span style={{ color: c.yes }}>▲</span> IPH17 41%</span>
        <span><span style={{ color: c.no }}>▼</span> LAL.G7 49%</span>
        <span style={{ color: c.mut }}>VOL 4.2M</span>
      </div>
      {/* user strip */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderTop: `1px solid ${c.line}`, fontFamily: V1_FONTS, fontSize: 11, color: c.text,
      }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: 9, color: c.sub, letterSpacing: 1 }}>BAL</div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>4,280<span style={{ fontSize: 10, color: c.sub, marginLeft: 3 }}>P</span></div>
          </div>
          <div style={{ width: 1, height: 22, background: c.lineSoft }} />
          <div>
            <div style={{ fontSize: 9, color: c.sub, letterSpacing: 1 }}>PNL.D</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: c.yes }}>+128</div>
          </div>
          <div style={{ width: 1, height: 22, background: c.lineSoft }} />
          <div>
            <div style={{ fontSize: 9, color: c.sub, letterSpacing: 1 }}>STRK</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>3W</div>
          </div>
        </div>
        <div style={{
          padding: '6px 10px', border: `1px solid ${c.line}`, fontSize: 10, letterSpacing: 1, fontWeight: 700,
        }}>SIGN&nbsp;IN ▸</div>
      </div>
    </div>
  );
}

function V1Tabs({ c }) {
  const cats = window.PS_DATA.categories;
  const [active, setActive] = React.useState('recommend');
  return (
    <div style={{ borderBottom: `1px solid ${c.line}`, background: c.bg, position: 'sticky', top: 0, zIndex: 5 }}>
      <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {cats.map((cat, i) => {
          const on = active === cat.id;
          return (
            <button key={cat.id} onClick={() => setActive(cat.id)} style={{
              padding: '10px 14px', background: 'transparent', border: 0, borderRight: `1px solid ${c.lineSoft}`,
              fontFamily: V1_FONTS, fontSize: 11, letterSpacing: 1, fontWeight: on ? 700 : 500,
              color: on ? c.text : c.sub, position: 'relative', whiteSpace: 'nowrap', cursor: 'pointer',
            }}>
              <span style={{ marginRight: 4, color: c.mut }}>{String(i+1).padStart(2,'0')}</span>
              {cat.label.toUpperCase()}
              {on && <div style={{ position:'absolute', left:0, right:0, bottom:-1, height:2, background:c.accent }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function V1OddBar({ c, yes, no, dense }) {
  return (
    <div>
      <div style={{ display: 'flex', height: dense ? 4 : 6, border: `1px solid ${c.line}`, marginBottom: dense ? 4 : 6 }}>
        <div style={{ width: `${yes}%`, background: c.yes }} />
        <div style={{ width: `${no}%`, background: 'transparent', borderLeft: `1px solid ${c.line}` }} />
      </div>
    </div>
  );
}

function V1EventCard({ e, c, dense }) {
  return (
    <div style={{
      padding: dense ? '10px 16px' : '14px 16px',
      borderBottom: `1px solid ${c.lineSoft}`,
      fontFamily: V1_SANS, color: c.text,
    }}>
      {/* meta line */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: dense ? 4 : 8, fontFamily: V1_FONTS, fontSize: 10, color: c.sub, letterSpacing: 1 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ padding: '1px 5px', border: `1px solid ${c.lineSoft}`, color: c.text, fontWeight: 700 }}>{e.cat.toUpperCase()}</span>
          {e.ai && <span style={{ color: c.accent, fontWeight: 700 }}>· AI</span>}
          {e.hot && <span style={{ color: c.no, fontWeight: 700 }}>· HOT</span>}
          <span style={{ color: c.mut }}>#{e.id.toUpperCase()}</span>
        </div>
        <span>{e.deadline}</span>
      </div>

      {/* title */}
      <div style={{
        fontSize: dense ? 13 : 15, fontWeight: 600, lineHeight: 1.4, letterSpacing: -0.1,
        marginBottom: dense ? 6 : 10,
      }}>{e.title}</div>

      {!dense && (
        <div style={{ fontSize: 12, color: c.sub, marginBottom: 10, lineHeight: 1.5 }}>{e.desc}</div>
      )}

      {/* odd bar */}
      <V1OddBar c={c} yes={e.yesPct} no={e.noPct} dense={dense} />

      {/* options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: dense ? 4 : 8 }}>
        <button style={{
          padding: dense ? '7px 8px' : '10px 10px', background: 'transparent',
          border: `1px solid ${c.line}`, color: c.text, fontFamily: V1_FONTS,
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', cursor: 'pointer',
        }}>
          <span style={{ fontSize: 10, letterSpacing: 1, color: c.yes, fontWeight: 700 }}>YES</span>
          <span style={{ fontSize: dense ? 13 : 15, fontWeight: 700 }}>{e.yesPct}%<span style={{ fontSize: 9, color: c.sub, marginLeft: 4 }}>×{e.yesOdd}</span></span>
        </button>
        <button style={{
          padding: dense ? '7px 8px' : '10px 10px', background: 'transparent',
          border: `1px solid ${c.line}`, color: c.text, fontFamily: V1_FONTS,
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', cursor: 'pointer',
        }}>
          <span style={{ fontSize: 10, letterSpacing: 1, color: c.no, fontWeight: 700 }}>NO&nbsp;</span>
          <span style={{ fontSize: dense ? 13 : 15, fontWeight: 700 }}>{e.noPct}%<span style={{ fontSize: 9, color: c.sub, marginLeft: 4 }}>×{e.noOdd}</span></span>
        </button>
      </div>

      {!dense && (
        <div style={{
          display: 'flex', gap: 14, marginTop: 10, fontFamily: V1_FONTS, fontSize: 10, color: c.sub, letterSpacing: 0.5,
        }}>
          <span>POOL <span style={{ color: c.text, fontWeight: 600 }}>{e.pool}</span></span>
          <span>USR <span style={{ color: c.text, fontWeight: 600 }}>{e.participants.toLocaleString()}</span></span>
          <span>24H <span style={{ color: e.change>=0 ? c.yes : c.no, fontWeight: 600 }}>{e.change>=0?'+':''}{e.change}%</span></span>
        </div>
      )}
    </div>
  );
}

function V1Leaderboard({ c }) {
  return (
    <div style={{ borderTop: `1px solid ${c.line}`, borderBottom: `1px solid ${c.line}`, background: c.surface, fontFamily: V1_SANS }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: `1px solid ${c.lineSoft}` }}>
        <div style={{ fontFamily: V1_FONTS, fontSize: 10, letterSpacing: 2, color: c.text, fontWeight: 700 }}>▌LEADERS · 7D</div>
        <div style={{ fontFamily: V1_FONTS, fontSize: 10, color: c.sub, letterSpacing: 1 }}>VIEW ALL ▸</div>
      </div>
      {window.PS_DATA.leaders.map((l, i) => (
        <div key={l.rank} style={{
          display: 'grid', gridTemplateColumns: '20px 28px 1fr auto auto',
          alignItems: 'center', gap: 10, padding: '8px 16px',
          borderBottom: i < 2 ? `1px solid ${c.lineSoft}` : 'none',
          fontFamily: V1_FONTS, fontSize: 12, color: c.text,
        }}>
          <span style={{ color: l.rank===1?c.accent:c.sub, fontWeight: 700 }}>{String(l.rank).padStart(2,'0')}</span>
          <div style={{ width: 24, height: 24, border: `1px solid ${c.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{l.avatar}</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{l.name}</div>
            <div style={{ fontSize: 9, color: c.sub, letterSpacing: 1 }}>{l.tag.toUpperCase()} · WR {l.wr}%</div>
          </div>
          <div style={{ fontSize: 10, color: c.sub }}>×{l.streak}</div>
          <div style={{ fontSize: 13, color: c.yes, fontWeight: 700 }}>{l.profit}</div>
        </div>
      ))}
    </div>
  );
}

function V1Discussion({ c }) {
  const d = window.PS_DATA.discussions[0];
  return (
    <div style={{ padding: '14px 16px', borderBottom: `1px solid ${c.lineSoft}`, background: c.bg }}>
      <div style={{ fontFamily: V1_FONTS, fontSize: 10, letterSpacing: 2, color: c.text, fontWeight: 700, marginBottom: 8 }}>▌HOT TAKE</div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ width: 28, height: 28, border: `1px solid ${c.line}`, fontFamily: V1_FONTS, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>量</div>
        <div style={{ flex: 1, fontFamily: V1_SANS }}>
          <div style={{ fontSize: 11, color: c.sub, marginBottom: 4, fontFamily: V1_FONTS, letterSpacing: 0.5 }}>
            <span style={{ color: c.text, fontWeight: 700 }}>{d.user}</span> · <span style={{ color: c.yes, fontWeight: 700 }}>{d.side}</span> on <span style={{ color: c.text }}>{d.event}</span>
          </div>
          <div style={{ fontSize: 13, color: c.text, lineHeight: 1.5 }}>"{d.text}"</div>
          <div style={{ fontFamily: V1_FONTS, fontSize: 10, color: c.sub, marginTop: 6, letterSpacing: 0.5 }}>♥ {d.likes} · ⌬ {d.replies}</div>
        </div>
      </div>
    </div>
  );
}

function V1TabBar({ c }) {
  const items = [
    { k: 'sq', label: 'SQUARE', on: true },
    { k: 'rk', label: 'RANK' },
    { k: 'pl', label: '+' },
    { k: 'ms', label: 'MSGS' },
    { k: 'me', label: 'ME' },
  ];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(5,1fr)',
      borderTop: `1px solid ${c.line}`, background: c.bg,
      fontFamily: V1_FONTS,
    }}>
      {items.map((it, i) => (
        <div key={it.k} style={{
          padding: '12px 0 22px',
          textAlign: 'center', fontSize: 10, letterSpacing: 1.5, fontWeight: 700,
          color: it.on ? c.accent : c.sub,
          borderRight: i<4 ? `1px solid ${c.lineSoft}` : 0,
          background: it.k==='pl' ? c.text : 'transparent',
          color: it.k==='pl' ? c.bg : (it.on ? c.accent : c.sub),
        }}>{it.label}</div>
      ))}
    </div>
  );
}

function V1Page({ dark = false, dense = false }) {
  const c = dark ? V1_T.dark : V1_T.light;
  const events = window.PS_DATA.events;
  const list = dense ? events : events.slice(0, 4);
  return (
    <div style={{ width: 375, height: 812, background: c.bg, color: c.text, overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: V1_SANS }}>
      <V1StatusBar c={c} />
      <V1Header c={c} dense={dense} />
      <V1Tabs c={c} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {!dense && <V1Leaderboard c={c} />}
        {list.map((e, i) => (
          <V1EventCard key={e.id} e={e} c={c} dense={dense} />
        ))}
        {!dense && <V1Discussion c={c} />}
      </div>
      <V1TabBar c={c} />
    </div>
  );
}

window.V1Page = V1Page;
