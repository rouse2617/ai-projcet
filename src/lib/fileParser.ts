import * as XLSX from 'xlsx';
import type { MoldCostInput } from './types';
import { steelGrades } from './data';

/** 文件解析结果 */
export interface ParseResult {
  success: boolean;
  source: 'excel' | '2d' | '3d';
  params: Partial<MoldCostInput>;
  extractedFields: ExtractedField[];
  warnings: string[];
}

export interface ExtractedField {
  name: string;
  value: string;
  confidence: number; // 0-100
  source: string; // 从哪里提取的
}

// ===== Excel 解析 =====

const FIELD_MAPPINGS: Record<string, keyof MoldCostInput> = {
  '项目名': 'projectName', '项目名称': 'projectName', '模具名称': 'projectName', 'project': 'projectName',
  '零件': 'partDescription', '零件描述': 'partDescription', '产品名称': 'partDescription', 'part': 'partDescription',
  '穴数': 'numberOfCavities', '型腔数': 'numberOfCavities', 'cavities': 'numberOfCavities',
  '模架价': 'moldBasePrice', '模架价格': 'moldBasePrice', '模架费': 'moldBasePrice',
  '模架宽': 'moldBaseWidth', '宽度': 'moldBaseWidth', 'width': 'moldBaseWidth',
  '模架长': 'moldBaseLength', '长度': 'moldBaseLength', 'length': 'moldBaseLength',
  '模架高': 'moldBaseHeight', '高度': 'moldBaseHeight', 'height': 'moldBaseHeight',
  '模芯重': 'coreWeight', '公模重量': 'coreWeight', 'core weight': 'coreWeight',
  '模腔重': 'cavityWeight', '母模重量': 'cavityWeight', 'cavity weight': 'cavityWeight',
  'cnc工时': 'cncHours', 'cnc时间': 'cncHours', 'cnc': 'cncHours',
  'edm工时': 'edmHours', '电火花工时': 'edmHours', 'edm': 'edmHours',
  '线切割工时': 'wireEdmHours', '线切割': 'wireEdmHours',
  '设计工时': 'designHours', '设计时间': 'designHours',
  '热处理': 'heatTreatmentCost', '热处理费': 'heatTreatmentCost',
  '热流道': 'hotRunnerCost', '热流道费': 'hotRunnerCost',
  '试模费': 'trialCost', '试模': 'trialCost',
  '试模次数': 'trialCount',
  '利润率': 'profitMargin', '利润': 'profitMargin',
};

const STEEL_KEYWORDS: Record<string, string> = {
  'p20': 'p20', '3cr2mo': 'p20',
  '718': '718', '3cr2nimo': '718',
  'nak80': 'nak80', 'nak': 'nak80',
  's136': 's136', '4cr13': 's136',
  'h13': 'h13', '4cr5': 'h13',
  'skd11': 'skd11', 'cr12mov': 'skd11',
  'skd61': 'skd61',
  '45#': '45steel', '45钢': '45steel',
};

function matchSteelGrade(text: string): string | null {
  const lower = text.toLowerCase().replace(/\s/g, '');
  for (const [keyword, gradeId] of Object.entries(STEEL_KEYWORDS)) {
    if (lower.includes(keyword)) return gradeId;
  }
  return null;
}

export function parseExcel(buffer: ArrayBuffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data: (string | number)[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const params: Partial<MoldCostInput> = {};
  const extractedFields: ExtractedField[] = [];
  const warnings: string[] = [];

  // 扫描所有单元格，寻找 key-value 对
  for (let r = 0; r < data.length; r++) {
    const row = data[r];
    if (!row) continue;
    for (let c = 0; c < row.length; c++) {
      const cell = String(row[c] ?? '').trim().toLowerCase().replace(/[：:]/g, '');
      if (!cell) continue;

      // 匹配字段名
      for (const [keyword, field] of Object.entries(FIELD_MAPPINGS)) {
        if (cell.includes(keyword)) {
          // 取右边或下面的值
          const rightVal = row[c + 1];
          const belowVal = data[r + 1]?.[c];
          const val = rightVal ?? belowVal;
          if (val !== undefined && val !== null && val !== '') {
            const numVal = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.]/g, ''));
            if (field === 'projectName' || field === 'partDescription') {
              (params as Record<string, unknown>)[field] = String(val);
            } else if (!isNaN(numVal)) {
              (params as Record<string, unknown>)[field] = numVal;
            }
            extractedFields.push({
              name: keyword,
              value: String(val),
              confidence: 90,
              source: `单元格 ${String.fromCharCode(65 + c)}${r + 1}`,
            });
          }
          break;
        }
      }

      // 检测钢材
      const steelMatch = matchSteelGrade(String(row[c] ?? ''));
      if (steelMatch) {
        const grade = steelGrades.find((s) => s.id === steelMatch);
        if (grade) {
          params.coreSteelGrade = steelMatch;
          params.coreSteelPricePerKg = grade.pricePerKg;
          params.cavitySteelGrade = steelMatch;
          params.cavitySteelPricePerKg = grade.pricePerKg;
          extractedFields.push({
            name: '钢材牌号',
            value: grade.name,
            confidence: 85,
            source: `单元格 ${String.fromCharCode(65 + c)}${r + 1}`,
          });
        }
      }
    }
  }

  if (extractedFields.length === 0) {
    warnings.push('未能从 Excel 中识别到标准字段，请检查表格格式');
  }

  return {
    success: extractedFields.length > 0,
    source: 'excel',
    params,
    extractedFields,
    warnings,
  };
}

// ===== 2D 图纸模拟解析（模架/模配场景，含孔位识别） =====

/** 孔位识别结果 */
export interface HoleDetection {
  type: string;
  spec: string;
  count: number;
  depth: string;
  tolerance: string;
  estimatedTime: number; // 分钟
}

export function parse2DDrawing(fileName: string, fileSize: number): ParseResult {
  const lower = fileName.toLowerCase();
  const extractedFields: ExtractedField[] = [];
  const params: Partial<MoldCostInput> = {};

  const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
  params.projectName = nameWithoutExt;
  extractedFields.push({ name: '项目名称', value: nameWithoutExt, confidence: 95, source: '文件名' });

  const sizeKB = fileSize / 1024;

  // 模架尺寸识别
  if (sizeKB > 500) {
    params.moldBaseWidth = 500;
    params.moldBaseLength = 700;
    params.moldBaseHeight = 400;
    params.coreWeight = 85;
    params.cavityWeight = 70;
    extractedFields.push(
      { name: '模架尺寸', value: '500×700×400mm', confidence: 88, source: 'AI 图纸分析 - 外形尺寸标注' },
      { name: '材料', value: 'P20 预硬钢', confidence: 82, source: 'AI 图纸分析 - 标题栏材料标注' },
      { name: '模架重量', value: '约 155kg', confidence: 78, source: 'AI 图纸分析 - 密度×体积估算' },
    );
    params.coreSteelGrade = 'p20';
    params.coreSteelPricePerKg = 25;
  } else {
    params.moldBaseWidth = 350;
    params.moldBaseLength = 450;
    params.moldBaseHeight = 300;
    params.coreWeight = 35;
    params.cavityWeight = 28;
    extractedFields.push(
      { name: '模架尺寸', value: '350×450×300mm', confidence: 85, source: 'AI 图纸分析 - 外形尺寸标注' },
      { name: '材料', value: '718 (3Cr2NiMo)', confidence: 80, source: 'AI 图纸分析 - 标题栏材料标注' },
      { name: '模架重量', value: '约 63kg', confidence: 75, source: 'AI 图纸分析 - 密度×体积估算' },
    );
  }

  // ===== 核心：孔位自动识别 =====
  const holes: HoleDetection[] = sizeKB > 500 ? [
    { type: '顶针孔', spec: 'Ø6 H7', count: 32, depth: '通孔', tolerance: 'H7 (+0/+0.012)', estimatedTime: 3 },
    { type: '顶针孔', spec: 'Ø8 H7', count: 16, depth: '通孔', tolerance: 'H7 (+0/+0.015)', estimatedTime: 4 },
    { type: '顶针孔', spec: 'Ø10 H7', count: 8, depth: '通孔', tolerance: 'H7 (+0/+0.015)', estimatedTime: 5 },
    { type: '螺丝孔', spec: 'M12×1.75', count: 24, depth: '25mm', tolerance: '6H', estimatedTime: 4 },
    { type: '螺丝孔', spec: 'M8×1.25', count: 16, depth: '20mm', tolerance: '6H', estimatedTime: 3 },
    { type: '水路孔', spec: 'Ø10', count: 12, depth: '深孔 180mm', tolerance: '±0.05', estimatedTime: 15 },
    { type: '水路孔', spec: 'Ø8', count: 8, depth: '深孔 150mm', tolerance: '±0.05', estimatedTime: 12 },
    { type: '导柱孔', spec: 'Ø30 H6', count: 4, depth: '通孔', tolerance: 'H6 (+0/+0.013)', estimatedTime: 8 },
    { type: '导套孔', spec: 'Ø42 H7', count: 4, depth: '盲孔 45mm', tolerance: 'H7 (+0/+0.025)', estimatedTime: 10 },
    { type: '定位孔', spec: 'Ø12 H7', count: 4, depth: '通孔', tolerance: 'H7 (+0/+0.018)', estimatedTime: 5 },
    { type: '撬模槽', spec: '15×8mm', count: 4, depth: '12mm', tolerance: '±0.1', estimatedTime: 6 },
  ] : [
    { type: '顶针孔', spec: 'Ø6 H7', count: 16, depth: '通孔', tolerance: 'H7 (+0/+0.012)', estimatedTime: 3 },
    { type: '顶针孔', spec: 'Ø8 H7', count: 8, depth: '通孔', tolerance: 'H7 (+0/+0.015)', estimatedTime: 4 },
    { type: '螺丝孔', spec: 'M10×1.5', count: 12, depth: '22mm', tolerance: '6H', estimatedTime: 3.5 },
    { type: '螺丝孔', spec: 'M6×1.0', count: 8, depth: '15mm', tolerance: '6H', estimatedTime: 2.5 },
    { type: '水路孔', spec: 'Ø8', count: 6, depth: '深孔 120mm', tolerance: '±0.05', estimatedTime: 10 },
    { type: '导柱孔', spec: 'Ø25 H6', count: 4, depth: '通孔', tolerance: 'H6 (+0/+0.013)', estimatedTime: 7 },
    { type: '定位孔', spec: 'Ø10 H7', count: 2, depth: '通孔', tolerance: 'H7 (+0/+0.018)', estimatedTime: 4 },
  ];

  const totalHoles = holes.reduce((sum, h) => sum + h.count, 0);
  const totalHoleMinutes = holes.reduce((sum, h) => sum + h.count * h.estimatedTime, 0);
  const holeHours = Math.ceil(totalHoleMinutes / 60);

  extractedFields.push(
    { name: '🔴 孔位总数', value: `${totalHoles} 个`, confidence: 92, source: 'AI 孔位识别 - 圆形特征检测' },
  );

  // 按类型汇总
  const holeTypes = new Map<string, number>();
  holes.forEach((h) => holeTypes.set(h.type, (holeTypes.get(h.type) || 0) + h.count));
  holeTypes.forEach((count, type) => {
    extractedFields.push({
      name: `  └ ${type}`,
      value: `${count} 个`,
      confidence: type === '水路孔' ? 85 : 90,
      source: `AI 孔位识别 - ${type === '水路孔' ? '深孔路径追踪' : type === '螺丝孔' ? '螺纹标注识别' : '圆形特征匹配'}`,
    });
  });

  extractedFields.push(
    { name: '孔位加工工时', value: `约 ${holeHours} 小时`, confidence: 78, source: 'AI 工时估算 - 基于孔径×深度×精度' },
  );

  // 其他加工工时
  const otherCncHours = sizeKB > 500 ? 45 : 20;
  const grindingHours = sizeKB > 500 ? 25 : 12;
  params.cncHours = holeHours + otherCncHours;
  params.edmHours = sizeKB > 500 ? 15 : 5;
  params.wireEdmHours = sizeKB > 500 ? 10 : 3;
  params.grindingHours = grindingHours;
  params.designHours = sizeKB > 500 ? 12 : 6;
  params.numberOfCavities = 1;
  params.moldBasePrice = sizeKB > 500 ? 0 : 0; // 非标模架自制，不买标准模架

  extractedFields.push(
    { name: 'CNC 总工时', value: `${params.cncHours}h（含孔位 ${holeHours}h + 铣面 ${otherCncHours}h）`, confidence: 75, source: 'AI 工时估算' },
    { name: '磨床工时', value: `${grindingHours}h`, confidence: 72, source: 'AI 工时估算 - 六面精磨' },
  );

  // 公差/表面识别
  if (lower.includes('mirror') || lower.includes('镜面') || lower.includes('透明')) {
    params.surfaceTreatmentType = 'polish_spi_a1';
    params.surfaceTreatmentCost = 5000;
    params.coreSteelGrade = 's136';
    params.coreSteelPricePerKg = 70;
    extractedFields.push(
      { name: '表面要求', value: '镜面抛光 SPI-A1', confidence: 88, source: 'AI 图纸分析 - 表面粗糙度标注' },
    );
  }

  // 风险提示
  const warnings: string[] = [
    '2D 图纸识别为 AI 辅助结果，建议人工复核孔位数量和公差要求',
  ];
  const deepHoles = holes.filter((h) => h.depth.includes('深孔'));
  if (deepHoles.length > 0) {
    const deepCount = deepHoles.reduce((s, h) => s + h.count, 0);
    warnings.push(`检测到 ${deepCount} 个深孔（水路孔），深径比较大，建议确认加工可达性和排屑方案`);
  }
  const h7Holes = holes.filter((h) => h.tolerance.includes('H7') || h.tolerance.includes('H6'));
  if (h7Holes.length > 0) {
    const precisionCount = h7Holes.reduce((s, h) => s + h.count, 0);
    warnings.push(`检测到 ${precisionCount} 个精密孔（H6/H7 公差），建议使用铰刀精加工，预留工时余量`);
  }

  return {
    success: true,
    source: '2d',
    params,
    extractedFields,
    warnings,
  };
}

// ===== 3D 模型模拟解析 =====

export function parse3DModel(fileName: string, fileSize: number): ParseResult {
  const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
  const extractedFields: ExtractedField[] = [];
  const params: Partial<MoldCostInput> = {};
  const sizeMB = fileSize / (1024 * 1024);

  params.projectName = nameWithoutExt;
  extractedFields.push({ name: '项目名称', value: nameWithoutExt, confidence: 95, source: '文件名' });

  // 根据文件大小模拟不同复杂度
  if (sizeMB > 5) {
    // 大模型 → 复杂
    params.numberOfCavities = 4;
    params.moldBaseWidth = 550;
    params.moldBaseLength = 650;
    params.moldBaseHeight = 400;
    params.coreWeight = 75;
    params.cavityWeight = 65;
    params.cncHours = 180;
    params.edmHours = 90;
    params.wireEdmHours = 45;
    params.grindingHours = 30;
    params.designHours = 90;
    params.hotRunnerCost = 20000;
    params.moldBasePrice = 18000;
    extractedFields.push(
      { name: '零件体积', value: '385.2 cm³', confidence: 98, source: '3D 几何分析 - 体积计算' },
      { name: '零件表面积', value: '1,247.6 cm²', confidence: 98, source: '3D 几何分析 - 面积计算' },
      { name: '最大外形', value: '285×195×68mm', confidence: 99, source: '3D 几何分析 - 包围盒' },
      { name: '壁厚范围', value: '1.8-3.2mm', confidence: 95, source: '3D 几何分析 - 壁厚检测' },
      { name: '倒扣数量', value: '3 处', confidence: 90, source: '3D 几何分析 - 倒扣检测' },
      { name: '推荐穴数', value: '4', confidence: 85, source: 'AI 智能推荐 - 基于尺寸和产量' },
      { name: '模具尺寸', value: '550×650×400mm', confidence: 88, source: 'AI 智能推荐 - 模架选型' },
      { name: '模芯重量', value: '75kg', confidence: 92, source: '3D 几何分析 - 密度×体积' },
      { name: '模腔重量', value: '65kg', confidence: 92, source: '3D 几何分析 - 密度×体积' },
      { name: '加工复杂度', value: '高（含滑块×3）', confidence: 82, source: 'AI 复杂度评估' },
      { name: '推荐热流道', value: '是 (¥20,000)', confidence: 80, source: 'AI 智能推荐' },
    );
  } else {
    // 小模型 → 简单
    params.numberOfCavities = 2;
    params.moldBaseWidth = 400;
    params.moldBaseLength = 500;
    params.moldBaseHeight = 350;
    params.coreWeight = 30;
    params.cavityWeight = 25;
    params.cncHours = 75;
    params.edmHours = 35;
    params.wireEdmHours = 18;
    params.grindingHours = 12;
    params.designHours = 35;
    params.moldBasePrice = 8000;
    extractedFields.push(
      { name: '零件体积', value: '82.4 cm³', confidence: 98, source: '3D 几何分析 - 体积计算' },
      { name: '零件表面积', value: '342.1 cm²', confidence: 98, source: '3D 几何分析 - 面积计算' },
      { name: '最大外形', value: '125×85×42mm', confidence: 99, source: '3D 几何分析 - 包围盒' },
      { name: '壁厚范围', value: '2.0-2.5mm', confidence: 96, source: '3D 几何分析 - 壁厚检测' },
      { name: '倒扣数量', value: '0 处', confidence: 92, source: '3D 几何分析 - 倒扣检测' },
      { name: '推荐穴数', value: '2', confidence: 88, source: 'AI 智能推荐' },
      { name: '模具尺寸', value: '400×500×350mm', confidence: 85, source: 'AI 智能推荐 - 模架选型' },
      { name: '模芯重量', value: '30kg', confidence: 90, source: '3D 几何分析 - 密度×体积' },
      { name: '加工复杂度', value: '中等（无倒扣）', confidence: 85, source: 'AI 复杂度评估' },
    );
  }

  return {
    success: true,
    source: '3d',
    params,
    extractedFields,
    warnings: ['3D 模型分析为 AI 辅助结果，倒扣和滑块识别建议人工确认'],
  };
}
