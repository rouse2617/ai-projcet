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

// ===== 2D 图纸模拟解析 =====

export function parse2DDrawing(fileName: string, fileSize: number): ParseResult {
  // Demo: 根据文件名和大小模拟智能识别
  const lower = fileName.toLowerCase();
  const extractedFields: ExtractedField[] = [];
  const params: Partial<MoldCostInput> = {};

  // 从文件名提取信息
  const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
  params.projectName = nameWithoutExt;
  extractedFields.push({ name: '项目名称', value: nameWithoutExt, confidence: 95, source: '文件名' });

  // 模拟 OCR 识别结果
  const sizeKB = fileSize / 1024;

  if (sizeKB > 500) {
    // 大文件 → 复杂模具
    params.numberOfCavities = 4;
    params.coreWeight = 55;
    params.cavityWeight = 48;
    params.moldBaseWidth = 500;
    params.moldBaseLength = 600;
    params.cncHours = 140;
    params.edmHours = 70;
    params.wireEdmHours = 35;
    params.designHours = 70;
    extractedFields.push(
      { name: '穴数', value: '4', confidence: 82, source: 'AI 图纸分析 - 型腔布局识别' },
      { name: '模具尺寸', value: '500×600mm', confidence: 78, source: 'AI 图纸分析 - 外形尺寸标注' },
      { name: '模芯重量', value: '55kg', confidence: 75, source: 'AI 图纸分析 - 体积估算' },
      { name: '模腔重量', value: '48kg', confidence: 75, source: 'AI 图纸分析 - 体积估算' },
      { name: 'CNC 工时', value: '140h', confidence: 70, source: 'AI 图纸分析 - 复杂度评估' },
      { name: 'EDM 工时', value: '70h', confidence: 68, source: 'AI 图纸分析 - 深腔/窄槽识别' },
    );
  } else {
    // 小文件 → 简单模具
    params.numberOfCavities = 2;
    params.coreWeight = 25;
    params.cavityWeight = 20;
    params.moldBaseWidth = 350;
    params.moldBaseLength = 450;
    params.cncHours = 65;
    params.edmHours = 30;
    params.wireEdmHours = 15;
    params.designHours = 30;
    extractedFields.push(
      { name: '穴数', value: '2', confidence: 85, source: 'AI 图纸分析 - 型腔布局识别' },
      { name: '模具尺寸', value: '350×450mm', confidence: 80, source: 'AI 图纸分析 - 外形尺寸标注' },
      { name: '模芯重量', value: '25kg', confidence: 72, source: 'AI 图纸分析 - 体积估算' },
      { name: '模腔重量', value: '20kg', confidence: 72, source: 'AI 图纸分析 - 体积估算' },
      { name: 'CNC 工时', value: '65h', confidence: 70, source: 'AI 图纸分析 - 复杂度评估' },
    );
  }

  // 模拟公差/表面识别
  if (lower.includes('mirror') || lower.includes('镜面') || lower.includes('透明')) {
    params.surfaceTreatmentType = 'polish_spi_a1';
    params.surfaceTreatmentCost = 5000;
    params.coreSteelGrade = 's136';
    params.coreSteelPricePerKg = 70;
    extractedFields.push(
      { name: '表面要求', value: '镜面抛光 SPI-A1', confidence: 88, source: 'AI 图纸分析 - 表面粗糙度标注' },
      { name: '推荐钢材', value: 'S136 (耐腐蚀/镜面)', confidence: 85, source: 'AI 智能推荐' },
    );
  }

  return {
    success: true,
    source: '2d',
    params,
    extractedFields,
    warnings: ['2D 图纸识别为 AI 辅助结果，建议人工复核关键参数'],
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
