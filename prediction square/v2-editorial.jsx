// V2 — Editorial / 即刻信息流风
// Aesthetic: 大字标题 + 充足留白 + 卡片化 + 衬线标题 + 强可读性
// Light: 米白 + 墨黑 + 海军蓝 / Dark: 深炭 + 暖白 + 暮光蓝

const V2_T = {
  light: {
    bg: '#FAF8F4',
    surface: '#FFFFFF',
    text: '#0F1419',
    sub: '#5C6168',
    mut: '#9AA0A6',
    line: 'rgba(15,20,25,0.08)',
    lineHard: 'rgba(15,20,25,0.16)',
    yes: '#0F7A4E',
    yesBg: '#E6F4EC',
    no: '#C73838',
    noBg: '#FBEAE9',
    accent: '#1F3A8A',
    chip: '#F0EDE6',
    placeholder: '#E8E3D8',
  },
  dark: {
    bg: '#15161A',
    surface: '#1E1F24',
    text: '#F2EFE8',
    sub: '#A0A4AE',
    mut: '#6B6F78',
    line: 'rgba(242,239,232,0.08)',
    lineHard: 'rgba(242,239,232,0.18)',
    yes: '#5BD08A',
    yesBg: 'rgba(91,208,138,0.12)',
    no: '#FF7B7B',
    noBg: 'rgba(255,123,123,0.12)',
    accent: '#94A8FF',
    chip: '#26282E',
    placeholder: '#2A2C32',
  },
};

const V2_SERIF = `'Source Serif 4', 'Noto Serif SC', 'Songti SC', Georgia, serif`;
const V2_SANS = `'Inter', -apple-system, 'PingFang SC', 'Helvetica Neue', sans-serif`;

function V2StatusBar({ c }) {
  return (
    <div style={{ height: 44, padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: V2_SANS, fontSize: 15, color: c.text, fontWeight: 600 }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <span style={{ width: 16, height: 10, borderRadius: 2.5, border: `1.4px solid ${c.text}`, position: 'relative' }}>
          <span style={{ position: 'absolute', inset: 1.4, background: c.text, width: '78%', borderRadius: 1 }} />
        </span>
      </div>
    </div>
  );
}

function V2Header({ c }) {
  return (
    <div style={{ padding: '6px 18px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontFamily: V2_SERIF, fontSize: 26, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1, color: c.text }}>
          Prediction
        </div>
        <div style={{ fontFamily: V2_SERIF, fontSize: 26, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1, color: c.text, fontStyle: 'italic' }}>
          Square<span style={{ fontFamily: V2_SANS, fontStyle: 'normal', fontSize: 10, fontWeight: 600, color: c.accent, letterSpacing: 1, marginLeft: 6, verticalAlign: 'middle' }}>先行版</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: 999, border: `1px solid ${c.lineHard}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.text, fontSize: 16 }}>⌕</div>
        <div style={{ width: 36, height: 36, borderRadius: 999, border: `1px solid ${c.lineHard}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.text, fontSize: 14 }}>♡</div>
      </div>
    </div>
  );
}

function V2UserStrip({ c }) {
  return (
    <div style={{ margin: '0 18px 14px', padding: '14px 16px', background: c.surface, borderRadius: 16, border: `1px solid ${c.line}`, display: 'flex', alignItems: 'center', gap: 14, fontFamily: V2_SANS }}>
      <div>
        <div style={{ fontSize: 11, color: c.sub, marginBottom: 2 }}>积分余额</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: c.text, letterSpacing: -0.5, fontFamily: V2_SANS }}>4,280</div>
      </div>
      <div style={{ width: 1, height: 30, background: c.line }} />
      <div>
        <div style={{ fontSize: 11, color: c.sub, marginBottom: 2 }}>今日盈亏</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: c.yes }}>+128</div>
      </div>
      <div style={{ width: 1, height: 30, background: c.line }} />
      <div>
        <div style={{ fontSize: 11, color: c.sub, marginBottom: 2 }}>连胜</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: c.text }}>3<span style={{ fontSize: 11, color: c.sub, fontWeight: 500 }}> 场</span></div>
      </div>
      <div style={{ marginLeft: 'auto', padding: '8px 12px', background: c.text, color: c.bg, borderRadius: 999, fontSize: 12, fontWeight: 600 }}>签到 +50</div>
    </div>
  );
}

function V2Tabs({ c }) {
  const cats = window.PS_DATA.categories;
  const [active, setActive] = React.useState('recommend');
  return (
    <div style={{ borderBottom: `1px solid ${c.line}`, background: c.bg, position: 'sticky', top: 0, zIndex: 5 }}>
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none', padding: '0 12px' }}>
        {cats.map((cat) => {
          const on = active === cat.id;
          return (
            <button key={cat.id} onClick={() => setActive(cat.id)} style={{
              padding: '12px 10px', background: 'transparent', border: 0, position: 'relative',
              fontFamily: V2_SANS, fontSize: 14, fontWeight: on ? 700 : 500,
              color: on ? c.text : c.sub, whiteSpace: 'nowrap', cursor: 'pointer',
            }}>
              {cat.label}
              {on && <div style={{ position:'absolute', left: 10, right: 10, bottom: 6, height: 3, background: c.text, borderRadius: 2 }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function V2OptionPill({ c, side, pct, odd, dense }) {
  const isYes = side === 'YES';
  const tColor = isYes ? c.yes : c.no;
  return (
    <div style={{
      flex: 1, padding: dense ? '8px 10px' : '12px 14px', background: isYes ? c.yesBg : c.noBg,
      borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      fontFamily: V2_SANS,
    }}>
      <span style={{ fontSize: dense ? 11 : 12, fontWeight: 700, color: tColor, letterSpacing: 0.5 }}>{side}</span>
      <span>
        <span style={{ fontSize: dense ? 14 : 18, fontWeight: 700, color: tColor, letterSpacing: -0.3 }}>{pct}<span style={{ fontSize: dense ? 9 : 11 }}>%</span></span>
        {!dense && <span style={{ fontSize: 10, color: tColor, opacity: 0.7, marginLeft: 4 }}>×{odd}</span>}
      </span>
    </div>
  );
}

function V2EventCard({ e, c, dense }) {
  if (dense) {
    return (
      <div style={{ padding: '12px 18px', borderBottom: `1px solid ${c.line}` }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, fontFamily: V2_SANS, fontSize: 11, color: c.sub }}>
          <span style={{ padding: '1px 7px', background: c.chip, borderRadius: 3, color: c.text, fontWeight: 600 }}>{e.cat}</span>
          {e.ai && <span style={{ color: c.accent, fontWeight: 600 }}>AI</span>}
          <span style={{ marginLeft: 'auto' }}>{e.deadline}</span>
        </div>
        <div style={{ fontFamily: V2_SERIF, fontSize: 14, fontWeight: 600, lineHeight: 1.35, color: c.text, marginBottom: 8, letterSpacing: -0.1 }}>
          {e.title}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <V2OptionPill c={c} side="YES" pct={e.yesPct} odd={e.yesOdd} dense />
          <V2OptionPill c={c} side="NO" pct={e.noPct} odd={e.noOdd} dense />
        </div>
      </div>
    );
  }
  return (
    <div style={{ margin: '0 18px 14px', padding: 16, background: c.surface, borderRadius: 16, border: `1px solid ${c.line}`, fontFamily: V2_SANS }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 11, color: c.sub }}>
        <span style={{ padding: '2px 8px', background: c.chip, borderRadius: 4, color: c.text, fontWeight: 600 }}>{e.cat}</span>
        {e.ai && <span style={{ padding: '2px 8px', borderRadius: 4, border: `1px solid ${c.accent}`, color: c.accent, fontWeight: 600, fontSize: 10 }}>AI 设局</span>}
        {e.hot && <span style={{ color: c.no, fontWeight: 600, fontSize: 11 }}>🔥 热议</span>}
        <span style={{ marginLeft: 'auto' }}>{e.deadline}</span>
      </div>

      <div style={{ fontFamily: V2_SERIF, fontSize: 19, fontWeight: 700, lineHeight: 1.32, letterSpacing: -0.3, color: c.text, marginBottom: 6 }}>
        {e.title}
      </div>
      <div style={{ fontSize: 13, color: c.sub, lineHeight: 1.5, marginBottom: 14 }}>{e.desc}</div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <V2OptionPill c={c} side="YES" pct={e.yesPct} odd={e.yesOdd} />
        <V2OptionPill c={c} side="NO" pct={e.noPct} odd={e.noOdd} />
      </div>

      <div style={{ display: 'flex', gap: 14, fontSize: 11, color: c.sub, paddingTop: 10, borderTop: `1px solid ${c.line}` }}>
        <span>奖池 <span style={{ color: c.text, fontWeight: 600 }}>{e.pool}</span></span>
        <span>{e.participants.toLocaleString()} 人参与</span>
        <span style={{ color: e.change>=0 ? c.yes : c.no, fontWeight: 600 }}>24h {e.change>=0?'+':''}{e.change}%</span>
      </div>
    </div>
  );
}

function V2Leaderboard({ c }) {
  return (
    <div style={{ margin: '0 18px 14px', padding: 16, background: c.surface, borderRadius: 16, border: `1px solid ${c.line}`, fontFamily: V2_SANS }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: V2_SERIF, fontSize: 17, fontWeight: 700, color: c.text, letterSpacing: -0.2 }}>高手在押什么</div>
          <div style={{ fontSize: 11, color: c.sub, marginTop: 2 }}>本周收益榜 Top 3</div>
        </div>
        <div style={{ fontSize: 12, color: c.accent, fontWeight: 600 }}>查看全部 →</div>
      </div>
      {window.PS_DATA.leaders.map((l, i) => (
        <div key={l.rank} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: i>0 ? `1px solid ${c.line}` : 0 }}>
          <div style={{ width: 22, fontSize: 13, fontWeight: 700, color: l.rank===1 ? c.no : c.sub, textAlign: 'center' }}>{l.rank}</div>
          <div style={{ width: 32, height: 32, borderRadius: 999, background: c.chip, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: c.text }}>{l.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{l.name}</div>
            <div style={{ fontSize: 10, color: c.sub }}>{l.tag} · 胜率 {l.wr}% · ×{l.streak} 连胜</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: c.yes, fontFamily: V2_SANS }}>{l.profit}</div>
        </div>
      ))}
    </div>
  );
}

function V2Discussions({ c }) {
  return (
    <div style={{ margin: '0 18px 14px' }}>
      <div style={{ fontFamily: V2_SERIF, fontSize: 17, fontWeight: 700, color: c.text, marginBottom: 10, letterSpacing: -0.2 }}>热门观点</div>
      {window.PS_DATA.discussions.slice(0, 2).map((d, i) => (
        <div key={i} style={{ padding: 14, background: c.surface, borderRadius: 14, border: `1px solid ${c.line}`, marginBottom: 8, fontFamily: V2_SANS }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 999, background: c.chip, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: c.text }}>{d.user[0]}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: c.text }}>{d.user}</div>
            <div style={{ padding: '2px 6px', background: d.side==='YES' ? c.yesBg : c.noBg, color: d.side==='YES' ? c.yes : c.no, fontSize: 10, fontWeight: 700, borderRadius: 4 }}>{d.side}</div>
            <div style={{ fontSize: 11, color: c.sub, marginLeft: 'auto' }}>· {d.event}</div>
          </div>
          <div style={{ fontSize: 13.5, color: c.text, lineHeight: 1.5 }}>{d.text}</div>
          <div style={{ fontSize: 11, color: c.sub, marginTop: 8, display: 'flex', gap: 12 }}>
            <span>♥ {d.likes}</span>
            <span>💬 {d.replies}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function V2TabBar({ c }) {
  const items = [
    { k:'sq', label:'广场', icon:'⌂', on: true },
    { k:'rk', label:'排行', icon:'☰' },
    { k:'pl', label:'', icon:'+' },
    { k:'ms', label:'消息', icon:'◷' },
    { k:'me', label:'我的', icon:'◉' },
  ];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', alignItems: 'center',
      borderTop: `1px solid ${c.line}`, background: c.bg, padding: '8px 0 24px',
      fontFamily: V2_SANS,
    }}>
      {items.map((it) => {
        if (it.k === 'pl') {
          return (
            <div key="pl" style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 46, height: 46, borderRadius: 999, background: c.text, color: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 300 }}>+</div>
            </div>
          );
        }
        return (
          <div key={it.k} style={{ textAlign: 'center', color: it.on ? c.text : c.sub }}>
            <div style={{ fontSize: 20, lineHeight: 1 }}>{it.icon}</div>
            <div style={{ fontSize: 10, marginTop: 4, fontWeight: it.on ? 700 : 500 }}>{it.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function V2Page({ dark = false, dense = false }) {
  const c = dark ? V2_T.dark : V2_T.light;
  const events = window.PS_DATA.events;
  const list = dense ? events : events.slice(0, 3);
  return (
    <div style={{ width: 375, height: 812, background: c.bg, color: c.text, overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: V2_SANS }}>
      <V2StatusBar c={c} />
      <V2Header c={c} />
      {!dense && <V2UserStrip c={c} />}
      <V2Tabs c={c} />
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: dense ? 0 : 14 }}>
        {!dense && <V2Leaderboard c={c} />}
        {list.map((e) => <V2EventCard key={e.id} e={e} c={c} dense={dense} />)}
        {!dense && <V2Discussions c={c} />}
        <div style={{ height: 12 }} />
      </div>
      <V2TabBar c={c} />
    </div>
  );
}

window.V2Page = V2Page;
