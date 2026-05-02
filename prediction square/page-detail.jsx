// Detail page (predict event detail with betting flow + AI brief + comments)
const { OptionPill, PageHeader } = window;

function DetailPage({ c, eventId, onBack }) {
  const F = window.PSQ_FONTS;
  const e = window.PS_DATA.events.find(x => x.id === eventId) || window.PS_DATA.events[0];
  const ext = window.PSQ_EXT.detail;
  const [side, setSide] = React.useState(null);
  const [stake, setStake] = React.useState(200);
  const [step, setStep] = React.useState('view'); // view | confirm | done
  const [showAI, setShowAI] = React.useState(false);
  const odd = side === 'YES' ? e.yesOdd : (side === 'NO' ? e.noOdd : null);
  const payout = side ? Math.round(stake * odd) : 0;

  return (
    <React.Fragment>
      <PageHeader c={c} title="预测详情" onBack={onBack} right={<span style={{ fontSize: 18, color: c.text }}>⋯</span>} />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
        {/* Title block */}
        <div style={{ padding: '0 18px 16px' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8, fontSize: 11, color: c.sub, fontFamily: F.sans }}>
            <span style={{ padding: '2px 8px', background: c.chip, borderRadius: 4, color: c.text, fontWeight: 600 }}>{e.cat}</span>
            {e.ai && <span style={{ padding: '2px 8px', borderRadius: 4, border: `1px solid ${c.accent}`, color: c.accent, fontWeight: 600, fontSize: 10 }}>AI 设局</span>}
            <span style={{ marginLeft: 'auto' }}>{e.deadline}</span>
          </div>
          <div style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 700, lineHeight: 1.3, letterSpacing: -0.4, color: c.text, marginBottom: 8 }}>
            {e.title}
          </div>
          <div style={{ fontSize: 13, color: c.sub, lineHeight: 1.55, fontFamily: F.sans }}>{e.desc}</div>
          <div style={{ fontSize: 11, color: c.mut, marginTop: 8, fontFamily: F.sans }}>结果来源：{e.source}</div>
        </div>

        {/* Probability bar */}
        <div style={{ margin: '0 18px 18px', padding: 16, background: c.surface, borderRadius: 16, border: `1px solid ${c.line}`, fontFamily: F.sans }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: c.sub }}>市场共识</span>
            <span style={{ fontSize: 11, color: c.mut, fontFamily: F.mono }}>{e.participants.toLocaleString()} 人 · {e.pool}</span>
          </div>
          <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8, background: c.line }}>
            <div style={{ width: `${e.yesPct}%`, background: c.yes }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 13 }}>
            <span style={{ color: c.yes, fontWeight: 700 }}>YES {e.yesPct}%·×{e.yesOdd}</span>
            <span style={{ color: c.no, fontWeight: 700 }}>NO {e.noPct}%·×{e.noOdd}</span>
          </div>
          {/* 24h change line */}
          <div style={{ display: 'flex', gap: 14, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${c.line}`, fontSize: 11, color: c.sub }}>
            <span>24h 变化 <span style={{ color: e.change>=0 ? c.yes : c.no, fontWeight: 700 }}>{e.change>=0?'+':''}{e.change}%</span></span>
            <span>下注上限 <span style={{ color: c.text, fontWeight: 600 }}>428P</span></span>
          </div>
        </div>

        {/* AI brief */}
        <div style={{ margin: '0 18px 18px', padding: 16, background: c.accentBg, borderRadius: 16, border: `1px solid ${c.line}`, fontFamily: F.sans }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: c.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>AI</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>AI 轻解读</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: c.sub }}>来源 {ext.aiSources.length} 个</span>
          </div>
          <div style={{ fontSize: 13, color: c.text, lineHeight: 1.6 }}>
            {showAI ? ext.aiBrief : ext.aiBrief.slice(0, 78) + '...'}
          </div>
          <button onClick={() => setShowAI(s => !s)} style={{ marginTop: 8, background: 'transparent', border: 0, fontSize: 12, color: c.accent, fontWeight: 600, padding: 0, cursor: 'pointer' }}>
            {showAI ? '收起 ↑' : '展开完整解读 ↓'}
          </button>
          {showAI && (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${c.line}` }}>
              <div style={{ fontSize: 11, color: c.sub, marginBottom: 8, fontWeight: 600, letterSpacing: 1 }}>关键变量</div>
              {ext.factors.map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 12 }}>
                  <span style={{ flex: 1, color: c.text }}>{f.label}</span>
                  <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, background: c.surface, color: c.sub, fontWeight: 700, letterSpacing: 0.5 }}>{f.weight}</span>
                  <span style={{ fontFamily: F.mono, fontSize: 11, fontWeight: 700, color: f.dir==='YES' ? c.yes : (f.dir==='NO' ? c.no : c.sub), width: 30, textAlign: 'right' }}>→ {f.dir}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top comments */}
        <div style={{ padding: '0 18px 16px' }}>
          <div style={{ fontFamily: F.serif, fontSize: 16, fontWeight: 700, color: c.text, marginBottom: 10, letterSpacing: -0.2 }}>热门观点 · {ext.comments.length}</div>
          {ext.comments.map((d, i) => (
            <div key={i} style={{ padding: 14, background: c.surface, borderRadius: 14, border: `1px solid ${c.line}`, marginBottom: 8, fontFamily: F.sans }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 999, background: c.chip, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: c.text }}>{d.user[0]}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: c.text }}>{d.user}</div>
                  <div style={{ fontSize: 10, color: c.sub }}>{d.tag}</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ padding: '2px 6px', background: d.side==='YES' ? c.yesBg : c.noBg, color: d.side==='YES' ? c.yes : c.no, fontSize: 10, fontWeight: 700, borderRadius: 4 }}>{d.side}</span>
                  <span style={{ fontFamily: F.mono, fontSize: 10, color: c.sub }}>{d.stake}P</span>
                </div>
              </div>
              <div style={{ fontSize: 13.5, color: c.text, lineHeight: 1.5 }}>{d.text}</div>
              <div style={{ fontSize: 11, color: c.sub, marginTop: 8, display: 'flex', gap: 12 }}>
                <span>♥ {d.likes}</span>
                <span>💬 {d.replies}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA — pick side */}
      {step === 'view' && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 16px 28px', background: c.bg, borderTop: `1px solid ${c.line}`, fontFamily: F.sans }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setSide('YES'); setStep('confirm'); }} style={{
              flex: 1, padding: '14px 0', borderRadius: 12, background: c.yes, color: '#fff',
              border: 0, cursor: 'pointer', fontSize: 15, fontWeight: 700,
            }}>下注 YES · ×{e.yesOdd}</button>
            <button onClick={() => { setSide('NO'); setStep('confirm'); }} style={{
              flex: 1, padding: '14px 0', borderRadius: 12, background: c.no, color: '#fff',
              border: 0, cursor: 'pointer', fontSize: 15, fontWeight: 700,
            }}>下注 NO · ×{e.noOdd}</button>
          </div>
        </div>
      )}

      {/* Confirm sheet */}
      {step === 'confirm' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 30, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', background: c.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: '20px 18px 32px', fontFamily: F.sans }}>
            <div style={{ width: 38, height: 4, borderRadius: 2, background: c.line, margin: '0 auto 14px' }} />
            <div style={{ fontFamily: F.serif, fontSize: 18, fontWeight: 700, color: c.text, letterSpacing: -0.2 }}>
              确认下注 · <span style={{ color: side==='YES' ? c.yes : c.no }}>{side}</span>
            </div>
            <div style={{ fontSize: 12, color: c.sub, marginTop: 4, marginBottom: 14 }}>{e.title}</div>

            {/* Stake input */}
            <div style={{ padding: 14, background: c.surface, borderRadius: 14, border: `1px solid ${c.line}`, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: c.sub }}>投注金额</span>
                <span style={{ fontSize: 11, color: c.mut, fontFamily: F.mono }}>余额 4,280P · 上限 428P</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: F.mono, fontSize: 32, fontWeight: 700, color: c.text, letterSpacing: -0.5 }}>{stake}</span>
                <span style={{ fontSize: 14, color: c.sub, fontWeight: 600 }}>P</span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                {[100, 200, 400, 'MAX'].map(v => (
                  <button key={v} onClick={() => setStake(v === 'MAX' ? 428 : v)} style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, background: stake===(v==='MAX'?428:v) ? c.text : c.chip,
                    color: stake===(v==='MAX'?428:v) ? c.bg : c.text, border: 0, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F.sans,
                  }}>{v}</button>
                ))}
              </div>
            </div>

            {/* Payout summary */}
            <div style={{ padding: 14, background: side==='YES' ? c.yesSoft : c.noSoft, borderRadius: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: c.sub, marginBottom: 4 }}>
                <span>预测正确返还</span>
                <span style={{ fontFamily: F.mono }}>×{odd}</span>
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 26, fontWeight: 700, color: side==='YES' ? c.yes : c.no, letterSpacing: -0.5 }}>
                +{payout}<span style={{ fontSize: 12, color: c.sub, marginLeft: 4 }}>P</span>
              </div>
              <div style={{ fontSize: 11, color: c.sub, marginTop: 4 }}>预测错误将损失 {stake}P</div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep('view')} style={{ padding: '14px 22px', borderRadius: 12, background: c.chip, color: c.text, border: 0, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>取消</button>
              <button onClick={() => setStep('done')} style={{ flex: 1, padding: '14px 0', borderRadius: 12, background: side==='YES' ? c.yes : c.no, color: '#fff', border: 0, cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>
                确认下注 {stake}P
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Done sheet */}
      {step === 'done' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '85%', background: c.bg, borderRadius: 20, padding: '28px 22px', fontFamily: F.sans, textAlign: 'center' }}>
            <div style={{ fontSize: 34, marginBottom: 6 }}>✓</div>
            <div style={{ fontFamily: F.serif, fontSize: 19, fontWeight: 700, color: c.text, marginBottom: 4, letterSpacing: -0.2 }}>下注成功</div>
            <div style={{ fontSize: 12, color: c.sub, marginBottom: 14 }}>已扣除 {stake}P · 结果将于 {e.deadline} 后揭晓</div>
            <div style={{ padding: 12, background: c.surface, borderRadius: 12, border: `1px solid ${c.line}`, fontSize: 12, color: c.sub, lineHeight: 1.5, marginBottom: 16 }}>
              可在<b style={{ color: c.text }}>「我的 · 预测历史」</b>查看本次预测的进展与最终结果。
            </div>
            <button onClick={onBack} style={{ width: '100%', padding: '12px 0', borderRadius: 10, background: c.text, color: c.bg, border: 0, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>返回广场继续</button>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

window.DetailPage = DetailPage;
