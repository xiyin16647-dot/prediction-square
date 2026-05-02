// Admin shell — sidebar + topbar + responsive (PC + mobile)
// Depends on: window.ADMIN_TOKENS, window.ADMIN_FONTS, window.ADMIN_DATA

const T = window.ADMIN_TOKENS;
const AF = window.ADMIN_FONTS;

// ── Atoms ────────────────────────────────────────────────────────────────
function Pill({ children, kind = 'neutral', size = 'sm' }) {
  const map = {
    neutral: { bg: T.chip,    fg: T.chipText },
    ok:      { bg: T.okBg,    fg: T.ok },
    warn:    { bg: T.warnBg,  fg: T.warn },
    danger:  { bg: T.dangerBg, fg: T.danger },
    info:    { bg: T.infoBg,  fg: T.info },
    outline: { bg: 'transparent', fg: T.textMid, border: `1px solid ${T.line}` },
  };
  const s = map[kind] || map.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: size==='sm' ? '2px 8px' : '4px 10px',
      borderRadius: 6,
      background: s.bg, color: s.fg, border: s.border || 'none',
      fontFamily: AF.sans, fontSize: size==='sm' ? 11 : 12,
      fontWeight: 600, lineHeight: 1.4, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function RiskBadge({ level }) {
  if (level === 'high') return <Pill kind="danger">● 高风险</Pill>;
  if (level === 'mid')  return <Pill kind="warn">● 中</Pill>;
  return <Pill kind="ok">● 低</Pill>;
}

function StatusPill({ status }) {
  if (status === 'pending')  return <Pill kind="warn">待审核</Pill>;
  if (status === 'approved') return <Pill kind="ok">已通过</Pill>;
  if (status === 'rejected') return <Pill kind="danger">已拒绝</Pill>;
  return <Pill>—</Pill>;
}

function Btn({ kind = 'ghost', size = 'md', children, onClick, full, disabled }) {
  const sizes = {
    sm: { p: '6px 10px', f: 12 },
    md: { p: '8px 14px', f: 13 },
    lg: { p: '10px 18px', f: 14 },
  };
  const s = sizes[size];
  const styles = {
    primary: { bg: T.primary, fg: '#fff', border: 0 },
    danger:  { bg: T.danger,  fg: '#fff', border: 0 },
    secondary: { bg: T.surface, fg: T.text, border: `1px solid ${T.lineHard}` },
    ghost:   { bg: 'transparent', fg: T.textMid, border: `1px solid ${T.line}` },
  };
  const v = styles[kind];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: s.p, fontSize: s.f, fontFamily: AF.sans, fontWeight: 600,
      background: v.bg, color: v.fg, border: v.border, borderRadius: 8,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      width: full ? '100%' : 'auto',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      whiteSpace: 'nowrap',
    }}>{children}</button>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────
function Sidebar({ active, onNav, mobile, onClose }) {
  return (
    <aside style={{
      width: mobile ? '78%' : 232, maxWidth: mobile ? 320 : 232,
      height: '100%', background: T.surface, borderRight: `1px solid ${T.line}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      fontFamily: AF.sans,
    }}>
      <div style={{ padding: '20px 18px', borderBottom: `1px solid ${T.lineSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, letterSpacing: -0.2 }}>Prediction Square</div>
          <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>管理后台 · 先行版</div>
        </div>
        {mobile && (
          <button onClick={onClose} style={{ background: 'transparent', border: 0, fontSize: 18, color: T.sub, cursor: 'pointer' }}>×</button>
        )}
      </div>
      <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
        {window.ADMIN_DATA.nav.map(n => {
          const isActive = n.id === active;
          return (
            <button key={n.id} onClick={() => onNav(n.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 12px', marginBottom: 1,
              background: isActive ? T.surfaceAlt : 'transparent',
              border: 0, borderRadius: 6, cursor: 'pointer',
              fontSize: 13, fontWeight: isActive ? 600 : 500,
              color: isActive ? T.text : T.textMid, fontFamily: AF.sans,
            }}>
              <span>{n.label}</span>
              {n.count != null && (
                <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 999, background: isActive ? T.primary : T.surfaceAlt, color: isActive ? '#fff' : T.sub, fontWeight: 600 }}>{n.count}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: 14, borderTop: `1px solid ${T.lineSoft}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 999, background: T.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: T.text }}>李</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis' }}>李运营</div>
          <div style={{ fontSize: 11, color: T.sub }}>内容审核员</div>
        </div>
      </div>
    </aside>
  );
}

// ── Topbar ───────────────────────────────────────────────────────────────
function Topbar({ crumbs, onMenu, mobile }) {
  return (
    <div style={{
      height: 56, padding: '0 20px',
      borderBottom: `1px solid ${T.line}`, background: T.surface,
      display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, fontFamily: AF.sans,
    }}>
      {mobile && (
        <button onClick={onMenu} style={{ background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 6, padding: '6px 9px', cursor: 'pointer' }}>
          <div style={{ width: 14, height: 1.8, background: T.text, marginBottom: 3 }} />
          <div style={{ width: 14, height: 1.8, background: T.text, marginBottom: 3 }} />
          <div style={{ width: 14, height: 1.8, background: T.text }} />
        </button>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: T.sub, flex: 1, minWidth: 0, overflow: 'hidden' }}>
        {crumbs.map((cr, i) => (
          <React.Fragment key={i}>
            {i>0 && <span style={{ color: T.mut }}>/</span>}
            <span style={{ color: i===crumbs.length-1 ? T.text : T.sub, fontWeight: i===crumbs.length-1 ? 600 : 500, whiteSpace: 'nowrap' }}>{cr}</span>
          </React.Fragment>
        ))}
      </div>
      {!mobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <input placeholder="搜索事件 / 用户 / ID" style={{
              width: 240, padding: '7px 12px 7px 30px', fontSize: 12.5, fontFamily: AF.sans,
              border: `1px solid ${T.line}`, borderRadius: 7, outline: 'none', background: T.bg, color: T.text,
            }} />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: T.mut }}>⌕</span>
          </div>
          <Btn size="sm" kind="ghost">⌕ 帮助</Btn>
        </div>
      )}
    </div>
  );
}

// ── KPI strip ────────────────────────────────────────────────────────────
function KPIStrip({ mobile }) {
  const D = window.ADMIN_DATA;
  const items = [
    { label: '待审核',     val: D.pendingCount, kind: 'warn',   note: '其中 2 条标记为高风险' },
    { label: '今日已通过', val: D.approvedToday, kind: 'ok',    note: '过去 7 日均值 32 / 日' },
    { label: '今日已拒绝', val: D.rejectedToday, kind: 'danger',note: '主要原因：来源不可验证' },
    { label: '申诉待处理', val: D.appealsCount,  kind: 'info',  note: '24h 内需响应' },
  ];
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(4, 1fr)',
      gap: 12, marginBottom: 18,
    }}>
      {items.map(it => (
        <div key={it.label} style={{
          padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10,
          fontFamily: AF.sans,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11.5, color: T.sub, fontWeight: 500 }}>{it.label}</span>
            <Pill kind={it.kind} size="sm">●</Pill>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: T.text, fontFamily: AF.mono, letterSpacing: -0.5, lineHeight: 1.1 }}>{it.val}</div>
          {!mobile && <div style={{ fontSize: 11, color: T.mut, marginTop: 6 }}>{it.note}</div>}
        </div>
      ))}
    </div>
  );
}

// ── Filters ──────────────────────────────────────────────────────────────
function Filters({ status, onStatus, mobile }) {
  const tabs = [
    { k: 'pending',  l: '待审核', n: 14 },
    { k: 'approved', l: '已通过', n: 38 },
    { k: 'rejected', l: '已拒绝', n: 6 },
    { k: 'all',      l: '全部',   n: null },
  ];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
      flexWrap: 'wrap', fontFamily: AF.sans,
    }}>
      <div style={{ display: 'flex', gap: 4, padding: 3, background: T.surfaceAlt, borderRadius: 8 }}>
        {tabs.map(t => (
          <button key={t.k} onClick={() => onStatus(t.k)} style={{
            padding: '6px 12px', borderRadius: 6, border: 0, cursor: 'pointer',
            background: status===t.k ? T.surface : 'transparent',
            color: status===t.k ? T.text : T.sub,
            boxShadow: status===t.k ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            fontSize: 12.5, fontWeight: 600, fontFamily: AF.sans,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {t.l}{t.n != null && <span style={{ fontSize: 11, color: T.mut }}>{t.n}</span>}
          </button>
        ))}
      </div>
      {!mobile && (
        <React.Fragment>
          <div style={{ width: 1, height: 20, background: T.line }} />
          <Btn size="sm" kind="ghost">分类: 全部 ▾</Btn>
          <Btn size="sm" kind="ghost">来源: 全部 ▾</Btn>
          <Btn size="sm" kind="ghost">风险: 全部 ▾</Btn>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Btn size="sm" kind="ghost">导出</Btn>
            <Btn size="sm" kind="secondary">批量操作</Btn>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

// ── Review row (PC: table-like; mobile: card) ───────────────────────────
function ReviewRow({ ev, mobile, onOpen, selected, onToggle }) {
  if (mobile) {
    return (
      <div onClick={() => onOpen(ev.id)} style={{
        background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10,
        padding: 14, marginBottom: 10, cursor: 'pointer', fontFamily: AF.sans,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          <Pill kind="neutral" size="sm">{ev.cat}</Pill>
          <Pill kind={ev.source==='AI 设局' ? 'info' : 'outline'} size="sm">{ev.source}</Pill>
          <RiskBadge level={ev.risk} />
          <span style={{ marginLeft: 'auto', fontSize: 11, color: T.mut, fontFamily: AF.mono }}>#{ev.id}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, lineHeight: 1.4, marginBottom: 8 }}>{ev.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11.5, color: T.sub }}>
          <span>{ev.poster}</span>
          <span>·</span>
          <span style={{ fontFamily: AF.mono }}>{ev.postedAt.split(' ')[1] || ev.postedAt}</span>
        </div>
        {ev.flags && ev.flags.length > 0 && (
          <div style={{ marginTop: 8, padding: '6px 8px', background: T.warnBg, borderRadius: 6, fontSize: 11, color: T.warn }}>
            ⚠ {ev.flags[0]}{ev.flags.length>1 && ` · +${ev.flags.length-1}`}
          </div>
        )}
      </div>
    );
  }
  return (
    <tr onClick={() => onOpen(ev.id)} style={{ cursor: 'pointer', borderBottom: `1px solid ${T.lineSoft}`, background: selected ? T.surfaceAlt : 'transparent' }}>
      <td style={{ padding: '12px 14px', width: 36 }} onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={!!selected} onChange={() => onToggle(ev.id)} style={{ cursor: 'pointer' }} />
      </td>
      <td style={{ padding: '12px 8px' }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text, marginBottom: 4, lineHeight: 1.35 }}>{ev.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: T.sub }}>
          <span style={{ fontFamily: AF.mono }}>#{ev.id}</span>
          <span>·</span>
          <span>{ev.poster}</span>
          {ev.flags && ev.flags.length > 0 && (
            <React.Fragment>
              <span>·</span>
              <span style={{ color: T.warn }}>⚠ {ev.flags[0]}{ev.flags.length>1 && ` +${ev.flags.length-1}`}</span>
            </React.Fragment>
          )}
        </div>
      </td>
      <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}><Pill kind="neutral" size="sm">{ev.cat}</Pill></td>
      <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}>
        <Pill kind={ev.source==='AI 设局' ? 'info' : 'outline'} size="sm">{ev.source}</Pill>
      </td>
      <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}><RiskBadge level={ev.risk} /></td>
      <td style={{ padding: '12px 8px', whiteSpace: 'nowrap', fontSize: 12, color: T.sub, fontFamily: AF.mono }}>{ev.postedAt}</td>
      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
        <Btn size="sm" kind="ghost" onClick={() => onOpen(ev.id)}>查看 →</Btn>
      </td>
    </tr>
  );
}

// ── Review list page ─────────────────────────────────────────────────────
function ReviewListPage({ mobile, onOpen }) {
  const [status, setStatus] = React.useState('pending');
  const [sel, setSel] = React.useState(new Set());
  const events = window.ADMIN_DATA.events.filter(e => status==='all' ? true : e.status===status);
  const toggle = (id) => {
    setSel(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  return (
    <div style={{ padding: mobile ? 16 : 24, fontFamily: AF.sans }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: mobile ? 18 : 22, fontWeight: 700, color: T.text, letterSpacing: -0.4 }}>事件审核</div>
          <div style={{ fontSize: 12.5, color: T.sub, marginTop: 4 }}>AI 设局事件、用户提交事件 · 通过后将上线广场</div>
        </div>
        {!mobile && <Btn kind="primary" size="md">+ 手动建市场</Btn>}
      </div>

      <KPIStrip mobile={mobile} />
      <Filters status={status} onStatus={setStatus} mobile={mobile} />

      {sel.size > 0 && !mobile && (
        <div style={{ padding: '10px 14px', background: T.infoBg, borderRadius: 8, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, fontSize: 12.5 }}>
          <span style={{ color: T.info, fontWeight: 600 }}>已选 {sel.size} 条</span>
          <Btn size="sm" kind="primary">批量通过</Btn>
          <Btn size="sm" kind="danger">批量拒绝</Btn>
          <button onClick={() => setSel(new Set())} style={{ marginLeft: 'auto', background: 'transparent', border: 0, fontSize: 12, color: T.sub, cursor: 'pointer' }}>清空</button>
        </div>
      )}

      {mobile ? (
        <div>{events.map(ev => <ReviewRow key={ev.id} ev={ev} mobile onOpen={onOpen} />)}</div>
      ) : (
        <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: AF.sans }}>
            <thead>
              <tr style={{ background: T.surfaceAlt, borderBottom: `1px solid ${T.line}` }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: T.sub, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}></th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: 11, color: T.sub, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>事件</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: 11, color: T.sub, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>分类</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: 11, color: T.sub, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>来源</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: 11, color: T.sub, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>风险</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: 11, color: T.sub, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>提交时间</th>
                <th style={{ padding: '10px 14px' }}></th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <ReviewRow key={ev.id} ev={ev} onOpen={onOpen} selected={sel.has(ev.id)} onToggle={toggle} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Reject drawer ────────────────────────────────────────────────────────
function RejectDrawer({ open, onClose, onConfirm }) {
  const [reason, setReason] = React.useState('sensitive');
  const [note, setNote] = React.useState('');
  if (!open) return null;
  const reasons = window.ADMIN_DATA.rejectReasons;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.36)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 420, maxWidth: '90%', height: '100%', background: T.surface,
        boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column', fontFamily: AF.sans,
      }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>拒绝该事件</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, fontSize: 20, color: T.sub, cursor: 'pointer', padding: 0, width: 28, height: 28 }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
          <div style={{ fontSize: 12, color: T.sub, marginBottom: 8, fontWeight: 600 }}>选择拒绝原因</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
            {reasons.map(r => (
              <label key={r.id} style={{ display: 'flex', gap: 10, padding: 12, border: `1px solid ${reason===r.id ? T.primary : T.line}`, background: reason===r.id ? T.surfaceAlt : T.surface, borderRadius: 8, cursor: 'pointer' }}>
                <input type="radio" checked={reason===r.id} onChange={() => setReason(r.id)} style={{ marginTop: 3 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{r.label}</div>
                  <div style={{ fontSize: 11.5, color: T.sub, marginTop: 2, lineHeight: 1.45 }}>{r.desc}</div>
                </div>
              </label>
            ))}
          </div>
          <div style={{ fontSize: 12, color: T.sub, marginBottom: 8, fontWeight: 600 }}>补充说明（可选 · 将发送给提交者）</div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：建议改用更具体的判定标准，避免歧义。" style={{
            width: '100%', minHeight: 90, padding: 12, fontSize: 13, fontFamily: AF.sans,
            border: `1px solid ${T.line}`, borderRadius: 8, outline: 'none', resize: 'vertical', color: T.text, background: T.bg,
          }} />
        </div>
        <div style={{ padding: 18, borderTop: `1px solid ${T.line}`, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn kind="ghost" onClick={onClose}>取消</Btn>
          <Btn kind="danger" onClick={() => onConfirm(reason, note)}>确认拒绝</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Detail page ──────────────────────────────────────────────────────────
function ReviewDetailPage({ id, mobile, onBack }) {
  const ev = window.ADMIN_DATA.events.find(x => x.id === id) || window.ADMIN_DATA.events[0];
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [done, setDone] = React.useState(null); // null | 'approved' | 'rejected'

  return (
    <div style={{ padding: mobile ? 16 : 24, fontFamily: AF.sans, position: 'relative', minHeight: '100%' }}>
      <button onClick={onBack} style={{ background: 'transparent', border: 0, fontSize: 13, color: T.sub, cursor: 'pointer', marginBottom: 14, padding: 0, fontFamily: AF.sans }}>← 返回审核列表</button>

      <div style={{ display: mobile ? 'block' : 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>
        {/* Main */}
        <div>
          <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, padding: mobile ? 16 : 22, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              <Pill kind="neutral" size="sm">{ev.cat}</Pill>
              <Pill kind={ev.source==='AI 设局' ? 'info' : 'outline'} size="sm">{ev.source}</Pill>
              <RiskBadge level={ev.risk} />
              <StatusPill status={done || ev.status} />
              <span style={{ marginLeft: 'auto', fontSize: 11.5, color: T.mut, fontFamily: AF.mono }}>#{ev.id}</span>
            </div>
            <div style={{ fontSize: mobile ? 18 : 22, fontWeight: 700, color: T.text, lineHeight: 1.32, letterSpacing: -0.3, marginBottom: 12 }}>
              {ev.title}
            </div>
            <div style={{ fontSize: 13.5, color: T.textMid, lineHeight: 1.65, marginBottom: 16 }}>
              {ev.desc}
            </div>

            {ev.flags && ev.flags.length > 0 && (
              <div style={{ padding: 12, background: T.warnBg, borderRadius: 8, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.warn, marginBottom: 6 }}>⚠ AI 风险检查（{ev.flags.length}）</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: T.warn, lineHeight: 1.6 }}>
                  {ev.flags.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <DetailField label="判定截止时间" value={ev.deadline} mono />
              <DetailField label="结果来源" value={ev.sources && ev.sources.join('、') || '—'} />
              <DetailField label="提交者"     value={ev.poster} />
              <DetailField label="提交时间"   value={ev.postedAt} mono />
              <DetailField label="预估 YES 概率" value={`${ev.yesPctEst}%`} mono />
              <DetailField label="风险等级"     value={ev.risk==='high'?'高':ev.risk==='mid'?'中':'低'} />
            </div>
          </div>

          {/* Preview card */}
          <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, padding: mobile ? 16 : 22 }}>
            <div style={{ fontSize: 12, color: T.sub, fontWeight: 600, marginBottom: 10 }}>客户端预览</div>
            <div style={{ background: '#15161A', borderRadius: 14, padding: 16, color: '#F2EFE8', fontFamily: 'Source Serif 4, Noto Serif SC, serif' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 11, color: '#A0A4AE', fontFamily: AF.sans }}>
                <span style={{ padding: '2px 8px', background: '#26282E', borderRadius: 4, color: '#F2EFE8', fontWeight: 600 }}>{ev.cat}</span>
                {ev.source==='AI 设局' && <span style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(242,239,232,0.18)', color: '#F2EFE8', fontWeight: 700, fontSize: 10 }}>AI 设局</span>}
                <span style={{ marginLeft: 'auto' }}>{ev.deadline}</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3, letterSpacing: -0.3, marginBottom: 12 }}>{ev.title}</div>
              <div style={{ display: 'flex', gap: 8, fontFamily: AF.mono }}>
                <div style={{ flex: 1, padding: '10px 12px', background: 'rgba(91,208,138,0.14)', color: '#5BD08A', borderRadius: 8, fontWeight: 700, fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                  <span>YES</span><span>{ev.yesPctEst}%</span>
                </div>
                <div style={{ flex: 1, padding: '10px 12px', background: 'rgba(255,123,123,0.14)', color: '#FF7B7B', borderRadius: 8, fontWeight: 700, fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                  <span>NO</span><span>{100-ev.yesPctEst}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side */}
        <div>
          <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, padding: 18, position: mobile ? 'static' : 'sticky', top: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 12 }}>审核操作</div>
            {done ? (
              <div style={{ padding: 14, background: done==='approved' ? T.okBg : T.dangerBg, color: done==='approved' ? T.ok : T.danger, borderRadius: 8, fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>
                ✓ 已{done==='approved'?'通过':'拒绝'}该事件
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                <Btn kind="primary" full onClick={() => setDone('approved')}>✓ 通过并上线</Btn>
                <Btn kind="danger"  full onClick={() => setRejectOpen(true)}>✕ 拒绝</Btn>
                <Btn kind="ghost"   full>编辑后再审</Btn>
              </div>
            )}
            <div style={{ paddingTop: 14, borderTop: `1px solid ${T.lineSoft}`, fontSize: 11.5, color: T.sub, lineHeight: 1.6 }}>
              通过后事件将立即出现在广场首页「最新市场」与对应分类下。拒绝原因会通过站内信发送给提交者（用户提交事件）。
            </div>
          </div>

          <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, padding: 18, marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>审核 SOP</div>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: T.sub, lineHeight: 1.7 }}>
              <li>事件描述、判定标准是否清晰无歧义</li>
              <li>结果来源是否在白名单内、可公开验证</li>
              <li>是否触及政治、宗教、伦理边界（参考 §7.2）</li>
              <li>争议性是否合理（避免一边倒，YES 估算建议 30–70%）</li>
              <li>是否与已上线事件重复</li>
            </ol>
          </div>
        </div>
      </div>

      <RejectDrawer open={rejectOpen} onClose={() => setRejectOpen(false)} onConfirm={() => { setRejectOpen(false); setDone('rejected'); }} />
    </div>
  );
}

function DetailField({ label, value, mono }) {
  return (
    <div style={{ padding: '10px 12px', background: T.bg, borderRadius: 6, border: `1px solid ${T.lineSoft}` }}>
      <div style={{ fontSize: 11, color: T.sub, marginBottom: 3, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: mono ? AF.mono : AF.sans, letterSpacing: mono ? -0.2 : 0 }}>{value}</div>
    </div>
  );
}

// ── App shell ────────────────────────────────────────────────────────────
function AdminApp({ initialView = 'list', initialId = null, mobile = false, embedded = false }) {
  const [view, setView] = React.useState(initialView); // 'list' | 'detail'
  const [eventId, setEventId] = React.useState(initialId);
  const [navOpen, setNavOpen] = React.useState(false);

  const openDetail = (id) => { setEventId(id); setView('detail'); };
  const backList = () => { setView('list'); setEventId(null); };

  const crumbs = view==='detail'
    ? ['事件审核', '待审核', `#${eventId}`]
    : ['事件审核', '待审核'];

  return (
    <div data-screen-label={view==='detail' ? `Admin · 审核详情` : `Admin · 事件审核`} style={{
      width: '100%', height: '100%', background: T.bg, color: T.text,
      display: 'flex', overflow: 'hidden', position: 'relative',
      fontFamily: AF.sans,
    }}>
      {/* Sidebar — visible on desktop, drawer on mobile */}
      {!mobile && <Sidebar active="review" onNav={() => {}} />}
      {mobile && navOpen && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} onClick={() => setNavOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ height: '100%' }}>
            <Sidebar active="review" onNav={() => setNavOpen(false)} mobile onClose={() => setNavOpen(false)} />
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar crumbs={crumbs} onMenu={() => setNavOpen(true)} mobile={mobile} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {view==='list'
            ? <ReviewListPage mobile={mobile} onOpen={openDetail} />
            : <ReviewDetailPage id={eventId} mobile={mobile} onBack={backList} />
          }
        </div>
      </div>
    </div>
  );
}

window.AdminApp = AdminApp;
