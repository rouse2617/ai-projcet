import type {
  MoldCostInput,
  MoldCostResult,
  InjectionCostInput,
  InjectionCostResult,
  CostBreakdownItem,
} from './types';

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
];

/** 计算模具成本 */
export function calculateMoldCost(input: MoldCostInput): MoldCostResult {
  const moldBaseCost = input.moldBasePrice;
  const coreMaterialCost = input.coreWeight * input.coreSteelPricePerKg;
  const cavityMaterialCost = input.cavityWeight * input.cavitySteelPricePerKg;
  const totalMaterialCost = coreMaterialCost + cavityMaterialCost;

  const cncCost = input.cncHours * input.cncRate;
  const edmCost = input.edmHours * input.edmRate;
  const wireEdmCost = input.wireEdmHours * input.wireEdmRate;
  const grindingCost = input.grindingHours * input.grindingRate;
  const totalMachiningCost = cncCost + edmCost + wireEdmCost + grindingCost;

  const designCost = input.designHours * input.designRate;
  const heatTreatmentCost = input.heatTreatmentCost;
  const surfaceTreatmentCost = input.surfaceTreatmentCost;

  const hotRunnerCost = input.hotRunnerCost;
  const ejectorPinsCost = input.ejectorPinsCost;
  const springsCost = input.springsCost;
  const otherStandardPartsCost = input.otherStandardPartsCost;
  const totalStandardPartsCost =
    hotRunnerCost + ejectorPinsCost + springsCost + otherStandardPartsCost;

  const totalTrialCost = input.trialCost * input.trialCount;
  const packagingCost = input.packagingCost;

  const subtotal =
    moldBaseCost +
    totalMaterialCost +
    totalMachiningCost +
    designCost +
    heatTreatmentCost +
    surfaceTreatmentCost +
    totalStandardPartsCost +
    totalTrialCost +
    packagingCost;

  const profit = subtotal * (input.profitMargin / 100);
  const tax = (subtotal + profit) * (input.taxRate / 100);
  const totalCost = subtotal + profit + tax;

  // 构建明细
  const items: { name: string; cost: number }[] = [
    { name: '模架', cost: moldBaseCost },
    { name: '模芯材料', cost: coreMaterialCost },
    { name: '模腔材料', cost: cavityMaterialCost },
    { name: 'CNC加工', cost: cncCost },
    { name: '电火花(EDM)', cost: edmCost },
    { name: '线切割', cost: wireEdmCost },
    { name: '磨床', cost: grindingCost },
    { name: '设计', cost: designCost },
    { name: '热处理', cost: heatTreatmentCost },
    { name: '表面处理', cost: surfaceTreatmentCost },
    { name: '标准件', cost: totalStandardPartsCost },
    { name: '试模', cost: totalTrialCost },
    { name: '包装运输', cost: packagingCost },
  ].filter((i) => i.cost > 0);

  const breakdown: CostBreakdownItem[] = items.map((item, idx) => ({
    name: item.name,
    cost: item.cost,
    percentage: subtotal > 0 ? (item.cost / subtotal) * 100 : 0,
    color: COLORS[idx % COLORS.length],
  }));

  return {
    moldBaseCost,
    coreMaterialCost,
    cavityMaterialCost,
    totalMaterialCost,
    cncCost,
    edmCost,
    wireEdmCost,
    grindingCost,
    totalMachiningCost,
    designCost,
    heatTreatmentCost,
    surfaceTreatmentCost,
    hotRunnerCost,
    ejectorPinsCost,
    springsCost,
    otherStandardPartsCost,
    totalStandardPartsCost,
    totalTrialCost,
    packagingCost,
    subtotal,
    profit,
    tax,
    totalCost,
    breakdown,
  };
}

/** 计算注塑件成本 */
export function calculateInjectionCost(input: InjectionCostInput): InjectionCostResult {
  // 材料成本
  const partWeightKg = (input.partVolume * input.materialDensity) / 1000;
  const runnerWeightKg = (input.runnerVolume * input.materialDensity) / 1000;
  const regrindSaving = runnerWeightKg * (input.regrindRatio / 100) *
    (input.materialPricePerKg - input.regrindCostPerKg);
  const materialCostPerPart =
    (partWeightKg + runnerWeightKg) * input.materialPricePerKg - regrindSaving;

  // 机台成本
  const partsPerHour = (3600 / input.cycleTime) * input.numberOfCavities;
  const machineCostPerPart = partsPerHour > 0 ? input.machineHourlyRate / partsPerHour : 0;

  // 模具分摊
  const effectiveShots = input.moldLifeShots > 0 ? input.moldLifeShots : 1;
  const partsFromMold = effectiveShots * input.numberOfCavities;
  const moldCostPerPart = partsFromMold > 0 ? input.moldCost / partsFromMold : 0;

  // 后处理
  const postProcessingCostPerPart =
    input.postProcessingTime > 0
      ? (input.postProcessingTime / 3600) * input.postProcessingRate
      : 0;

  const packagingCostPerPart = input.packagingCostPerPart;

  // 考虑不良率
  const defectMultiplier = 1 + input.defectRate / 100;
  const adjustedMaterialCost = materialCostPerPart * defectMultiplier;
  const adjustedMachineCost = machineCostPerPart * defectMultiplier;

  const subtotalPerPart =
    adjustedMaterialCost +
    adjustedMachineCost +
    moldCostPerPart +
    postProcessingCostPerPart +
    packagingCostPerPart;

  const profitPerPart = subtotalPerPart * (input.profitMargin / 100);
  const totalCostPerPart = subtotalPerPart + profitPerPart;
  const totalProductionCost = totalCostPerPart * input.quantity;

  const items: { name: string; cost: number }[] = [
    { name: '材料', cost: adjustedMaterialCost },
    { name: '机台', cost: adjustedMachineCost },
    { name: '模具分摊', cost: moldCostPerPart },
    { name: '后处理', cost: postProcessingCostPerPart },
    { name: '包装', cost: packagingCostPerPart },
  ].filter((i) => i.cost > 0);

  const breakdown: CostBreakdownItem[] = items.map((item, idx) => ({
    name: item.name,
    cost: item.cost,
    percentage: subtotalPerPart > 0 ? (item.cost / subtotalPerPart) * 100 : 0,
    color: COLORS[idx % COLORS.length],
  }));

  return {
    materialCostPerPart: adjustedMaterialCost,
    machineCostPerPart: adjustedMachineCost,
    moldCostPerPart,
    postProcessingCostPerPart,
    packagingCostPerPart,
    subtotalPerPart,
    profitPerPart,
    totalCostPerPart,
    totalProductionCost,
    breakdown,
  };
}
