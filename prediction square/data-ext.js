// Shared UI primitives + extended mock data for the prototype
// Depends on: window.PSQ_THEME, window.PSQ_FONTS, window.PS_DATA

window.PSQ_EXT = {
  // Hot recommended events for the home top — first 3 events with extra context
  hotPicks: [
    { id: 'e1', subline: 'CPI 数据已连续 2 月低于预期 · 议息会议 6 月 12 日' },
    { id: 'e3', subline: 'BTC 现货 ETF 资金近 7 日净流入放缓' },
    { id: 'e5', subline: '湖人主场 · 詹姆斯出战时间存疑' },
  ],
  // 最新市场 — 当天新上架的事件 (subset of events)
  latestMarkets: [
    { id: 'e1', postedAt: '2 小时前' },
    { id: 'e6', postedAt: '4 小时前' },
    { id: 'e4', postedAt: '6 小时前' },
    { id: 'e2', postedAt: '今天 09:12' },
    { id: 'e3', postedAt: '今天 08:30' },
  ],
  // 即将截止 — 24h 内截止
  closingSoon: [
    { id: 'e5', countdown: '02:14:08' }, // 今晚 09:30
    { id: 'e6', countdown: '14:32:21' }, // 6月8日 12:00
    { id: 'e1', countdown: '23:48:00' }, // 6月12日 22:00 (示意)
  ],
  // Extra event detail
  detail: {
    aiBrief: 'AI 综合 12 个权威信息源给出的轻解读：CPI 同比已回落至 2.4%，PCE 环比放缓，劳动力市场降温但仍稳。市场已 price-in 25bp 概率约 65%。关键变量：会前 6 月 6 日非农数据。若数据明显高于预期（>20 万），则降息概率回落至 50% 以下。',
    aiSources: ['Fed Watch', 'Bloomberg', 'Reuters', 'WSJ', '+8 更多'],
    factors: [
      { label: 'CPI 通胀走势', weight: 'HIGH', dir: 'YES' },
      { label: '6 月非农数据', weight: 'HIGH', dir: '?' },
      { label: '美联储官员发言', weight: 'MID', dir: 'YES' },
      { label: '美元指数走势', weight: 'LOW', dir: 'NO' },
    ],
    comments: [
      { user: '量化阿星', tag: '财报狩猎者', side: 'YES', text: 'CPI 已经连续两月低于预期，6月降息几乎是定局。', stake: 800, likes: 142, replies: 28 },
      { user: '逆向小王', tag: '黑马王子', side: 'NO', text: '别忘了非农，如果 6 号超预期，整个剧本要改。我下了 NO。', stake: 320, likes: 86, replies: 14 },
      { user: 'momo', tag: '趋势大师', side: 'YES', text: 'Powell 上周措辞已经偏鸽，我判断 25bp 板上钉钉。', stake: 500, likes: 64, replies: 9 },
    ],
    distribution: [
      { range: '<100', pct: 12 },
      { range: '100-500', pct: 38 },
      { range: '500-2K', pct: 32 },
      { range: '2K-1W', pct: 14 },
      { range: '>1W', pct: 4 },
    ],
  },
  // Personal portfolio for "Me" tab
  portfolio: {
    totalProfit: '+1,842',
    profitPct: '+43.0%',
    winRate: 58,
    totalBets: 47,
    avgStake: 320,
    bestTag: '财报狩猎者',
    history: [
      { id: 'h1', title: '美股纳指 5 月是否收涨？', side: 'YES', stake: 200, result: 'WIN', pnl: '+178', date: '5月31日' },
      { id: 'h2', title: 'iPhone 17 是否取消 mini 版？', side: 'YES', stake: 150, result: 'WIN', pnl: '+102', date: '5月28日' },
      { id: 'h3', title: 'NVDA 财报是否超预期？', side: 'NO', stake: 300, result: 'LOSS', pnl: '-300', date: '5月24日' },
      { id: 'h4', title: 'BTC 是否突破 11 万？', side: 'YES', stake: 250, result: 'WIN', pnl: '+212', date: '5月20日' },
      { id: 'h5', title: '《复仇者 5》是否定档暑期？', side: 'NO', stake: 100, result: 'PENDING', pnl: '—', date: '进行中' },
    ],
    badges: [
      { name: '财报狩猎者', desc: '金融预测胜率 70%+', earned: true },
      { name: '黑马王子', desc: '冷门预测胜率 60%+', earned: false, progress: 0.7 },
      { name: '七连冠', desc: '连胜 7 场', earned: false, progress: 0.43 },
      { name: '万物预测家', desc: '6 大类目均参与', earned: true },
    ],
  },
  // Leaderboard – more rows
  leaderboardFull: [
    { rank: 1, name: '量化阿星', tag: '财报狩猎者', wr: 78, streak: 12, profit: '+218%', avatar: '量', pts: 9842 },
    { rank: 2, name: 'crypto_pug', tag: '黑马王子', wr: 71, streak: 7, profit: '+164%', avatar: 'P', pts: 7521 },
    { rank: 3, name: 'momo', tag: '趋势大师', wr: 69, streak: 5, profit: '+142%', avatar: 'M', pts: 6918 },
    { rank: 4, name: '老王说市', tag: '共识收割机', wr: 66, streak: 3, profit: '+118%', avatar: '王', pts: 6202 },
    { rank: 5, name: 'Linda.eth', tag: '黑马王子', wr: 64, streak: 0, profit: '+102%', avatar: 'L', pts: 5840 },
    { rank: 6, name: '半夏', tag: '趋势大师', wr: 63, streak: 4, profit: '+96%', avatar: '夏', pts: 5421 },
    { rank: 7, name: 'Trend_Hunter', tag: '财报狩猎者', wr: 61, streak: 2, profit: '+88%', avatar: 'T', pts: 5108 },
    { rank: 8, name: 'Marcus L.', tag: '共识收割机', wr: 60, streak: 1, profit: '+74%', avatar: 'M', pts: 4763 },
  ],
  // Messages
  messages: [
    { kind: 'win', title: '预测正确：iPhone 17 销量', desc: '+102 积分已入账，7连胜 +0.5x 加成生效', time: '8 分钟前', unread: true },
    { kind: 'follow', title: '量化阿星 关注了你', desc: '他刚下注「美联储降息」YES 800P', time: '2 小时前', unread: true },
    { kind: 'reply', title: 'momo 回复了你的观点', desc: '"同意，Powell 上周措辞..."', time: '昨天 22:14', unread: false },
    { kind: 'system', title: 'AI 设局：5 个新热点上架', desc: '关于「618 GMV」「世界杯抽签」等', time: '昨天 09:00', unread: false },
    { kind: 'lose', title: '预测失败：NVDA 财报', desc: '-300 积分。点击查看 AI 复盘 →', time: '5 月 24 日', unread: false },
  ],
};
