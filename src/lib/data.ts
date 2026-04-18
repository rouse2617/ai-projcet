import type { SteelGrade, PlasticMaterial } from './types';

/** 常用模具钢材 */
export const steelGrades: SteelGrade[] = [
  { id: 'p20', name: 'P20 (3Cr2Mo)', pricePerKg: 25, density: 7.85, usage: '通用模架、大型模具' },
  { id: '718', name: '718 (3Cr2NiMo)', pricePerKg: 45, density: 7.85, usage: '精密模具、镜面抛光' },
  { id: '738', name: '738', pricePerKg: 40, density: 7.85, usage: '大型精密模具' },
  { id: 'nak80', name: 'NAK80', pricePerKg: 80, density: 7.85, usage: '高镜面、免热处理' },
  { id: 's136', name: 'S136 (4Cr13)', pricePerKg: 70, density: 7.70, usage: '耐腐蚀、透明件模具' },
  { id: 'h13', name: 'H13 (4Cr5MoSiV1)', pricePerKg: 55, density: 7.85, usage: '热作模具、压铸模' },
  { id: '8407', name: '8407', pricePerKg: 120, density: 7.80, usage: '高端热作模具' },
  { id: '2344', name: '2344', pricePerKg: 90, density: 7.80, usage: '热作模具、耐高温' },
  { id: 'dc53', name: 'DC53', pricePerKg: 65, density: 7.85, usage: '冷作模具、高韧性' },
  { id: 'skd11', name: 'SKD11 (Cr12MoV)', pricePerKg: 35, density: 7.70, usage: '冷作模具、冲压模' },
  { id: 'skd61', name: 'SKD61', pricePerKg: 60, density: 7.76, usage: '热作模具、铝压铸' },
  { id: '45steel', name: '45# 碳钢', pricePerKg: 8, density: 7.85, usage: '模架、非关键部件' },
];

/** 常用模架品牌及参考价 */
export const moldBaseBrands = [
  { id: 'lkm', name: '龙记 (LKM)', priceMultiplier: 1.0 },
  { id: 'futaba', name: '双叶 (Futaba)', priceMultiplier: 1.3 },
  { id: 'mingli', name: '明利', priceMultiplier: 0.85 },
  { id: 'changhui', name: '昌辉', priceMultiplier: 0.8 },
  { id: 'custom', name: '自制模架', priceMultiplier: 0.7 },
];

/** 默认加工费率 (元/小时) */
export const defaultMachiningRates = {
  cnc: 80,
  edm: 65,
  wireEdm: 60,
  grinding: 50,
  design: 100,
};

/** 表面处理类型 */
export const surfaceTreatments = [
  { id: 'none', name: '无', baseCost: 0 },
  { id: 'polish_spi_a1', name: '镜面抛光 SPI-A1', baseCost: 5000 },
  { id: 'polish_spi_a2', name: '精抛光 SPI-A2', baseCost: 3000 },
  { id: 'polish_spi_b1', name: '细抛光 SPI-B1', baseCost: 2000 },
  { id: 'texture_mt', name: '蚀纹 (MT)', baseCost: 4000 },
  { id: 'texture_vdi', name: '蚀纹 (VDI)', baseCost: 3500 },
  { id: 'sandblast', name: '喷砂', baseCost: 1500 },
  { id: 'chrome', name: '镀铬', baseCost: 6000 },
  { id: 'nitriding', name: '氮化处理', baseCost: 3000 },
];

/** 常用塑料材料 */
export const plasticMaterials: PlasticMaterial[] = [
  { id: 'abs', name: 'ABS', pricePerKg: 15, density: 1.05, recommendedWallThickness: 2.0, shrinkageRate: 0.5 },
  { id: 'pp', name: 'PP (聚丙烯)', pricePerKg: 10, density: 0.91, recommendedWallThickness: 1.5, shrinkageRate: 1.5 },
  { id: 'pe', name: 'PE (聚乙烯)', pricePerKg: 11, density: 0.95, recommendedWallThickness: 1.5, shrinkageRate: 2.0 },
  { id: 'pc', name: 'PC (聚碳酸酯)', pricePerKg: 30, density: 1.20, recommendedWallThickness: 2.0, shrinkageRate: 0.6 },
  { id: 'pa6', name: 'PA6 (尼龙6)', pricePerKg: 22, density: 1.13, recommendedWallThickness: 1.5, shrinkageRate: 1.2 },
  { id: 'pa66', name: 'PA66 (尼龙66)', pricePerKg: 28, density: 1.14, recommendedWallThickness: 1.5, shrinkageRate: 1.5 },
  { id: 'pom', name: 'POM (聚甲醛)', pricePerKg: 20, density: 1.41, recommendedWallThickness: 1.5, shrinkageRate: 2.0 },
  { id: 'pet', name: 'PET', pricePerKg: 18, density: 1.38, recommendedWallThickness: 2.0, shrinkageRate: 0.4 },
  { id: 'pmma', name: 'PMMA (亚克力)', pricePerKg: 25, density: 1.19, recommendedWallThickness: 2.0, shrinkageRate: 0.5 },
  { id: 'pps', name: 'PPS', pricePerKg: 80, density: 1.35, recommendedWallThickness: 1.5, shrinkageRate: 0.5 },
  { id: 'peek', name: 'PEEK', pricePerKg: 600, density: 1.30, recommendedWallThickness: 2.0, shrinkageRate: 1.2 },
  { id: 'tpe', name: 'TPE', pricePerKg: 25, density: 1.10, recommendedWallThickness: 2.0, shrinkageRate: 1.0 },
  { id: 'pvc', name: 'PVC', pricePerKg: 12, density: 1.40, recommendedWallThickness: 2.0, shrinkageRate: 0.5 },
  { id: 'pc_abs', name: 'PC/ABS', pricePerKg: 28, density: 1.12, recommendedWallThickness: 2.0, shrinkageRate: 0.5 },
];

/** 注塑机吨位参考 */
export const machineSpecs = [
  { clampForce: 50, hourlyRate: 40 },
  { clampForce: 80, hourlyRate: 55 },
  { clampForce: 120, hourlyRate: 70 },
  { clampForce: 160, hourlyRate: 85 },
  { clampForce: 200, hourlyRate: 100 },
  { clampForce: 250, hourlyRate: 120 },
  { clampForce: 350, hourlyRate: 150 },
  { clampForce: 500, hourlyRate: 200 },
  { clampForce: 650, hourlyRate: 260 },
  { clampForce: 800, hourlyRate: 320 },
  { clampForce: 1000, hourlyRate: 400 },
  { clampForce: 1300, hourlyRate: 520 },
  { clampForce: 1600, hourlyRate: 650 },
  { clampForce: 2000, hourlyRate: 800 },
];
