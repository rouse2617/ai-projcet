'use client';

import { useState, useEffect } from 'react';
import MoldCostCalculator from '@/components/MoldCostCalculator';
import InjectionCostCalculator from '@/components/InjectionCostCalculator';
import { initSampleData } from '@/lib/sampleData';

type View = 'home' | 'mold' | 'injection';

export default function Home() {
  const [view, setView] = useState<View>('home');

  useEffect(() => { initSampleData(); }, []);

  // ===== 报价工具页 =====
  if (view === 'mold' || view === 'injection') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-4">
                <button onClick={() => setView('home')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-900">舒瀚科技</span>
                </button>
                <div className="h-5 w-px bg-gray-200" />
                <nav className="flex gap-1">
                  <button onClick={() => setView('mold')} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${view === 'mold' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500 hover:text-gray-700'}`}>模具报价</button>
                  <button onClick={() => setView('injection')} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${view === 'injection' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500 hover:text-gray-700'}`}>注塑件报价</button>
                </nav>
              </div>
              <div className="flex items-center gap-3">
                <a href="/samples/模具报价模板-示例.xlsx" download className="text-xs text-gray-400 hover:text-blue-600 transition-colors hidden sm:flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  示例模板
                </a>
                <button className="text-xs bg-blue-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium">联系我们</button>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {view === 'mold' ? <MoldCostCalculator /> : <InjectionCostCalculator />}
        </main>
        <footer className="border-t border-gray-200 bg-white mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <span>© 2026 舒瀚科技 · 模具/模胚行业 AI 智能报价系统</span>
            <span>计算结果仅供参考，实际报价请以工厂核算为准</span>
          </div>
        </footer>
      </div>
    );
  }

  // ===== 首页 =====
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 导航 */}
      <header className="border-b border-gray-100 sticky top-0 z-50 bg-white/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <span className="text-base font-bold text-gray-900">舒瀚科技</span>
            </div>
            <nav className="hidden sm:flex items-center gap-6">
              <button onClick={() => scrollTo('product')} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">产品</button>
              <button onClick={() => scrollTo('solution')} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">方案</button>
              <button onClick={() => scrollTo('about')} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">关于</button>
            </nav>
            <button onClick={() => setView('mold')} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              免费试用
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-blue-700 font-medium">AI 驱动 · 专为模架/模配/精密加工行业打造</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-5">
              上传图纸，<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">防漏算 · 快回价</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-10 max-w-2xl mx-auto">
              AI 自动识别图纸孔位、公差和加工特征，精准核算每一项加工费用。<br className="hidden sm:block" />
              不漏一个孔，不亏一分钱，报价从 3 天缩短到 3 分钟。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <button onClick={() => setView('mold')} className="group bg-white rounded-2xl border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">模架 / 加工件报价</h3>
                <p className="text-sm text-gray-500 mb-3">上传图纸或填写参数，AI 自动识别孔位、核算加工费，防漏算</p>
                <span className="flex items-center gap-1.5 text-sm text-blue-600 font-medium">开始报价 <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></span>
              </button>
              <button onClick={() => setView('injection')} className="group bg-white rounded-2xl border border-gray-200 p-6 text-left hover:border-emerald-300 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">注塑件 / 批量件报价</h3>
                <p className="text-sm text-gray-500 mb-3">计算单件生产成本，含材料、机台、模具分摊、量产经济性分析</p>
                <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">开始计算 <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 产品 ===== */}
      <section id="product" className="border-t border-gray-100 bg-white scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-blue-600 tracking-widest uppercase">Product</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 mb-3">防漏算 · 快回价 · 省人工</h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">AI 自动识别图纸孔位和加工特征，学习你工厂的报价经验，每次报价自动积累数据，系统越用越准。</p>
          </div>

          {/* 核心流程 */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-16">
            {[
              { step: '01', icon: '📁', title: '上传图纸', desc: '支持 Excel 报价模板、2D 图纸（PDF/DWG）、3D 模型（STEP/STL）' },
              { step: '02', icon: '🤖', title: 'AI 孔位识别', desc: '自动识别顶针孔、螺丝孔、水路孔、导柱孔，逐个计数，不漏一个' },
              { step: '03', icon: '💰', title: '精准核价', desc: '按孔径×深度×公差自动核算 CNC 工时，加上材料、磨床、热处理等全部成本' },
              { step: '04', icon: '📄', title: '输出报价单', desc: '一键导出 PDF 报价单，历史归档，相似件匹配，越用越准' },
            ].map((item, i) => (
              <div key={item.step} className="relative bg-gray-50 rounded-xl p-6 hover:bg-blue-50/50 transition-colors">
                {i < 3 && <div className="hidden sm:block absolute top-1/2 -right-2 w-4 h-px bg-gray-300" />}
                <span className="text-[10px] font-bold text-blue-500 tracking-widest">{item.step}</span>
                <span className="text-2xl block mt-2 mb-2">{item.icon}</span>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* 功能矩阵 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '📁', title: '智能文件识别', desc: 'Excel / 2D图纸 / 3D模型，AI 自动提取参数', tag: '已上线' },
              { icon: '🔴', title: 'AI 孔位识别', desc: '自动识别顶针孔、螺丝孔、水路孔，逐个计数防漏算', tag: '已上线' },
              { icon: '🔍', title: 'DFM 制造性分析', desc: '孔位漏算预警、深孔风险、精密孔公差提醒等 10+ 项检测', tag: '已上线' },
              { icon: '🧠', title: '相似件匹配', desc: '历史库中找最相似模架，参考过去赚钱的报价', tag: '已上线' },
              { icon: '📊', title: '量产经济性', desc: '6 档产量对比，自动标注最优生产批量', tag: '已上线' },
              { icon: '📋', title: '报价历史管理', desc: '自动归档、搜索、复用，数据越用越值钱', tag: '已上线' },
              { icon: '📄', title: 'PDF 报价单', desc: '一键导出专业报价单，带成本明细和盖章位', tag: '已上线' },
              { icon: '👨‍🔧', title: '工程师复核', desc: '复杂件自动提示需人工复核，避免过度承诺', tag: '开发中' },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-xl p-5">
                <span className="text-2xl">{item.icon}</span>
                <h3 className="text-sm font-semibold text-gray-900 mt-3 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-2">{item.desc}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  item.tag === '已上线' ? 'bg-green-100 text-green-700' :
                  item.tag === '开发中' ? 'bg-blue-100 text-blue-700' :
                  item.tag === '即将上线' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-500'
                }`}>{item.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 方案 ===== */}
      <section id="solution" className="border-t border-gray-100 bg-gradient-to-b from-slate-50 to-white scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-blue-600 tracking-widest uppercase">Solutions</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 mb-3">适配不同规模的模具工厂</h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">无论你是 10 人小厂还是 200 人中型企业，都有适合你的方案</p>
          </div>

          {/* 方案对比 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            <div className="bg-white rounded-2xl border border-gray-200 p-7 hover:shadow-lg transition-shadow">
              <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase">基础版</span>
              <p className="text-lg font-bold text-gray-900 mt-3 mb-2">快速上手</p>
              <p className="text-sm text-gray-500 mb-5">适合 10-50 人小型模具厂</p>
              <ul className="space-y-2.5 text-sm text-gray-600 mb-6">
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span>模具/注塑成本计算</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span>Excel / 2D / 3D 文件上传</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span>DFM 制造性分析</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span>报价历史管理</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span>PDF 报价单导出</li>
                <li className="flex items-start gap-2"><span className="text-gray-300 mt-0.5">—</span><span className="text-gray-400">1 个用户账号</span></li>
              </ul>
              <button onClick={() => setView('mold')} className="w-full py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">免费体验</button>
            </div>

            <div className="bg-white rounded-2xl border-2 border-blue-500 p-7 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-semibold px-3 py-1 rounded-full">推荐</div>
              <span className="text-xs font-semibold text-blue-600 tracking-widest uppercase">专业版</span>
              <p className="text-lg font-bold text-gray-900 mt-3 mb-2">团队协作 + AI 赋能</p>
              <p className="text-sm text-gray-500 mb-5">适合 50-200 人中型模具厂</p>
              <ul className="space-y-2.5 text-sm text-gray-600 mb-6">
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span>基础版全部功能</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">★</span>AI 工时预测（越用越准）</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">★</span>相似件智能匹配</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">★</span>报价偏差预警</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">★</span>多用户 + 审批流程</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">★</span>客户管理 CRM</li>
                <li className="flex items-start gap-2"><span className="text-gray-300 mt-0.5">—</span><span className="text-gray-400">最多 10 个用户</span></li>
              </ul>
              <button className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">咨询详情</button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-7 hover:shadow-lg transition-shadow">
              <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase">企业版</span>
              <p className="text-lg font-bold text-gray-900 mt-3 mb-2">深度定制 + 专属 AI</p>
              <p className="text-sm text-gray-500 mb-5">适合 200+ 人大型模具厂</p>
              <ul className="space-y-2.5 text-sm text-gray-600 mb-6">
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span>专业版全部功能</li>
                <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">◆</span>工厂专属 AI 模型</li>
                <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">◆</span>2D/3D 图纸深度识别</li>
                <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">◆</span>ERP 系统对接（API）</li>
                <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">◆</span>BI 经营报表</li>
                <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">◆</span>专属客户成功经理</li>
                <li className="flex items-start gap-2"><span className="text-gray-300 mt-0.5">—</span><span className="text-gray-400">不限用户数</span></li>
              </ul>
              <button className="w-full py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">联系我们</button>
            </div>
          </div>

          {/* 行业痛点 → 方案对应 */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-7 py-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">你的痛点，我们的方案</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { pain: '图纸上几百个孔，报价员数漏了，加工完才发现亏钱', solution: 'AI 自动识别图纸上所有孔位（顶针孔、螺丝孔、水路孔、导柱孔），逐个计数，逐个核价，不漏一个', icon: '🔴' },
                { pain: '报价靠老师傅拍脑袋，算错了亏钱，算高了丢单', solution: 'AI 学习你工厂的历史报价数据，自动给出精准成本区间，每单利润一目了然', icon: '🎯' },
                { pain: '客户发来图纸催报价，3 天才回复，客户早找别家了', solution: '上传图纸 3 分钟出报价，支持 PDF/DWG/Excel，响应速度快人一步', icon: '⚡' },
                { pain: '老员工离职，报价经验全带走了，新人上手要半年', solution: '每次报价自动存档，经验沉淀为公司数字资产，新人也能按标准报价', icon: '🏦' },
                { pain: '钢材涨价了，老报价跟不上，接了单才发现亏本', solution: '材料价格一键更新，所有在谈报价自动重算，哪些单还赚钱一眼看到', icon: '📈' },
                { pain: '36 台 CNC 是重资产，报价慢 = 丢单 = 机器闲置 = 亏钱', solution: '快速精准报价提高接单率，相似件匹配复用历史数据，CNC 利用率最大化', icon: '🏭' },
              ].map((item) => (
                <div key={item.pain} className="flex items-start gap-4 px-7 py-5 hover:bg-gray-50 transition-colors">
                  <span className="text-2xl shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-sm text-red-500 mb-1">😩 {item.pain}</p>
                    <p className="text-sm text-gray-700">→ {item.solution}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 关于 ===== */}
      <section id="about" className="border-t border-gray-100 bg-white scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-blue-600 tracking-widest uppercase">About Us</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 mb-3">关于舒瀚科技</h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">我们不是外行做软件，而是懂制造的人做工具</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* 左：公司介绍 */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-7">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">我们的使命</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  让每一家模架工厂都能用上 AI 报价工具。不需要百万级的 ERP 投入，不需要专业 IT 团队，打开浏览器就能用。
                  我们相信，模架/模配行业的数字化不应该只属于大厂，中小企业同样值得拥有精准、高效的报价能力。
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">为什么选择我们</h3>
                {[
                  { title: '懂行业', desc: '团队有富士康制造相关经验，了解模胚结构、钢材选型、加工工艺和报价逻辑，不是外行空谈技术' },
                  { title: '懂技术', desc: '软件工程师自主研发，AI + SaaS 架构，不依赖第三方平台，数据安全可控' },
                  { title: '懂客户', desc: '深入走访数十家模具厂，产品设计基于真实业务场景，不是闭门造车' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 右：数据 + 里程碑 */}
            <div className="space-y-6">
              {/* 数据亮点 */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { num: '12+', label: '钢材牌号', sub: 'P20/718/NAK80/S136...' },
                  { num: '14+', label: '塑料材料', sub: 'ABS/PP/PC/PA6...' },
                  { num: '14 档', label: '注塑机吨位', sub: '50T - 2000T' },
                  { num: '7 项', label: 'DFM 检测规则', sub: '壁厚/拔模/倒扣...' },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{item.num}</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{item.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
                  </div>
                ))}
              </div>

              {/* 发展路线 */}
              <div className="bg-gray-50 rounded-2xl p-7">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">产品路线图</h3>
                <div className="space-y-4">
                  {[
                    { phase: 'Phase 1', time: '2026 Q2', title: '基础报价 + 数据沉淀', status: 'current' },
                    { phase: 'Phase 2', time: '2026 Q3', title: '智能推荐 + 团队协作', status: 'next' },
                    { phase: 'Phase 3', time: '2026 Q4', title: 'AI 工时预测 + 工厂专属模型', status: 'planned' },
                    { phase: 'Phase 4', time: '2027 Q1', title: '图纸深度识别 + ERP 对接', status: 'planned' },
                  ].map((item) => (
                    <div key={item.phase} className="flex items-start gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                        item.status === 'current' ? 'bg-blue-500 ring-4 ring-blue-100' :
                        item.status === 'next' ? 'bg-blue-300' : 'bg-gray-300'
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-900">{item.phase}</span>
                          <span className="text-[10px] text-gray-400">{item.time}</span>
                          {item.status === 'current' && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">进行中</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{item.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 联系方式 */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-7 text-white">
                <h3 className="text-base font-semibold mb-2">联系我们</h3>
                <p className="text-sm text-blue-200 mb-4">欢迎模具/模胚行业的朋友交流合作</p>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2"><span className="text-blue-300">📧</span> contact@shuhan.tech</p>
                  <p className="flex items-center gap-2"><span className="text-blue-300">📱</span> 138-xxxx-xxxx</p>
                  <p className="flex items-center gap-2"><span className="text-blue-300">📍</span> 深圳市</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">准备好告别 Excel 数孔报价了吗？</h2>
          <p className="text-sm text-gray-500 mb-8">防漏算 · 快回价 · 省人工，免费试用，打开浏览器即可开始</p>
          <button onClick={() => setView('mold')} className="bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            立即开始报价 →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <span className="text-sm font-bold text-gray-900">舒瀚科技</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">模架/模配/精密加工行业 AI 智能报价系统，让每一家工厂都能用上 AI。</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-900 mb-3">产品</h4>
              <div className="space-y-2 text-xs text-gray-500">
                <p className="hover:text-gray-700 cursor-pointer">模具成本估算</p>
                <p className="hover:text-gray-700 cursor-pointer">注塑件成本计算</p>
                <p className="hover:text-gray-700 cursor-pointer">DFM 制造性分析</p>
                <p className="hover:text-gray-700 cursor-pointer">智能文件识别</p>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-900 mb-3">方案</h4>
              <div className="space-y-2 text-xs text-gray-500">
                <p className="hover:text-gray-700 cursor-pointer">基础版</p>
                <p className="hover:text-gray-700 cursor-pointer">专业版</p>
                <p className="hover:text-gray-700 cursor-pointer">企业版</p>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-900 mb-3">联系</h4>
              <div className="space-y-2 text-xs text-gray-500">
                <p>contact@shuhan.tech</p>
                <p>138-xxxx-xxxx</p>
                <p>深圳市</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-400">© 2026 舒瀚科技 · 模具/模胚行业 AI 智能报价系统</p>
            <div className="flex gap-4 text-xs text-gray-400">
              <span className="hover:text-gray-600 cursor-pointer">隐私政策</span>
              <span className="hover:text-gray-600 cursor-pointer">服务条款</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
