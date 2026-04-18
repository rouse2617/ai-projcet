'use client';

export interface ComplexityPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  cncHours: number;
  edmHours: number;
  wireEdmHours: number;
  grindingHours: number;
  designHours: number;
  heatTreatmentCost: number;
  trialCount: number;
  moldBasePrice: number;
  coreWeight: number;
  cavityWeight: number;
}

export const complexityPresets: ComplexityPreset[] = [
  {
    id: 'simple',
    name: '简单模具',
    description: '无滑块、无斜顶、单穴、直浇口',
    icon: '🟢',
    cncHours: 40, edmHours: 15, wireEdmHours: 8, grindingHours: 8,
    designHours: 20, heatTreatmentCost: 1000, trialCount: 1,
    moldBasePrice: 5000, coreWeight: 15, cavityWeight: 12,
  },
  {
    id: 'medium',
    name: '中等模具',
    description: '1-2个滑块、侧浇口、2穴',
    icon: '🟡',
    cncHours: 80, edmHours: 40, wireEdmHours: 20, grindingHours: 15,
    designHours: 40, heatTreatmentCost: 2000, trialCount: 2,
    moldBasePrice: 8000, coreWeight: 30, cavityWeight: 25,
  },
  {
    id: 'complex',
    name: '复杂模具',
    description: '多滑块、斜顶、热流道、4穴',
    icon: '🔴',
    cncHours: 150, edmHours: 80, wireEdmHours: 40, grindingHours: 25,
    designHours: 80, heatTreatmentCost: 4000, trialCount: 3,
    moldBasePrice: 15000, coreWeight: 60, cavityWeight: 50,
  },
  {
    id: 'precision',
    name: '精密模具',
    description: '高精度、多型腔、复杂冷却、热流道',
    icon: '💎',
    cncHours: 250, edmHours: 120, wireEdmHours: 60, grindingHours: 40,
    designHours: 120, heatTreatmentCost: 6000, trialCount: 4,
    moldBasePrice: 25000, coreWeight: 100, cavityWeight: 80,
  },
];

interface Props {
  selected: string;
  onSelect: (preset: ComplexityPreset) => void;
}

export default function ComplexitySelector({ selected, onSelect }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-1">⚡ 快速选择模具复杂度</h3>
      <p className="text-xs text-gray-400 mb-4">选择后自动填充参考参数，你可以在下方继续调整</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {complexityPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset)}
            className={`text-left rounded-lg border-2 p-3 transition-all hover:shadow-md ${
              selected === preset.id
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">{preset.icon}</div>
            <div className="text-sm font-semibold text-gray-900">{preset.name}</div>
            <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{preset.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
