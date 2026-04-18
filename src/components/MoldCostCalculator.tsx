'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { MoldCostInput } from '@/lib/types';
import { calculateMoldCost } from '@/lib/calculator';
import { steelGrades, moldBaseBrands, defaultMachiningRates, surfaceTreatments } from '@/lib/data';
import { formatCNY } from '@/lib/format';
import { saveQuote, findSimilarQuotes, getQuoteHistory, type SavedQuote, type SimilarMatch } from '@/lib/quoteStore';
import InputField from './InputField';
import SelectField from './SelectField';
import SectionCard from './SectionCard';
import CostBreakdownChart from './CostBreakdownChart';
import DonutChart from './DonutChart';
import ProTip from './ProTip';
import ComplexitySelector, { type ComplexityPreset } from './ComplexitySelector';
import SimilarQuotes from './SimilarQuotes';
import QuoteHistory from './QuoteHistory';
import FileUploader from './FileUploader';
import DfmAnalysis from './DfmAnalysis';
import { exportMoldQuotePdf } from '@/lib/pdfExport';

const defaultInput: MoldCostInput = {
  projectName: '',
  partDescription: '',
  moldBaseType: 'standard',
  moldBaseBrand: 'lkm',
  moldBaseWidth: 400,
  moldBaseLength: 500,
  moldBaseHeight: 350,
  moldBasePrice: 8000,
  coreSteelGrade: '718',
  coreSteelPricePerKg: 45,
  coreWeight: 30,
  cavitySteelGrade: '718',
  cavitySteelPricePerKg: 45,
  cavityWeight: 25,
  numberOfCavities: 1,
  cncHours: 80,
  cncRate: defaultMachiningRates.cnc,
  edmHours: 40,
  edmRate: defaultMachiningRates.edm,
  wireEdmHours: 20,
  wireEdmRate: defaultMachiningRates.wireEdm,
  grindingHours: 15,
  grindingRate: defaultMachiningRates.grinding,
  designHours: 40,
  designRate: defaultMachiningRates.design,
  heatTreatmentCost: 2000,
  surfaceTreatmentType: 'none',
  surfaceTreatmentCost: 0,
  hotRunnerCost: 0,
  ejectorPinsCost: 800,
  springsCost: 300,
  otherStandardPartsCost: 500,
  trialCost: 3000,
  trialCount: 2,
  packagingCost: 1500,
  profitMargin: 20,
  taxRate: 13,
};

export default function MoldCostCalculator() {
  const [input, setInput] = useState<MoldCostInput>(defaultInput);
  const [complexity, setComplexity] = useState('medium');
  const [mode, setMode] = useState<'quick' | 'pro'>('quick');
  const [history, setHistory] = useState<SavedQuote[]>([]);
  const [similarMatches, setSimilarMatches] = useState<SimilarMatch[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const refreshHistory = useCallback(() => {
    setHistory(getQuoteHistory());
  }, []);

  useEffect(() => { refreshHistory(); }, [refreshHistory]);

  const update = <K extends keyof MoldCostInput>(key: K, value: MoldCostInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
    setSaveStatus('idle');
  };

  const updateNumber = (key: keyof MoldCostInput, val: string) => {
    const num = parseFloat(val);
    update(key, (isNaN(num) ? 0 : num) as MoldCostInput[typeof key]);
  };

  const handleCoreSteelChange = (id: string) => {
    const steel = steelGrades.find((s) => s.id === id);
    if (steel) {
      setInput((prev) => ({ ...prev, coreSteelGrade: id, coreSteelPricePerKg: steel.pricePerKg }));
      setSaveStatus('idle');
    }
  };

  const handleCavitySteelChange = (id: string) => {
    const steel = steelGrades.find((s) => s.id === id);
    if (steel) {
      setInput((prev) => ({ ...prev, cavitySteelGrade: id, cavitySteelPricePerKg: steel.pricePerKg }));
      setSaveStatus('idle');
    }
  };

  const handleSurfaceChange = (id: string) => {
    const st = surfaceTreatments.find((s) => s.id === id);
    if (st) {
      setInput((prev) => ({ ...prev, surfaceTreatmentType: id, surfaceTreatmentCost: st.baseCost }));
      setSaveStatus('idle');
    }
  };

  const handleComplexitySelect = (preset: ComplexityPreset) => {
    setComplexity(preset.id);
    setInput((prev) => ({
      ...prev,
      cncHours: preset.cncHours, edmHours: preset.edmHours,
      wireEdmHours: preset.wireEdmHours, grindingHours: preset.grindingHours,
      designHours: preset.designHours, heatTreatmentCost: preset.heatTreatmentCost,
      trialCount: preset.trialCount, moldBasePrice: preset.moldBasePrice,
      coreWeight: preset.coreWeight, cavityWeight: preset.cavityWeight,
      numberOfCavities: preset.id === 'simple' ? 1 : preset.id === 'medium' ? 2 : preset.id === 'complex' ? 4 : 8,
      hotRunnerCost: preset.id === 'complex' ? 15000 : preset.id === 'precision' ? 25000 : 0,
    }));
    setSaveStatus('idle');
  };

  const handleLoadQuote = (loadedInput: MoldCostInput) => {
    setInput(loadedInput);
    setSaveStatus('idle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileParams = (params: Partial<MoldCostInput>) => {
    setInput((prev) => ({ ...prev, ...params }));
    setSaveStatus('idle');
  };

  const result = useMemo(() => calculateMoldCost(input), [input]);

  // 实时查找相似件
  useEffect(() => {
    const matches = findSimilarQuotes(input, result.totalCost);
    setSimilarMatches(matches);
  }, [input, result.totalCost]);

  const handleSave = () => {
    saveQuote(input, result);
    setSaveStatus('saved');
    refreshHistory();
    // 3秒后恢复
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const machiningRatio = result.subtotal > 0 ? (result.totalMachiningCost / result.subtotal) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* 文件上传 */}
      <FileUploader onParseComplete={handleFileParams} />

      {/* 复杂度快速选择 */}
      <ComplexitySelector selected={complexity} onSelect={handleComplexitySelect} />

      {/* 模式切换 */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">参数模式：</span>
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
          <button onClick={() => setMode('quick')} className={`px-4 py-1.5 text-sm rounded-md transition-colors ${mode === 'quick' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            快速模式
          </button>
          <button onClick={() => setMode('pro')} className={`px-4 py-1.5 text-sm rounded-md transition-colors ${mode === 'pro' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            专业模式
          </button>
        </div>
        <span className="text-xs text-gray-400">
          {mode === 'quick' ? '显示核心参数，适合快速估价' : '显示全部参数，适合精确报价'}
        </span>
      </div>

      {/* 相似件匹配 */}
      <SimilarQuotes matches={similarMatches} onLoadQuote={handleLoadQuote} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 左侧：输入区 */}
        <div className="xl:col-span-2 space-y-4">
          <SectionCard title="基本信息" icon="📋" defaultOpen={true}>
            <InputField label="项目名称" value={input.projectName} onChange={(v) => update('projectName', v)} type="text" placeholder="例：XX产品外壳模具（保存时用于识别）" />
            <InputField label="零件描述" value={input.partDescription} onChange={(v) => update('partDescription', v)} type="text" placeholder="例：手机后盖" />
            <InputField label="穴数" value={input.numberOfCavities} onChange={(v) => updateNumber('numberOfCavities', v)} min={1} step={1} helpText="模具型腔数量" />
          </SectionCard>

          <SectionCard title="模架" icon="🏗️">
            <SelectField label="模架品牌" value={input.moldBaseBrand} onChange={(v) => update('moldBaseBrand', v)} options={moldBaseBrands.map((b) => ({ value: b.id, label: b.name }))} />
            {mode === 'pro' && (
              <>
                <InputField label="模架宽度" value={input.moldBaseWidth} onChange={(v) => updateNumber('moldBaseWidth', v)} unit="mm" />
                <InputField label="模架长度" value={input.moldBaseLength} onChange={(v) => updateNumber('moldBaseLength', v)} unit="mm" />
                <InputField label="模架高度" value={input.moldBaseHeight} onChange={(v) => updateNumber('moldBaseHeight', v)} unit="mm" />
              </>
            )}
            <InputField label="模架价格" value={input.moldBasePrice} onChange={(v) => updateNumber('moldBasePrice', v)} unit="元" />
          </SectionCard>

          <SectionCard title="模芯/模腔材料" icon="🔩">
            <SelectField label="模芯钢材" value={input.coreSteelGrade} onChange={handleCoreSteelChange} options={steelGrades.map((s) => ({ value: s.id, label: `${s.name} - ${s.usage}` }))} />
            <InputField label="模芯钢材单价" value={input.coreSteelPricePerKg} onChange={(v) => updateNumber('coreSteelPricePerKg', v)} unit="元/kg" />
            <InputField label="模芯重量" value={input.coreWeight} onChange={(v) => updateNumber('coreWeight', v)} unit="kg" />
            {mode === 'pro' && (
              <>
                <SelectField label="模腔钢材" value={input.cavitySteelGrade} onChange={handleCavitySteelChange} options={steelGrades.map((s) => ({ value: s.id, label: `${s.name} - ${s.usage}` }))} />
                <InputField label="模腔钢材单价" value={input.cavitySteelPricePerKg} onChange={(v) => updateNumber('cavitySteelPricePerKg', v)} unit="元/kg" />
              </>
            )}
            <InputField label="模腔重量" value={input.cavityWeight} onChange={(v) => updateNumber('cavityWeight', v)} unit="kg" />
          </SectionCard>

          <SectionCard title="加工费用" icon="⚙️" defaultOpen={mode === 'pro'}>
            <InputField label="CNC 工时" value={input.cncHours} onChange={(v) => updateNumber('cncHours', v)} unit="小时" />
            <InputField label="CNC 费率" value={input.cncRate} onChange={(v) => updateNumber('cncRate', v)} unit="元/时" />
            <InputField label="电火花(EDM) 工时" value={input.edmHours} onChange={(v) => updateNumber('edmHours', v)} unit="小时" />
            <InputField label="电火花 费率" value={input.edmRate} onChange={(v) => updateNumber('edmRate', v)} unit="元/时" />
            <InputField label="线切割 工时" value={input.wireEdmHours} onChange={(v) => updateNumber('wireEdmHours', v)} unit="小时" />
            <InputField label="线切割 费率" value={input.wireEdmRate} onChange={(v) => updateNumber('wireEdmRate', v)} unit="元/时" />
            {mode === 'pro' && (
              <>
                <InputField label="磨床 工时" value={input.grindingHours} onChange={(v) => updateNumber('grindingHours', v)} unit="小时" />
                <InputField label="磨床 费率" value={input.grindingRate} onChange={(v) => updateNumber('grindingRate', v)} unit="元/时" />
              </>
            )}
          </SectionCard>

          {mode === 'pro' && (
            <SectionCard title="设计费用" icon="📐">
              <InputField label="设计工时" value={input.designHours} onChange={(v) => updateNumber('designHours', v)} unit="小时" />
              <InputField label="设计费率" value={input.designRate} onChange={(v) => updateNumber('designRate', v)} unit="元/时" />
            </SectionCard>
          )}

          <SectionCard title="热处理 & 表面处理" icon="🔥" defaultOpen={mode === 'pro'}>
            <InputField label="热处理费用" value={input.heatTreatmentCost} onChange={(v) => updateNumber('heatTreatmentCost', v)} unit="元" />
            <SelectField label="表面处理" value={input.surfaceTreatmentType} onChange={handleSurfaceChange} options={surfaceTreatments.map((s) => ({ value: s.id, label: `${s.name}${s.baseCost > 0 ? ` (参考 ¥${s.baseCost})` : ''}` }))} />
            {input.surfaceTreatmentCost > 0 && (
              <InputField label="表面处理费用" value={input.surfaceTreatmentCost} onChange={(v) => updateNumber('surfaceTreatmentCost', v)} unit="元" />
            )}
          </SectionCard>

          <SectionCard title="标准件" icon="🔧" defaultOpen={mode === 'pro'}>
            <InputField label="热流道" value={input.hotRunnerCost} onChange={(v) => updateNumber('hotRunnerCost', v)} unit="元" helpText="如无热流道填0" />
            <InputField label="顶针" value={input.ejectorPinsCost} onChange={(v) => updateNumber('ejectorPinsCost', v)} unit="元" />
            {mode === 'pro' && (
              <>
                <InputField label="弹簧" value={input.springsCost} onChange={(v) => updateNumber('springsCost', v)} unit="元" />
                <InputField label="其他标准件" value={input.otherStandardPartsCost} onChange={(v) => updateNumber('otherStandardPartsCost', v)} unit="元" helpText="导柱、导套、螺丝等" />
              </>
            )}
          </SectionCard>

          <SectionCard title="试模 & 包装" icon="📦" defaultOpen={mode === 'pro'}>
            <InputField label="单次试模费" value={input.trialCost} onChange={(v) => updateNumber('trialCost', v)} unit="元" />
            <InputField label="试模次数" value={input.trialCount} onChange={(v) => updateNumber('trialCount', v)} min={1} step={1} />
            {mode === 'pro' && (
              <InputField label="包装运输费" value={input.packagingCost} onChange={(v) => updateNumber('packagingCost', v)} unit="元" />
            )}
          </SectionCard>

          <SectionCard title="利润 & 税率" icon="💰">
            <InputField label="利润率" value={input.profitMargin} onChange={(v) => updateNumber('profitMargin', v)} unit="%" helpText="建议 15-25%" />
            <InputField label="税率" value={input.taxRate} onChange={(v) => updateNumber('taxRate', v)} unit="%" helpText="增值税 13%" />
          </SectionCard>

          {/* Pro Tips */}
          {machiningRatio > 35 && (
            <ProTip>加工费占比达 {machiningRatio.toFixed(0)}%，超过行业平均水平（25-35%）。建议检查 CNC 和 EDM 工时是否偏高，或考虑优化模具结构减少加工量。</ProTip>
          )}
          {input.hotRunnerCost === 0 && input.numberOfCavities >= 4 && (
            <ProTip>{input.numberOfCavities} 穴模具建议使用热流道系统，虽然增加 ¥15,000-30,000 模具成本，但可减少水口料浪费、缩短成型周期，长期生产更经济。</ProTip>
          )}

          {/* 报价历史 */}
          <QuoteHistory quotes={history} onLoadQuote={handleLoadQuote} onRefresh={refreshHistory} />
        </div>

        {/* 右侧：结果区 */}
        <div className="space-y-4">
          <div className="sticky top-20 space-y-4">
            {/* 总价卡片 + 保存按钮 */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
              <p className="text-blue-200 text-sm mb-1">模具总报价</p>
              <p className="text-3xl font-bold tracking-tight">{formatCNY(result.totalCost)}</p>
              <div className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-blue-200">成本小计</span><span>{formatCNY(result.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-blue-200">利润 ({input.profitMargin}%)</span><span>{formatCNY(result.profit)}</span></div>
                <div className="flex justify-between"><span className="text-blue-200">税金 ({input.taxRate}%)</span><span>{formatCNY(result.tax)}</span></div>
              </div>
              <div className="mt-4 pt-3 border-t border-blue-500/40 grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-blue-300">加工费占比</span><p className="text-lg font-semibold">{machiningRatio.toFixed(0)}%</p></div>
                <div><span className="text-blue-300">材料费占比</span><p className="text-lg font-semibold">{result.subtotal > 0 ? ((result.totalMaterialCost + result.moldBaseCost) / result.subtotal * 100).toFixed(0) : 0}%</p></div>
              </div>
              {/* 保存 & 导出按钮 */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saved'}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    saveStatus === 'saved'
                      ? 'bg-green-500 text-white cursor-default'
                      : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                  }`}
                >
                  {saveStatus === 'saved' ? '✓ 已保存' : '💾 保存报价'}
                </button>
                <button
                  onClick={() => exportMoldQuotePdf(input, result)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-white text-blue-700 hover:bg-blue-50 transition-all"
                >
                  📄 导出 PDF
                </button>
              </div>
            </div>

            {/* 交期 & 工程师复核 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">预估交期</span>
                <span className="text-sm font-semibold text-gray-900">
                  {input.numberOfCavities <= 2 ? '25-35' : input.numberOfCavities <= 4 ? '35-50' : '50-70'} 天
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">模具等级</span>
                <span className="text-sm font-semibold text-gray-900">
                  {input.numberOfCavities <= 2 ? 'SPI Class 104' : input.numberOfCavities <= 4 ? 'SPI Class 103' : 'SPI Class 102'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">预估寿命</span>
                <span className="text-sm font-semibold text-gray-900">
                  {input.coreSteelGrade === 'p20' || input.coreSteelGrade === '45steel' ? '10-30 万模次' : '30-100 万模次'}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <button className="w-full py-2.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors flex items-center justify-center gap-2">
                  <span>👨‍🔧</span> 申请工程师复核
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-1.5">复杂模具建议由资深工程师确认报价</p>
              </div>
            </div>

            {/* 数据积累提示 */}
            {history.length < 10 && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl px-4 py-3 text-xs text-purple-700">
                <span className="font-medium">📈 数据积累中</span>
                <span className="ml-1">已保存 {history.length}/10 条报价。积累越多，相似件匹配越准确，AI 推荐越智能。</span>
              </div>
            )}

            {/* DFM 分析 */}
            <DfmAnalysis input={input} />

            {/* 环形图 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4">成本构成</h3>
              <DonutChart items={result.breakdown} total={result.subtotal} />
            </div>

            {/* 明细表 */}
            <CostBreakdownChart items={result.breakdown} total={result.subtotal} title="成本明细" />
          </div>
        </div>
      </div>
    </div>
  );
}
