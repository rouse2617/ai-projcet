import type { SavedQuote } from './quoteStore';
import type { MoldCostInput } from './types';
import { calculateMoldCost } from './calculator';
import { extractFeatures } from './quoteStore';

const STORAGE_KEY = 'mold_quote_history';

function makeQuote(
  id: string, name: string, desc: string, daysAgo: number,
  overrides: Partial<MoldCostInput>
): SavedQuote {
  const input: MoldCostInput = {
    projectName: name, partDescription: desc,
    moldBaseType: 'standard', moldBaseBrand: 'lkm',
    moldBaseWidth: 400, moldBaseLength: 500, moldBaseHeight: 350, moldBasePrice: 8000,
    coreSteelGrade: '718', coreSteelPricePerKg: 45, coreWeight: 30,
    cavitySteelGrade: '718', cavitySteelPricePerKg: 45, cavityWeight: 25,
    numberOfCavities: 2,
    cncHours: 80, cncRate: 80, edmHours: 40, edmRate: 65,
    wireEdmHours: 20, wireEdmRate: 60, grindingHours: 15, grindingRate: 50,
    designHours: 40, designRate: 100, heatTreatmentCost: 2000,
    surfaceTreatmentType: 'none', surfaceTreatmentCost: 0,
    hotRunnerCost: 0, ejectorPinsCost: 800, springsCost: 300, otherStandardPartsCost: 500,
    trialCost: 3000, trialCount: 2, packagingCost: 1500,
    profitMargin: 20, taxRate: 13,
    ...overrides,
  };
  const result = calculateMoldCost(input);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    id, projectName: name, partDescription: desc,
    createdAt: date.toISOString(), input, result,
    features: extractFeatures(input, result.totalCost),
  };
}

/** 初始化示例数据（模架/模配场景，贴合五丰模配业务） */
export function initSampleData(): void {
  if (typeof window === 'undefined') return;
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return;

  const samples: SavedQuote[] = [
    // 标准模架
    makeQuote('sample_1', '标准模架 CI-2540', '龙记 CI 型标准模架 250×400', 60, {
      moldBaseBrand: 'lkm', moldBaseWidth: 250, moldBaseLength: 400, moldBaseHeight: 300,
      moldBasePrice: 4200, coreSteelGrade: 'p20', coreSteelPricePerKg: 25,
      coreWeight: 18, cavityWeight: 15, numberOfCavities: 1,
      cncHours: 25, edmHours: 0, wireEdmHours: 0, grindingHours: 10,
      designHours: 8, heatTreatmentCost: 0, trialCost: 0, trialCount: 0,
    }),
    // 非标模架
    makeQuote('sample_2', '非标模架 - 汽车连接器', '非标大型模架 500×700 含导柱导套', 45, {
      moldBaseBrand: 'custom', moldBaseWidth: 500, moldBaseLength: 700, moldBaseHeight: 450,
      moldBasePrice: 18000, coreSteelGrade: '718', coreSteelPricePerKg: 45,
      coreWeight: 85, cavityWeight: 70, numberOfCavities: 4,
      cncHours: 120, edmHours: 0, wireEdmHours: 15, grindingHours: 30,
      designHours: 24, heatTreatmentCost: 3500,
      ejectorPinsCost: 1500, otherStandardPartsCost: 2000,
      trialCost: 0, trialCount: 0,
    }),
    // 精料加工
    makeQuote('sample_3', '精料 718 块料', '718 精料 200×300×80 六面精磨', 30, {
      moldBaseBrand: 'custom', moldBaseWidth: 200, moldBaseLength: 300, moldBaseHeight: 80,
      moldBasePrice: 0, coreSteelGrade: '718', coreSteelPricePerKg: 45,
      coreWeight: 38, cavityWeight: 0, numberOfCavities: 1,
      cncHours: 15, edmHours: 0, wireEdmHours: 0, grindingHours: 20,
      designHours: 2, heatTreatmentCost: 1200,
      ejectorPinsCost: 0, springsCost: 0, otherStandardPartsCost: 0,
      trialCost: 0, trialCount: 0, packagingCost: 200,
    }),
    // 精光板
    makeQuote('sample_4', '精光板 S136 镜面', 'S136 精光板 250×350×50 镜面抛光', 20, {
      moldBaseBrand: 'custom', moldBaseWidth: 250, moldBaseLength: 350, moldBaseHeight: 50,
      moldBasePrice: 0, coreSteelGrade: 's136', coreSteelPricePerKg: 70,
      coreWeight: 34, cavityWeight: 0, numberOfCavities: 1,
      cncHours: 10, edmHours: 0, wireEdmHours: 0, grindingHours: 25,
      designHours: 2, heatTreatmentCost: 800,
      surfaceTreatmentType: 'polish_spi_a2', surfaceTreatmentCost: 3000,
      ejectorPinsCost: 0, springsCost: 0, otherStandardPartsCost: 0,
      trialCost: 0, trialCount: 0, packagingCost: 300,
    }),
    // 机械板加工
    makeQuote('sample_5', '设备机架底板加工', '45# 机械板 600×800×30 CNC铣面+钻孔', 15, {
      moldBaseBrand: 'custom', moldBaseWidth: 600, moldBaseLength: 800, moldBaseHeight: 30,
      moldBasePrice: 0, coreSteelGrade: '45steel', coreSteelPricePerKg: 8,
      coreWeight: 113, cavityWeight: 0, numberOfCavities: 1,
      cncHours: 35, edmHours: 0, wireEdmHours: 0, grindingHours: 8,
      designHours: 4, heatTreatmentCost: 0,
      ejectorPinsCost: 0, springsCost: 0, otherStandardPartsCost: 0,
      trialCost: 0, trialCount: 0, packagingCost: 500,
    }),
    // 铝板加工
    makeQuote('sample_6', '铝板 CNC 加工件', '6061 铝板 300×400×25 CNC精加工', 5, {
      moldBaseBrand: 'custom', moldBaseWidth: 300, moldBaseLength: 400, moldBaseHeight: 25,
      moldBasePrice: 0, coreSteelGrade: 'p20', coreSteelPricePerKg: 35,
      coreWeight: 8, cavityWeight: 0, numberOfCavities: 1,
      cncHours: 20, edmHours: 0, wireEdmHours: 5, grindingHours: 5,
      designHours: 6, heatTreatmentCost: 0,
      surfaceTreatmentType: 'sandblast', surfaceTreatmentCost: 800,
      ejectorPinsCost: 0, springsCost: 0, otherStandardPartsCost: 0,
      trialCost: 0, trialCount: 0, packagingCost: 200,
    }),
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
}
