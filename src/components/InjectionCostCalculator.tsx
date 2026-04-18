'use client';

import { useState, useMemo } from 'react';
import type { InjectionCostInput } from '@/lib/types';
import { calculateInjectionCost } from '@/lib/calculator';
import { plasticMaterials, machineSpecs } from '@/lib/data';
import { formatCNY } from '@/lib/format';
import InputField from './InputField';
import SelectField from './SelectField';
import SectionCard from './SectionCard';
import CostBreakdownChart from './CostBreakdownChart';
import DonutChart from './DonutChart';
import ProTip from './ProTip';
import VolumeAnalysis from './VolumeAnalysis';

const defaultInput: InjectionCostInput = {
  partVolume: 50,
  materialId: 'abs',
  materialPricePerKg: 15,
  materialDensity: 1.05,
  quantity: 10000,
  numberOfCavities: 2,
  cycleTime: 30,
  defectRate: 2,
  machineClampForce: 160,
  machineHourlyRate: 85,
  runnerVolume: 5,
  regrindRatio: 80,
  regrindCostPerKg: 3,
  postProcessingTime: 10,
  postProcessingRate: 30,
  moldCost: 80000,
  moldLifeShots: 300000,
  packagingCostPerPart: 0.1,
  profitMargin: 15,
};

export default function InjectionCostCalculator() {
  const [input, setInput] = useState<InjectionCostInput>(defaultInput);
  const [mode, setMode] = useState<'quick' | 'pro'>('quick');

  const updateNumber = (key: keyof InjectionCostInput, val: string) => {
    const num = parseFloat(val);
    setInput((prev) => ({ ...prev, [key]: isNaN(num) ? 0 : num }));
  };

  const handleMaterialChange = (id: string) => {
    const mat = plasticMaterials.find((m) => m.id === id);
    if (mat) {
      setInput((prev) => ({
        ...prev,
        materialId: id,
        materialPricePerKg: mat.pricePerKg,
        materialDensity: mat.density,
      }));
    }
  };

  const handleMachineChange = (val: string) => {
    const force = parseInt(val);
    const spec = machineSpecs.find((m) => m.clampForce === force);
    if (spec) {
      setInput((prev) => ({
        ...prev,
        machineClampForce: spec.clampForce,
        machineHourlyRate: spec.hourlyRate,
      }));
    }
  };

  const result = useMemo(() => calculateInjectionCost(input), [input]);

  const partWeightG = input.partVolume * input.materialDensity;
  const partsPerHour = input.cycleTime > 0 ? (3600 / input.cycleTime) * input.numberOfCavities : 0;

  return (
    <div className="space-y-6">
      {/* 模式切换 */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">参数模式：</span>
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
          <button
            onClick={() => setMode('quick')}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              mode === 'quick' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            快速模式
          </button>
          <button
            onClick={() => setMode('pro')}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              mode === 'pro' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            专业模式
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <SectionCard title="零件 & 材料" icon="📦">
            <InputField label="零件体积" value={input.partVolume} onChange={(v) => updateNumber('partVolume', v)} unit="cm³" />
            <SelectField
              label="塑料材料"
              value={input.materialId}
              onChange={handleMaterialChange}
              options={plasticMaterials.map((m) => ({ value: m.id, label: `${m.name} (¥${m.pricePerKg}/kg, 密度${m.density})` }))}
            />
            <InputField label="材料单价" value={input.materialPricePerKg} onChange={(v) => updateNumber('materialPricePerKg', v)} unit="元/kg" />
            {mode === 'pro' && (
              <InputField label="材料密度" value={input.materialDensity} onChange={(v) => updateNumber('materialDensity', v)} unit="g/cm³" step={0.01} />
            )}
            {/* 自动计算的参考值 */}
            <div className="sm:col-span-2 lg:col-span-3 bg-gray-50 rounded-lg px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400 text-xs">单件重量</span>
                <p className="font-semibold text-gray-900">{partWeightG.toFixed(1)}g</p>
              </div>
              <div>
                <span className="text-gray-400 text-xs">每小时产量</span>
                <p className="font-semibold text-gray-900">{partsPerHour.toFixed(0)} 件</p>
              </div>
              <div>
                <span className="text-gray-400 text-xs">材料费/件</span>
                <p className="font-semibold text-gray-900">{formatCNY(result.materialCostPerPart)}</p>
              </div>
              <div>
                <span className="text-gray-400 text-xs">机台费/件</span>
                <p className="font-semibold text-gray-900">{formatCNY(result.machineCostPerPart)}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="生产参数" icon="🏭">
            <InputField label="生产数量" value={input.quantity} onChange={(v) => updateNumber('quantity', v)} unit="件" />
            <InputField label="穴数" value={input.numberOfCavities} onChange={(v) => updateNumber('numberOfCavities', v)} min={1} helpText="穴数翻倍 = 产量翻倍" />
            <InputField label="成型周期" value={input.cycleTime} onChange={(v) => updateNumber('cycleTime', v)} unit="秒" helpText="含注射+保压+冷却+开模" />
            <InputField label="不良率" value={input.defectRate} onChange={(v) => updateNumber('defectRate', v)} unit="%" />
          </SectionCard>

          <SectionCard title="注塑机" icon="🔧">
            <SelectField
              label="机台吨位"
              value={String(input.machineClampForce)}
              onChange={handleMachineChange}
              options={machineSpecs.map((m) => ({ value: String(m.clampForce), label: `${m.clampForce}T (参考 ¥${m.hourlyRate}/时)` }))}
            />
            <InputField label="机台费率" value={input.machineHourlyRate} onChange={(v) => updateNumber('machineHourlyRate', v)} unit="元/时" />
          </SectionCard>

          {mode === 'pro' && (
            <SectionCard title="水口 & 回料" icon="♻️">
              <InputField label="水口体积" value={input.runnerVolume} onChange={(v) => updateNumber('runnerVolume', v)} unit="cm³" helpText="流道+浇口体积" />
              <InputField label="回料比例" value={input.regrindRatio} onChange={(v) => updateNumber('regrindRatio', v)} unit="%" helpText="水口料可回收比例" />
              <InputField label="回料加工费" value={input.regrindCostPerKg} onChange={(v) => updateNumber('regrindCostPerKg', v)} unit="元/kg" />
            </SectionCard>
          )}

          {mode === 'pro' && (
            <SectionCard title="后处理 & 包装" icon="✂️">
              <InputField label="后处理时间" value={input.postProcessingTime} onChange={(v) => updateNumber('postProcessingTime', v)} unit="秒/件" helpText="去毛刺、检验等" />
              <InputField label="后处理费率" value={input.postProcessingRate} onChange={(v) => updateNumber('postProcessingRate', v)} unit="元/时" />
              <InputField label="包装费" value={input.packagingCostPerPart} onChange={(v) => updateNumber('packagingCostPerPart', v)} unit="元/件" step={0.01} />
            </SectionCard>
          )}

          <SectionCard title="模具分摊" icon="🏗️">
            <InputField label="模具总价" value={input.moldCost} onChange={(v) => updateNumber('moldCost', v)} unit="元" />
            <InputField label="模具寿命" value={input.moldLifeShots} onChange={(v) => updateNumber('moldLifeShots', v)} unit="模次" helpText="预计总注射次数" />
          </SectionCard>

          <SectionCard title="利润" icon="💰">
            <InputField label="利润率" value={input.profitMargin} onChange={(v) => updateNumber('profitMargin', v)} unit="%" />
          </SectionCard>

          {/* Pro Tips */}
          {input.cycleTime > 45 && (
            <ProTip>
              成型周期 {input.cycleTime}s 偏长。壁厚每减少 0.5mm 可缩短冷却时间 5-10s。优化壁厚均匀性是降低周期的最有效手段。
            </ProTip>
          )}
          {input.numberOfCavities === 1 && input.quantity >= 50000 && (
            <ProTip>
              产量 {input.quantity.toLocaleString()} 件建议使用多穴模具。2穴可将机台成本降低约50%，4穴更优。虽然模具成本增加，但总体更经济。
            </ProTip>
          )}
          {result.moldCostPerPart > result.subtotalPerPart * 0.5 && (
            <ProTip>
              模具分摊占单件成本超过50%，说明当前产量下模具投资偏重。考虑先用铝模（成本降低50-70%）做市场验证，确认需求后再投钢模。
            </ProTip>
          )}

          {/* 量产经济性分析 */}
          <VolumeAnalysis
            moldCost={input.moldCost}
            materialCostPerPart={result.materialCostPerPart}
            machineCostPerPart={result.machineCostPerPart}
            otherCostPerPart={result.postProcessingCostPerPart + result.packagingCostPerPart}
          />
        </div>

        {/* 右侧结果 */}
        <div className="space-y-4">
          <div className="sticky top-20 space-y-4">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl p-6 text-white shadow-lg">
              <p className="text-emerald-200 text-sm mb-1">单件总成本</p>
              <p className="text-3xl font-bold tracking-tight">{formatCNY(result.totalCostPerPart)}</p>
              <div className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-emerald-200">成本小计</span>
                  <span>{formatCNY(result.subtotalPerPart)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">利润 ({input.profitMargin}%)</span>
                  <span>{formatCNY(result.profitPerPart)}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-500/40">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-200">总生产成本 ({input.quantity.toLocaleString()}件)</span>
                  <span className="font-bold text-lg">{formatCNY(result.totalProductionCost)}</span>
                </div>
              </div>
              {/* 快速指标 */}
              <div className="mt-3 pt-3 border-t border-emerald-500/40 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-emerald-300">每小时产量</span>
                  <p className="text-lg font-semibold">{partsPerHour.toFixed(0)} 件</p>
                </div>
                <div>
                  <span className="text-emerald-300">生产天数</span>
                  <p className="text-lg font-semibold">
                    {partsPerHour > 0 ? Math.ceil(input.quantity / partsPerHour / 8) : '-'} 天
                  </p>
                </div>
              </div>
            </div>

            {/* 环形图 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4">单件成本构成</h3>
              <DonutChart items={result.breakdown} total={result.subtotalPerPart} />
            </div>

            {/* 明细 */}
            <CostBreakdownChart items={result.breakdown} total={result.subtotalPerPart} title="成本明细" />
          </div>
        </div>
      </div>
    </div>
  );
}
