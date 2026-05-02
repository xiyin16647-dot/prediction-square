// Other tabs: Rank, Messages, Me, Plus
const { PageHeader, EventCard } = window;

function RankPage({ c }) {
  const F = window.PSQ_FONTS;
  const [period, setPeriod] = React.useState('week');
  const [metric, setMetric] = React.useState('profit');
  return (
    <React.Fragment>
      <PageHeader c={c} title="排行榜" />
      {/* period switcher */}
      <div style={{ padding: '0 18px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: c.chip, borderRadius: 12, fontFamily: F.sans }}>
          {[{k:'day',l:'日榜'},{k:'week',l:'周榜'},{k:'month',l:'月榜'},{k:'all',l:'总榜'}].map(p => (
            <button key={p.k} onClick={() => setPeriod(p.k)} style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: 0, cursor: 'pointer',
              background: period===p.k ? c.surface : 'transparent', color: c.text,
              fontSize: 12, fontWeight: period===p.k ? 700 : 500,
              boxShadow: period===p.k ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
            }}>{p.l}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 12, fontFamily: F.sans, fontSize: 13 }}>
          {[{k:'profit',l:'收益率'},{k:'wr',l:'胜率'},{k:'streak',l:'连胜'}].map(m => (
            <button key={m.k} onClick={() => setMetric(m.k)} style={{
              background: 'transparent', border: 0, cursor: 'pointer', padding: '4px 0',
              color: metric===m.k ? c.text : c.sub, fontWeight: metric===m.k ? 700 : 500,
              borderBottom: metric===m.k ? `2px solid ${c.text}` : '2px solid transparent',
            }}>{m.l}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Top 3 podium */}
        <div style={{ margin: '0 18px 16px', padding: 18, background: c.surface, borderRadius: 16, border: `1px solid ${c.line}`, fontFamily: F.sans, position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 14 }}>
            {[2,1,3].map(rank => {
              const l = window.PSQ_EXT.leaderboardFull.find(x => x.rank === rank);
              const isFirst = rank === 1;
              const sz = isFirst ? 56 : 44;
              return (
                <div key={rank} style={{ textAlign: 'center', flex: 1 }}>
                  {isFirst && <div style={{ fontSize: 16, marginBottom: 2, color: c.gold }}>♛</div>}
                  <div style={{ width: sz, height: sz, borderRadius: 999, margin: '0 auto', background: c.chip, border: isFirst ? `2px solid ${c.gold}` : `1px solid ${c.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isFirst?20:16, fontWeight: 700, color: c.text }}>{l.avatar}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c.text, marginTop: 6 }}>{l.name}</div>
                  <div style={{ fontFamily: F.mono, fontSize: 13, color: c.yes, fontWeight: 700, marginTop: 2 }}>{l.profit}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* List */}
        <div style={{ margin: '0 18px 14px', background: c.surface, borderRadius: 16, border: `1px solid ${c.line}`, fontFamily: F.sans, overflow: 'hidden' }}>
          {window.PSQ_EXT.leaderboardFull.slice(3).map((l, i) => (
            <div key={l.rank} style={{ display: 'grid', gridTemplateColumns: '28px 36px 1fr auto', alignItems: 'center', gap: 10, padding: '12px 14px', borderTop: i>0 ? `1px solid ${c.line}` : 0 }}>
              <div style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 700, color: c.sub }}>{l.rank}</div>
              <div style={{ width: 32, height: 32, borderRadius: 999, background: c.chip, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: c.text }}>{l.avatar}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{l.name}</div>
                <div style={{ fontSize: 10.5, color: c.sub }}>{l.tag} · 胜率 {l.wr}% · ×{l.streak}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.yes, fontFamily: F.mono }}>{l.profit}</div>
            </div>
          ))}
        </div>

        {/* My rank */}
        <div style={{ margin: '14px 18px 18px', padding: '12px 14px', borderRadius: 16, border: `1px dashed ${c.lineHard}`, fontFamily: F.sans, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 700, color: c.sub, width: 28 }}>1248</div>
          <div style={{ width: 32, height: 32, borderRadius: 999, background: c.text, color: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>你</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: c.text }}>当前排名</div>
            <div style={{ fontSize: 10.5, color: c.sub }}>距下一段位还差 +12% 收益率</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: c.yes, fontFamily: F.mono }}>+43%</div>
        </div>
      </div>
    </React.Fragment>
  );
}

function MessagesPage({ c }) {
  const F = window.PSQ_FONTS;
  const ICONS = { win: { i: '✓', col: c.yes }, lose: { i: '✕', col: c.no }, follow: { i: '+', col: c.accent }, reply: { i: '"', col: c.text }, system: { i: '◆', col: c.gold } };
  return (
    <React.Fragment>
      <PageHeader c={c} title="消息" right={<span style={{ fontSize: 12, color: c.accent, fontWeight: 600 }}>全部已读</span>} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {window.PSQ_EXT.messages.map((m, i) => {
          const ic = ICONS[m.kind] || ICONS.system;
          return (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 18px', borderBottom: `1px solid ${c.line}`, fontFamily: F.sans }}>
              <div style={{ width: 36, height: 36, borderRadius: 999, background: c.chip, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ic.col, fontSize: 16, fontWeight: 700, flexShrink: 0 }}>{ic.i}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: c.text }}>{m.title}</span>
                  {m.unread && <span style={{ width: 6, height: 6, borderRadius: 999, background: c.no }} />}
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: c.mut }}>{m.time}</span>
                </div>
                <div style={{ fontSize: 12, color: c.sub, marginTop: 4, lineHeight: 1.5 }}>{m.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </React.Fragment>
  );
}

function MePage({ c }) {
  const F = window.PSQ_FONTS;
  const p = window.PSQ_EXT.portfolio;
  return (
    <React.Fragment>
      <PageHeader c={c} title="我的" right={<span style={{ fontSize: 18, color: c.text }}>⚙</span>} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Profile */}
        <div style={{ padding: '0 18px 16px', display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.sans }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: c.text, color: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }}>你</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: F.serif, fontSize: 18, fontWeight: 700, color: c.text, letterSpacing: -0.2 }}>预测中的你</div>
            <div style={{ fontSize: 11.5, color: c.sub, marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ padding: '1px 7px', background: c.accentBg, color: c.accent, borderRadius: 4, fontWeight: 600 }}>{p.bestTag}</span>
              <span>· LV.4 · 排名 #1248</span>
            </div>
          </div>
        </div>

        {/* Portfolio summary */}
        <div style={{ margin: '0 18px 16px', padding: 16, background: c.surface, borderRadius: 16, border: `1px solid ${c.line}`, fontFamily: F.sans }}>
          <div style={{ fontSize: 11, color: c.sub, marginBottom: 4 }}>累计盈亏</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: F.mono, fontSize: 30, fontWeight: 700, color: c.yes, letterSpacing: -0.5 }}>{p.totalProfit}</span>
            <span style={{ fontSize: 13, color: c.yes, fontWeight: 600 }}>{p.profitPct}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${c.line}` }}>
            <div><div style={{ fontSize: 11, color: c.sub }}>胜率</div><div style={{ fontSize: 16, fontWeight: 700, color: c.text, fontFamily: F.mono }}>{p.winRate}%</div></div>
            <div><div style={{ fontSize: 11, color: c.sub }}>总场次</div><div style={{ fontSize: 16, fontWeight: 700, color: c.text, fontFamily: F.mono }}>{p.totalBets}</div></div>
            <div><div style={{ fontSize: 11, color: c.sub }}>平均下注</div><div style={{ fontSize: 16, fontWeight: 700, color: c.text, fontFamily: F.mono }}>{p.avgStake}P</div></div>
          </div>
        </div>

        {/* History */}
        <div style={{ padding: '0 18px 8px', fontFamily: F.serif, fontSize: 16, fontWeight: 700, color: c.text }}>预测历史</div>
        <div style={{ margin: '0 18px 18px', background: c.surface, borderRadius: 16, border: `1px solid ${c.line}`, fontFamily: F.sans, overflow: 'hidden' }}>
          {p.history.map((h, i) => (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderTop: i>0 ? `1px solid ${c.line}` : 0 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: c.text, fontWeight: 500, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</div>
                <div style={{ fontSize: 10.5, color: c.sub, marginTop: 3, fontFamily: F.mono }}>
                  <span style={{ padding: '1px 5px', borderRadius: 3, background: h.side==='YES' ? c.yesBg : c.noBg, color: h.side==='YES' ? c.yes : c.no, fontWeight: 700 }}>{h.side}</span>
                  &nbsp;{h.stake}P · {h.date}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 700, color: h.result==='WIN' ? c.yes : (h.result==='LOSS' ? c.no : c.sub) }}>{h.pnl}</div>
                <div style={{ fontSize: 9.5, color: c.sub, marginTop: 2, letterSpacing: 0.5, fontWeight: 700 }}>{h.result}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

function PlusSheet({ c, onClose }) {
  const F = window.PSQ_FONTS;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 30, display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: c.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: '20px 18px 32px', fontFamily: F.sans }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: c.line, margin: '0 auto 14px' }} />
        <div style={{ fontFamily: F.serif, fontSize: 18, fontWeight: 700, color: c.text, letterSpacing: -0.2, marginBottom: 12 }}>快速入口</div>
        {[
          { i: '⚡', t: '快速预测', d: '从 AI 推荐的当下热点中选一个' },
          { i: '✎',  t: '提议事件', d: '让 AI 帮你出题，社区投票上架' },
          { i: '⌕', t: '搜索事件', d: '按关键词查找正在进行中的预测' },
          { i: '◆', t: '我的关注', d: '查看关注高手的最新下注' },
        ].map(it => (
          <button key={it.t} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '12px 14px', background: c.surface, border: `1px solid ${c.line}`, borderRadius: 12, marginBottom: 8, cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ width: 38, height: 38, borderRadius: 10, background: c.chip, color: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>{it.i}</span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: c.text }}>{it.t}</span>
              <span style={{ display: 'block', fontSize: 11.5, color: c.sub, marginTop: 2 }}>{it.d}</span>
            </span>
            <span style={{ fontSize: 16, color: c.mut }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { RankPage, MessagesPage, MePage, PlusSheet });
