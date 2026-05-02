// Shared UI primitives for V2 prototype
// Depends on: window.PSQ_THEME, window.PSQ_FONTS, window.PS_DATA, window.PSQ_EXT

const T = window.PSQ_THEME;
const F = window.PSQ_FONTS;

// ─── Status bar / chrome ────────────────────────────────
function StatusBar({ c }) {
  return (
    <div style={{ height: 44, padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: F.sans, fontSize: 15, color: c.text, fontWeight: 600, flexShrink: 0 }}>
      <span>9:41</span>
      <span style={{ width: 16, height: 10, borderRadius: 2.5, border: `1.4px solid ${c.text}`, position: 'relative' }}>
        <span style={{ position: 'absolute', inset: 1.4, background: c.text, width: '78%', borderRadius: 1 }} />
      </span>
    </div>
  );
}

// Phone outer frame
function Phone({ c, children, screenLabel }) {
  return (
    <div data-screen-label={screenLabel} style={{
      width: 375, height: 812, background: '#000', borderRadius: 44,
      padding: 8, boxShadow: '0 30px 80px rgba(0,0,0,0.20), 0 0 0 1px rgba(0,0,0,0.06)',
      flexShrink: 0,
    }}>
      <div style={{ width: '100%', height: '100%', borderRadius: 36, overflow: 'hidden', position: 'relative', background: c.bg, display: 'flex', flexDirection: 'column' }}>
        {children}
        <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 110, height: 28, borderRadius: 999, background: '#000', zIndex: 50 }} />
        <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', width: 130, height: 4, borderRadius: 999, background: 'rgba(0,0,0,0.85)', zIndex: 50 }} />
      </div>
    </div>
  );
}

// ─── YES/NO option pill ─────────────────────────────────
function OptionPill({ c, side, pct, odd, onClick, dense, compact }) {
  const isYes = side === 'YES';
  const tColor = isYes ? c.yes : c.no;
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: dense ? '8px 10px' : (compact ? '10px 12px' : '12px 14px'),
      background: isYes ? c.yesBg : c.noBg,
      borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      fontFamily: F.sans, border: 0, cursor: 'pointer', textAlign: 'left',
    }}>
      <span style={{ fontSize: dense ? 11 : 12, fontWeight: 700, color: tColor, letterSpacing: 0.5 }}>{side}</span>
      <span>
        <span style={{ fontSize: dense ? 14 : 18, fontWeight: 700, color: tColor, letterSpacing: -0.3 }}>{pct}<span style={{ fontSize: dense ? 9 : 11 }}>%</span></span>
        {!dense && <span style={{ fontSize: 10, color: tColor, opacity: 0.7, marginLeft: 4 }}>×{odd}</span>}
      </span>
    </button>
  );
}

// ─── Tab bar (bottom) ───────────────────────────────────
function TabBar({ c, active, onChange }) {
  const items = [
    { k: 'square', label: '广场', icon: '⌂' },
    { k: 'rank',   label: '排行', icon: '☰' },
    { k: 'plus',   label: '',    icon: '+' },
    { k: 'msg',    label: '消息', icon: '◷' },
    { k: 'me',     label: '我的', icon: '◉' },
  ];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', alignItems: 'center',
      borderTop: `1px solid ${c.line}`, background: c.bg, padding: '8px 0 24px',
      fontFamily: F.sans, flexShrink: 0,
    }}>
      {items.map((it) => {
        if (it.k === 'plus') {
          return (
            <div key="plus" style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => onChange('plus')} style={{
                width: 46, height: 46, borderRadius: 999, background: c.text, color: c.bg,
                border: 0, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 300,
              }}>+</button>
            </div>
          );
        }
        const on = active === it.k;
        return (
          <button key={it.k} onClick={() => onChange(it.k)} style={{
            background: 'transparent', border: 0, textAlign: 'center', cursor: 'pointer',
            color: on ? c.text : c.sub, padding: 0,
          }}>
            <div style={{ fontSize: 20, lineHeight: 1 }}>{it.icon}</div>
            <div style={{ fontSize: 10, marginTop: 4, fontWeight: on ? 700 : 500 }}>{it.label}</div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Top header (Square)  ───────────────────────────────
function SquareHeader({ c }) {
  return (
    <div style={{ padding: '6px 18px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
      <div>
        <div style={{ fontFamily: F.serif, fontSize: 26, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1, color: c.text }}>Prediction</div>
        <div style={{ fontFamily: F.serif, fontSize: 26, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1, color: c.text, fontStyle: 'italic' }}>
          Square<span style={{ fontFamily: F.sans, fontStyle: 'normal', fontSize: 10, fontWeight: 600, color: c.accent, letterSpacing: 1, marginLeft: 6, verticalAlign: 'middle' }}>先行版</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: 999, border: `1px solid ${c.lineHard}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.text, fontSize: 16 }}>⌕</div>
        <div style={{ width: 36, height: 36, borderRadius: 999, border: `1px solid ${c.lineHard}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.text, fontSize: 14, position: 'relative' }}>♡<span style={{ position: 'absolute', top: 6, right: 8, width: 6, height: 6, borderRadius: 999, background: c.no }} /></div>
      </div>
    </div>
  );
}

// User strip — points/profit/streak (compact)
function UserStrip({ c }) {
  return (
    <div style={{ margin: '0 18px 10px', padding: '10px 14px', background: c.surface, borderRadius: 14, border: `1px solid ${c.line}`, display: 'flex', alignItems: 'center', gap: 12, fontFamily: F.sans, flexShrink: 0 }}>
      <div>
        <div style={{ fontSize: 10, color: c.sub, marginBottom: 1 }}>积分余额</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: c.text, letterSpacing: -0.4 }}>4,280</div>
      </div>
      <div style={{ width: 1, height: 24, background: c.line }} />
      <div>
        <div style={{ fontSize: 10, color: c.sub, marginBottom: 1 }}>今日盈亏</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: c.yes }}>+128</div>
      </div>
      <div style={{ width: 1, height: 24, background: c.line }} />
      <div>
        <div style={{ fontSize: 10, color: c.sub, marginBottom: 1 }}>连胜</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: c.text }}>3<span style={{ fontSize: 10, color: c.sub, fontWeight: 500 }}> 场</span></div>
      </div>
      <div style={{ marginLeft: 'auto', padding: '6px 10px', background: c.text, color: c.bg, borderRadius: 999, fontSize: 11, fontWeight: 600 }}>签到 +50</div>
    </div>
  );
}

// Category tabs row
function CategoryTabs({ c, active, onChange }) {
  const cats = window.PS_DATA.categories;
  return (
    <div style={{ borderBottom: `1px solid ${c.line}`, background: c.bg, position: 'sticky', top: 0, zIndex: 5, flexShrink: 0 }}>
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none', padding: '0 12px' }}>
        {cats.map((cat) => {
          const on = active === cat.id;
          return (
            <button key={cat.id} onClick={() => onChange(cat.id)} style={{
              padding: '12px 10px', background: 'transparent', border: 0, position: 'relative',
              fontFamily: F.sans, fontSize: 14, fontWeight: on ? 700 : 500,
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

// Generic page header (back arrow + title)
function PageHeader({ c, title, onBack, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '6px 16px 10px', flexShrink: 0 }}>
      {onBack && (
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 999, border: `1px solid ${c.lineHard}`, background: 'transparent',
          color: c.text, fontSize: 17, cursor: 'pointer', padding: 0, fontFamily: F.sans,
        }}>‹</button>
      )}
      <div style={{ fontFamily: F.serif, fontSize: 19, fontWeight: 700, color: c.text, marginLeft: onBack ? 12 : 0, letterSpacing: -0.2 }}>{title}</div>
      <div style={{ marginLeft: 'auto' }}>{right}</div>
    </div>
  );
}

Object.assign(window, { StatusBar, Phone, OptionPill, TabBar, SquareHeader, UserStrip, CategoryTabs, PageHeader });
