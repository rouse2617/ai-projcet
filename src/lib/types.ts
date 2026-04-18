// ===== 模具成本计算器类型 =====

/** 钢材牌号 */
export interface SteelGrade {
  id: string;
  name: string;
  /** 元/kg */
  pricePerKg: number;
  /** 密度 g/cm³ */
  density: number;
  /** 适用场景 */
  usage: string;
}

/** 模架品牌 */
export interface MoldBaseSpec {
  id: string;
  brand: string;
  /** 宽 mm */
  width: number;
  /** 长 mm */
  length: number;
  /** 高 mm */
  height: number;
  /** 元 */
  price: number;
}

/** 加工工序 */
export interface MachiningProcess {
  id: string;
  name: string;
  /** 元/小时 */
  hourlyRate: number;
  /** 预估工时 */
  estimatedHours: number;
}

/** 模具成本输入参数 */
export interface MoldCostInput {
  // 基本信息
  projectName: string;
  partDescription: string;

  // 模架
  moldBaseType: 'standard' | 'custom';
  moldBaseBrand: string;
  moldBaseWidth: number;
  moldBaseLength: number;
  moldBaseHeight: number;
  moldBasePrice: number;

  // 模芯材料
  coreSteelGrade: string;
  coreSteelPricePerKg: number;
  coreWeight: number;

  cavitySteelGrade: string;
  cavitySteelPricePerKg: number;
  cavityWeight: number;

  // 穴数
  numberOfCavities: number;

  // 加工
  cncHours: number;
  cncRate: number;
  edmHours: number;
  edmRate: number;
  wireEdmHours: number;
  wireEdmRate: number;
  grindingHours: number;
  grindingRate: number;

  // 设计
  designHours: number;
  designRate: number;

  // 热处理
  heatTreatmentCost: number;

  // 表面处理
  surfaceTreatmentType: string;
  surfaceTreatmentCost: number;

  // 标准件
  hotRunnerCost: number;
  ejectorPinsCost: number;
  springsCost: number;
  otherStandardPartsCost: number;

  // 试模
  trialCost: number;
  trialCount: number;

  // 运输包装
  packagingCost: number;

  // 利润率
  profitMargin: number;

  // 税率
  taxRate: number;
}

/** 模具成本计算结果 */
export interface MoldCostResult {
  moldBaseCost: number;
  coreMaterialCost: number;
  cavityMaterialCost: number;
  totalMaterialCost: number;

  cncCost: number;
  edmCost: number;
  wireEdmCost: number;
  grindingCost: number;
  totalMachiningCost: number;

  designCost: number;
  heatTreatmentCost: number;
  surfaceTreatmentCost: number;

  hotRunnerCost: number;
  ejectorPinsCost: number;
  springsCost: number;
  otherStandardPartsCost: number;
  totalStandardPartsCost: number;

  totalTrialCost: number;
  packagingCost: number;

  subtotal: number;
  profit: number;
  tax: number;
  totalCost: number;

  /** 各项占比 */
  breakdown: CostBreakdownItem[];
}

export interface CostBreakdownItem {
  name: string;
  cost: number;
  percentage: number;
  color: string;
}

// ===== 注塑件成本计算器类型 =====

/** 塑料材料 */
export interface PlasticMaterial {
  id: string;
  name: string;
  /** 元/kg */
  pricePerKg: number;
  /** 密度 g/cm³ */
  density: number;
  /** 推荐壁厚 mm */
  recommendedWallThickness: number;
  /** 收缩率 % */
  shrinkageRate: number;
}

/** 注塑件成本输入 */
export interface InjectionCostInput {
  // 零件
  partVolume: number; // cm³
  materialId: string;
  materialPricePerKg: number;
  materialDensity: number;

  // 生产
  quantity: number;
  numberOfCavities: number;
  cycleTime: number; // 秒
  defectRate: number; // %

  // 机台
  machineClampForce: number; // 吨
  machineHourlyRate: number; // 元/小时

  // 水口
  runnerVolume: number; // cm³
  regrindRatio: number; // %
  regrindCostPerKg: number;

  // 后处理
  postProcessingTime: number; // 秒/件
  postProcessingRate: number; // 元/小时

  // 模具分摊
  moldCost: number;
  moldLifeShots: number;

  // 包装
  packagingCostPerPart: number;

  // 利润
  profitMargin: number;
}

/** 注塑件成本结果 */
export interface InjectionCostResult {
  materialCostPerPart: number;
  machineCostPerPart: number;
  moldCostPerPart: number;
  postProcessingCostPerPart: number;
  packagingCostPerPart: number;

  subtotalPerPart: number;
  profitPerPart: number;
  totalCostPerPart: number;

  totalProductionCost: number;

  breakdown: CostBreakdownItem[];
}
