'use client';

import type { MoldCostInput } from '@/lib/types';

interface DfmItem {
  id: string;
  title: string;
  severity: 'info' | 'warning' | 'critical';
  description: string;
  suggestion: string;
}

function analyzeDfm(input: MoldCostInput): DfmItem[] {
  const items: DfmItem[] = [];

  // 倒扣/滑块风险
  if (input.hotRunnerCost > 0 && input.numberOfCavities >= 4) {
    items.push({
      id: 'undercut',
      title: '倒扣结构检测',
      severity: 'warning',
      description: `多穴模具（${input.numberOfCavities}穴）配合热流道，可能存在侧抽/滑块结构`,
      suggestion: '建议确认倒扣位置和脱模方向，避免滑块干涉',
    });
  }

  // 壁厚风险
  if (input.coreWeight > 0 && input.cavityWeight > 0) {
    const ratio = input.coreWeight / input.cavityWeight;
    if (ratio > 1.5 || ratio < 0.6) {
      items.push({
        id: 'wall_thickness',
        title: '壁厚均匀性',
        severity: 'warning',
        description: '模芯与模腔重量差异较大，可能存在壁厚不均匀区域',
        suggestion: '壁厚不均会导致缩水、翘曲，建议控制壁厚差异在 ±0.5mm 以内',
      });
    }
  }

  // 拔模角
  if (input.edmHours > 60) {
    items.push({
      id: 'draft_angle',
      title: '拔模角检查',
      severity: 'info',
      description: 'EDM 工时较高，可能存在深腔或窄槽结构',
      suggestion: '建议确保所有脱模面有 1°-3° 拔模角，减少 EDM 依赖',
    });
  }

  // 热流道建议
  if (input.hotRunnerCost === 0 && input.numberOfCavities >= 4) {
    items.push({
      id: 'hot_runner',
      title: '热流道建议',
      severity: 'warning',
      description: `${input.numberOfCavities} 穴模具使用冷流道，水口料浪费较大`,
      suggestion: '建议采用热流道系统，减少 20-40% 水口料浪费，缩短成型周期',
    });
  }

  // 公差/表面
  if (input.surfaceTreatmentType === 'polish_spi_a1') {
    items.push({
      id: 'surface',
      title: '镜面抛光要求',
      severity: 'critical',
      description: '镜面抛光 SPI-A1 对钢材和加工精度要求极高',
      suggestion: '建议使用 S136 或 NAK80 钢材，并预留 15-20% 额外抛光工时',
    });
  }

  // 穴数与模架匹配
  if (input.numberOfCavities >= 8 && input.moldBaseWidth < 500) {
    items.push({
      id: 'mold_size',
      title: '模架尺寸偏小',
      severity: 'critical',
      description: `${input.numberOfCavities} 穴模具建议模架宽度 ≥ 500mm，当前 ${input.moldBaseWidth}mm`,
      suggestion: '模架过小会导致型腔间距不足，影响冷却和强度',
    });
  }

  // 钢材匹配
  if (input.coreSteelGrade === 'p20' && input.numberOfCavities >= 4) {
    items.push({
      id: 'steel_grade',
      title: '钢材等级建议',
      severity: 'warning',
      description: 'P20 钢材硬度偏低，多穴模具寿命可能不足',
      suggestion: '建议升级到 718 或 NAK80，确保模具寿命 ≥ 30 万模次',
    });
  }

  // 如果没有任何风险
  if (items.length === 0) {
    items.push({
      id: 'ok',
      title: '结构评估通过',
      severity: 'info',
      description: '当前参数未检测到明显的制造风险',
      suggestion: '建议在试模阶段进一步验证尺寸精度和外观质量',
    });
  }

  return items;
}

const severityConfig = {
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'ℹ️', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '⚠️', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  critical: { bg: 'bg-red-50', border: 'border-red-200', icon: '🔴', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
};

const severityLabel = { info: '提示', warning: '注意', critical: '风险' };

interface Props {
  input: MoldCostInput;
}

export default function DfmAnalysis({ input }: Props) {
  const items = analyzeDfm(input);
  const hasCritical = items.some((i) => i.severity === 'critical');
  const hasWarning = items.some((i) => i.severity === 'warning');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <h3 className="text-base font-semibold text-gray-900">DFM 制造性分析</h3>
          <span className="text-[10px] bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-0.5 rounded-full font-medium">AI</span>
        </div>
        <div className="flex items-center gap-1.5">
          {hasCritical && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">有风险项</span>}
          {!hasCritical && hasWarning && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">有注意项</span>}
          {!hasCritical && !hasWarning && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">通过</span>}
        </div>
      </div>
      <div className="p-5 space-y-3">
        {items.map((item) => {
          const cfg = severityConfig[item.severity];
          return (
            <div key={item.id} className={`${cfg.bg} border ${cfg.border} rounded-lg p-3.5`}>
              <div className="flex items-start gap-2.5">
                <span className="text-base shrink-0 mt-0.5">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${cfg.text}`}>{item.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cfg.badge}`}>{severityLabel[item.severity]}</span>
                  </div>
                  <p className={`text-xs ${cfg.text} opacity-80 mb-1.5`}>{item.description}</p>
                  <p className={`text-xs ${cfg.text} font-medium`}>💡 {item.suggestion}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
