import type { SavedQuote } from './quoteStore';
import type { MoldCostInput } from './types';
import { calculateMoldCost } from './calculator';
import { extractFeatures } from './quoteStore';

const STORAGE_KEY = 'mold_quote_history';

function makeQuote(
  id: string,
  name: string,
  desc: string,
  daysAgo: number,
  overrides: Partial<MoldCostInput>
): SavedQuote {
  const input: MoldCostInput = {
    projectName: name,
    partDescription: desc,
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
    numberOfCavities: 2,
    cncHours: 80,
    cncRate: 80,
    edmHours: 40,
    edmRate: 65,
    wireEdmHours: 20,
    wireEdmRate: 60,
    grindingHours: 15,
    grindingRate: 50,
    designHours: 40,
    designRate: 100,
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
    ...overrides,
  };
  const result = calculateMoldCost(input);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    id,
    projectName: name,
    partDescription: desc,
    createdAt: date.toISOString(),
    input,
    result,
    features: extractFeatures(input, result.totalCost),
  };
}

/** 初始化示例数据（仅在历史为空时） */
export function initSampleData(): void {
  if (typeof window === 'undefined') return;
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return; // 已有数据，不覆盖

  const samples: SavedQuote[] = [
    makeQuote('sample_1', '汽车灯罩外壳模具', '前大灯透镜外壳', 45, {
      coreSteelGrade: 's136', coreSteelPricePerKg: 70, coreWeight: 35, cavityWeight: 30,
      numberOfCavities: 2, cncHours: 100, edmHours: 50, wireEdmHours: 25,
      surfaceTreatmentType: 'polish_spi_a1', surfaceTreatmentCost: 5000,
      moldBaseWidth: 450, moldBaseLength: 550, moldBasePrice: 10000,
    }),
    makeQuote('sample_2', '手机后盖模具', 'PC+ABS 手机后盖', 30, {
      coreSteelGrade: 'nak80', coreSteelPricePerKg: 80, coreWeight: 20, cavityWeight: 18,
      numberOfCavities: 4, cncHours: 120, edmHours: 60, wireEdmHours: 30,
      surfaceTreatmentType: 'texture_mt', surfaceTreatmentCost: 4000,
      hotRunnerCost: 18000, moldBaseWidth: 400, moldBaseLength: 500, moldBasePrice: 12000,
      designHours: 60,
    }),
    makeQuote('sample_3', '家电遥控器上盖', 'ABS 遥控器上壳', 20, {
      coreWeight: 12, cavityWeight: 10, numberOfCavities: 2,
      cncHours: 50, edmHours: 25, wireEdmHours: 12,
      moldBaseWidth: 300, moldBaseLength: 400, moldBasePrice: 5500,
      designHours: 25, trialCount: 1,
    }),
    makeQuote('sample_4', '医疗器械外壳模具', '高精度医疗设备壳体', 15, {
      coreSteelGrade: 's136', coreSteelPricePerKg: 70, coreWeight: 45, cavityWeight: 40,
      numberOfCavities: 1, cncHours: 160, edmHours: 80, wireEdmHours: 40, grindingHours: 25,
      surfaceTreatmentType: 'polish_spi_a2', surfaceTreatmentCost: 3000,
      moldBaseWidth: 500, moldBaseLength: 600, moldBasePrice: 15000,
      designHours: 80, heatTreatmentCost: 3500, trialCount: 3,
    }),
    makeQuote('sample_5', '玩具车身模具', 'PP 玩具车外壳', 10, {
      coreSteelGrade: 'p20', coreSteelPricePerKg: 25, coreWeight: 25, cavityWeight: 20,
      numberOfCavities: 2, cncHours: 60, edmHours: 30, wireEdmHours: 15,
      moldBaseWidth: 350, moldBaseLength: 450, moldBasePrice: 6000,
      designHours: 30, trialCount: 2,
    }),
    makeQuote('sample_6', '电器开关面板模具', 'PC 开关面板', 5, {
      coreWeight: 18, cavityWeight: 15, numberOfCavities: 4,
      cncHours: 90, edmHours: 45, wireEdmHours: 22,
      hotRunnerCost: 12000, moldBaseWidth: 380, moldBaseLength: 480, moldBasePrice: 9000,
      surfaceTreatmentType: 'texture_vdi', surfaceTreatmentCost: 3500,
      designHours: 45,
    }),
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
}
