// Square (Home) tab — 最新市场 → 即将截止 → 热门市场 → 高手榜 → 热门观点

const { OptionPill, SquareHeader, UserStrip, CategoryTabs } = window;

// Editorial section header — used by every block on home
function SectionHeader({ c, title, meta, hint, action, compact }) {
  const F = window.PSQ_FONTS;
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: compact ? '0 18px 6px' : '0 18px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: F.serif, fontSize: compact ? 15 : 18, fontWeight: 700, color: c.text, letterSpacing: -0.3 }}>{title}</span>
        {meta && <span style={{ fontSize: 10.5, color: c.sub, fontFamily: F.mono }}>{meta}</span>}
      </div>
      {action ? action : (hint && <span style={{ fontSize: 11, color: c.sub, fontFamily: F.sans }}>{hint}</span>)}
    </div>
  );
}

// 最新市场 — compact horizontal rail (single-line preview)
function LatestMarketsRail({ c, onOpen }) {
  const F = window.PSQ_FONTS;
  const events = window.PS_DATA.events;
  const items = window.PSQ_EXT.latestMarkets.map(x => {
    const ev = events.find(e => e.id === x.id);
    return ev ? { ...ev, postedAt: x.postedAt } : null;
  }).filter(Boolean);

  return (
    <div style={{ marginBottom: 14 }}>
      <SectionHeader compact c={c} title="最新市场" meta={`今日新上 · ${items.length} 条`} hint="按上架时间" />
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', padding: '0 18px 4px' }}>
        {items.map((e) => (
          <button key={e.id + e.postedAt} onClick={() => onOpen(e.id)} style={{
            flexShrink: 0, width: 220, padding: 10,
            background: c.surface, color: c.text,
            borderRadius: 12, border: `1px solid ${c.line}`,
            textAlign: 'left', cursor: 'pointer', fontFamily: F.sans,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: c.sub }}>
              <span style={{ padding: '0 6px', borderRadius: 3, background: c.chip, color: c.text, fontWeight: 600 }}>{e.cat}</span>
              {e.ai && <span style={{ fontWeight: 700, color: c.text, fontSize: 10 }}>AI</span>}
              <span style={{ marginLeft: 'auto', fontFamily: F.mono }}>{e.postedAt}</span>
            </div>
            <div style={{ fontFamily: F.serif, fontSize: 13, fontWeight: 700, lineHeight: 1.3, letterSpacing: -0.2, color: c.text, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {e.title}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 10.5 }}>
              <span style={{ color: c.yes, fontWeight: 700 }}>YES {e.yesPct}%</span>
              <span style={{ color: c.no, fontWeight: 700 }}>NO {e.noPct}%</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// 即将截止 — compact rail with countdown
function ClosingSoonRail({ c, onOpen }) {
  const F = window.PSQ_FONTS;
  const events = window.PS_DATA.events;
  const items = window.PSQ_EXT.closingSoon.map(x => {
    const ev = events.find(e => e.id === x.id);
    return ev ? { ...ev, countdown: x.countdown } : null;
  }).filter(Boolean);

  return (
    <div style={{ marginBottom: 14 }}>
      <SectionHeader compact c={c} title="即将截止" meta={`24h 内 · ${items.length} 条`} hint="抓紧下注" />
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', padding: '0 18px 4px' }}>
        {items.map((e) => (
          <button key={e.id + 'cs'} onClick={() => onOpen(e.id)} style={{
            flexShrink: 0, width: 200, padding: 10,
            background: c.surface, color: c.text,
            borderRadius: 12, border: `1px solid ${c.line}`,
            textAlign: 'left', cursor: 'pointer', fontFamily: F.sans,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: c.sub }}>
              <span style={{ padding: '0 6px', borderRadius: 3, background: c.chip, color: c.text, fontWeight: 600 }}>{e.cat}</span>
              <span style={{ marginLeft: 'auto', fontFamily: F.mono, color: c.no, fontWeight: 700 }}>● {e.countdown}</span>
            </div>
            <div style={{ fontFamily: F.serif, fontSize: 12.5, fontWeight: 700, lineHeight: 1.3, letterSpacing: -0.2, color: c.text, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {e.title}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 10.5 }}>
              <span style={{ color: c.yes, fontWeight: 700 }}>YES {e.yesPct}%·{e.yesOdd}</span>
              <span style={{ color: c.no,  fontWeight: 700 }}>NO {e.noPct}%·{e.noOdd}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function EventCard({ e, c, dense, onOpen }) {
  const F = window.PSQ_FONTS;
  if (dense) {
    return (
      <div role="button" tabIndex={0} onClick={() => onOpen(e.id)} style={{
        display: 'block', width: '100%', textAlign: 'left',
        padding: '12px 18px', borderBottom: `1px solid ${c.line}`,
        background: 'transparent', cursor: 'pointer',
        fontFamily: F.sans,
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, fontSize: 11, color: c.sub }}>
          <span style={{ padding: '1px 7px', background: c.chip, borderRadius: 3, color: c.text, fontWeight: 600 }}>{e.cat}</span>
          {e.ai && <span style={{ color: c.text, fontWeight: 700 }}>AI</span>}
          <span style={{ marginLeft: 'auto' }}>{e.deadline}</span>
        </div>
        <div style={{ fontFamily: F.serif, fontSize: 14, fontWeight: 600, lineHeight: 1.35, color: c.text, marginBottom: 8, letterSpacing: -0.1 }}>
          {e.title}
        </div>
        <div style={{ display: 'flex', gap: 6 }} onClick={(ev) => ev.stopPropagation()}>
          <OptionPill c={c} side="YES" pct={e.yesPct} odd={e.yesOdd} dense onClick={() => onOpen(e.id)} />
          <OptionPill c={c} side="NO"  pct={e.noPct}  odd={e.noOdd}  dense onClick={() => onOpen(e.id)} />
        </div>
      </div>
    );
  }
  return (
    <div role="button" tabIndex={0} onClick={() => onOpen(e.id)} style={{
      display: 'block', width: 'calc(100% - 36px)', textAlign: 'left',
      margin: '0 18px 14px', padding: 16, background: c.surface, borderRadius: 16,
      border: `1px solid ${c.line}`, fontFamily: F.sans, cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 11, color: c.sub }}>
        <span style={{ padding: '2px 8px', background: c.chip, borderRadius: 4, color: c.text, fontWeight: 600 }}>{e.cat}</span>
        {e.ai && <span style={{ padding: '2px 8px', borderRadius: 4, border: `1px solid ${c.lineHard}`, color: c.text, fontWeight: 700, fontSize: 10 }}>AI 设局</span>}
        {e.hot && <span style={{ color: c.no, fontWeight: 600, fontSize: 11 }}>🔥 热议</span>}
        <span style={{ marginLeft: 'auto' }}>{e.deadline}</span>
      </div>
      <div style={{ fontFamily: F.serif, fontSize: 19, fontWeight: 700, lineHeight: 1.32, letterSpacing: -0.3, color: c.text, marginBottom: 6 }}>
        {e.title}
      </div>
      <div style={{ fontSize: 13, color: c.sub, lineHeight: 1.5, marginBottom: 14 }}>{e.desc}</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }} onClick={(ev) => ev.stopPropagation()}>
        <OptionPill c={c} side="YES" pct={e.yesPct} odd={e.yesOdd} onClick={() => onOpen(e.id)} />
        <OptionPill c={c} side="NO"  pct={e.noPct}  odd={e.noOdd}  onClick={() => onOpen(e.id)} />
      </div>
      <div style={{ display: 'flex', gap: 14, fontSize: 11, color: c.sub, paddingTop: 10, borderTop: `1px solid ${c.line}` }}>
        <span>奖池 <span style={{ color: c.text, fontWeight: 600 }}>{e.pool}</span></span>
        <span>{e.participants.toLocaleString()} 人参与</span>
        <span style={{ color: e.change>=0 ? c.yes : c.no, fontWeight: 600 }}>24h {e.change>=0?'+':''}{e.change}%</span>
      </div>
    </div>
  );
}

function LeaderboardTeaser({ c, onOpenRank }) {
  const F = window.PSQ_FONTS;
  return (
    <div style={{ margin: '4px 18px 18px', padding: 16, background: c.surface, borderRadius: 16, border: `1px solid ${c.line}`, fontFamily: F.sans }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: F.serif, fontSize: 17, fontWeight: 700, color: c.text, letterSpacing: -0.2 }}>高手在押什么</div>
          <div style={{ fontSize: 11, color: c.sub, marginTop: 2 }}>本周收益榜 Top 3</div>
        </div>
        <button onClick={onOpenRank} style={{ background: 'transparent', border: 0, fontSize: 12, color: c.text, fontWeight: 600, cursor: 'pointer' }}>查看全部 →</button>
      </div>
      {window.PS_DATA.leaders.map((l, i) => (
        <div key={l.rank} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: i>0 ? `1px solid ${c.line}` : 0 }}>
          <div style={{ width: 22, fontSize: 13, fontWeight: 700, color: l.rank===1 ? c.gold : c.sub, textAlign: 'center' }}>{l.rank}</div>
          <div style={{ width: 32, height: 32, borderRadius: 999, background: c.chip, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: c.text }}>{l.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{l.name}</div>
            <div style={{ fontSize: 10, color: c.sub }}>{l.tag} · 胜率 {l.wr}% · ×{l.streak} 连胜</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: c.yes }}>{l.profit}</div>
        </div>
      ))}
    </div>
  );
}

function Discussions({ c }) {
  const F = window.PSQ_FONTS;
  return (
    <div style={{ margin: '0 18px 16px' }}>
      <div style={{ fontFamily: F.serif, fontSize: 17, fontWeight: 700, color: c.text, marginBottom: 10, letterSpacing: -0.2 }}>热门观点</div>
      {window.PS_DATA.discussions.slice(0, 2).map((d, i) => (
        <div key={i} style={{ padding: 14, background: c.surface, borderRadius: 14, border: `1px solid ${c.line}`, marginBottom: 8, fontFamily: F.sans }}>
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

function SquarePage({ c, dense, onOpen, onOpenRank }) {
  const [activeCat, setActiveCat] = React.useState('recommend');
  const [sortBy, setSortBy] = React.useState('hot'); // hot | volume | closing | new
  const F = window.PSQ_FONTS;
  const events = window.PS_DATA.events;
  const list = dense ? events : events.slice(0, 4);

  // 排序 tab 单独成行，热门市场标题独占一行
  const sortChips = [
    { k: 'hot', l: '热度' },
    { k: 'volume', l: '成交量' },
    { k: 'closing', l: '即将截止' },
    { k: 'new', l: '最新' },
  ];

  return (
    <React.Fragment>
      <SquareHeader c={c} />
      {!dense && <UserStrip c={c} />}
      <CategoryTabs c={c} active={activeCat} onChange={setActiveCat} />
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: dense ? 8 : 16 }}>
        {!dense && <LatestMarketsRail c={c} onOpen={onOpen} />}

        {/* 热门市场 — 标题独占一行 */}
        {!dense && (
          <React.Fragment>
            <div style={{ padding: '0 18px 6px', display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: F.serif, fontSize: 18, fontWeight: 700, color: c.text, letterSpacing: -0.3 }}>热门市场</span>
              <span style={{ fontSize: 10.5, color: c.sub, fontFamily: F.mono }}>本周 Top 20 · 按热度</span>
            </div>
            {/* 排序 tabs 独占一行（含「即将截止」）*/}
            <div style={{ display: 'flex', gap: 6, padding: '0 18px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {sortChips.map(s => (
                <button key={s.k} onClick={() => setSortBy(s.k)} style={{
                  padding: '6px 12px', borderRadius: 999, flexShrink: 0,
                  background: sortBy===s.k ? c.text : 'transparent',
                  color: sortBy===s.k ? c.bg : c.sub,
                  border: sortBy===s.k ? 0 : `1px solid ${c.lineHard}`,
                  fontFamily: F.sans, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>{s.l}</button>
              ))}
            </div>
          </React.Fragment>
        )}

        {list.map((e) => <EventCard key={e.id} e={e} c={c} dense={dense} onOpen={onOpen} />)}

        {!dense && <LeaderboardTeaser c={c} onOpenRank={onOpenRank} />}
        {!dense && <Discussions c={c} />}
        <div style={{ height: 12 }} />
      </div>
    </React.Fragment>
  );
}

window.SquarePage = SquarePage;
window.EventCard = EventCard;
