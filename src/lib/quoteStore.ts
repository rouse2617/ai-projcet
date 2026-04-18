import type { MoldCostInput, MoldCostResult } from './types';

/** 保存的报价记录 */
export interface SavedQuote {
  id: string;
  projectName: string;
  partDescription: string;
  createdAt: string;
  input: MoldCostInput;
  result: MoldCostResult;
  /** 用于相似度匹配的特征向量 */
  features: QuoteFeatures;
}

/** 用于相似度计算的关键特征 */
export interface QuoteFeatures {
  numberOfCavities: number;
  moldBaseWidth: number;
  moldBaseLength: number;
  coreWeight: number;
  cavityWeight: number;
  coreSteelGrade: string;
  hasHotRunner: boolean;
  surfaceTreatmentType: string;
  totalCncHours: number;
  totalCost: number;
}

/** 相似件匹配结果 */
export interface SimilarMatch {
  quote: SavedQuote;
  similarity: number; // 0-100
  priceDiff: number; // 与当前报价的差额
}

const STORAGE_KEY = 'mold_quote_history';

/** 从输入中提取特征 */
export function extractFeatures(input: MoldCostInput, totalCost: number): QuoteFeatures {
  return {
    numberOfCavities: input.numberOfCavities,
    moldBaseWidth: input.moldBaseWidth,
    moldBaseLength: input.moldBaseLength,
    coreWeight: input.coreWeight,
    cavityWeight: input.cavityWeight,
    coreSteelGrade: input.coreSteelGrade,
    hasHotRunner: input.hotRunnerCost > 0,
    surfaceTreatmentType: input.surfaceTreatmentType,
    totalCncHours: input.cncHours + input.edmHours + input.wireEdmHours,
    totalCost,
  };
}

/** 计算两个报价的相似度 (0-100) */
export function calculateSimilarity(a: QuoteFeatures, b: QuoteFeatures): number {
  let score = 0;
  let totalWeight = 0;

  // 穴数匹配 (权重 20)
  const cavityMatch = a.numberOfCavities === b.numberOfCavities ? 1 : 
    1 - Math.abs(a.numberOfCavities - b.numberOfCavities) / Math.max(a.numberOfCavities, b.numberOfCavities);
  score += cavityMatch * 20;
  totalWeight += 20;

  // 模架尺寸相似度 (权重 20)
  const widthRatio = Math.min(a.moldBaseWidth, b.moldBaseWidth) / Math.max(a.moldBaseWidth, b.moldBaseWidth);
  const lengthRatio = Math.min(a.moldBaseLength, b.moldBaseLength) / Math.max(a.moldBaseLength, b.moldBaseLength);
  score += ((widthRatio + lengthRatio) / 2) * 20;
  totalWeight += 20;

  // 模芯/模腔重量相似度 (权重 20)
  const totalWeightA = a.coreWeight + a.cavityWeight;
  const totalWeightB = b.coreWeight + b.cavityWeight;
  const weightRatio = totalWeightA > 0 && totalWeightB > 0
    ? Math.min(totalWeightA, totalWeightB) / Math.max(totalWeightA, totalWeightB)
    : 0;
  score += weightRatio * 20;
  totalWeight += 20;

  // 钢材匹配 (权重 15)
  score += (a.coreSteelGrade === b.coreSteelGrade ? 1 : 0.3) * 15;
  totalWeight += 15;

  // 热流道匹配 (权重 10)
  score += (a.hasHotRunner === b.hasHotRunner ? 1 : 0.2) * 10;
  totalWeight += 10;

  // 加工工时相似度 (权重 15)
  const hoursRatio = a.totalCncHours > 0 && b.totalCncHours > 0
    ? Math.min(a.totalCncHours, b.totalCncHours) / Math.max(a.totalCncHours, b.totalCncHours)
    : 0;
  score += hoursRatio * 15;
  totalWeight += 15;

  return Math.round((score / totalWeight) * 100);
}

/** 获取所有历史报价 */
export function getQuoteHistory(): SavedQuote[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/** 保存报价 */
export function saveQuote(input: MoldCostInput, result: MoldCostResult): SavedQuote {
  const quote: SavedQuote = {
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    projectName: input.projectName || `报价 #${getQuoteHistory().length + 1}`,
    partDescription: input.partDescription || '',
    createdAt: new Date().toISOString(),
    input,
    result,
    features: extractFeatures(input, result.totalCost),
  };

  const history = getQuoteHistory();
  history.unshift(quote);
  // 最多保留 200 条
  if (history.length > 200) history.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return quote;
}

/** 删除报价 */
export function deleteQuote(id: string): void {
  const history = getQuoteHistory().filter((q) => q.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/** 查找相似报价 */
export function findSimilarQuotes(
  input: MoldCostInput,
  currentTotalCost: number,
  limit = 5
): SimilarMatch[] {
  const history = getQuoteHistory();
  if (history.length === 0) return [];

  const currentFeatures = extractFeatures(input, currentTotalCost);

  return history
    .map((quote) => ({
      quote,
      similarity: calculateSimilarity(currentFeatures, quote.features),
      priceDiff: currentTotalCost - quote.result.totalCost,
    }))
    .filter((m) => m.similarity >= 40) // 至少 40% 相似度
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}
