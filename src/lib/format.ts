/** 格式化人民币 */
export function formatCNY(value: number): string {
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** 格式化百分比 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
