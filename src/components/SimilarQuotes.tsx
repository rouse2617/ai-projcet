'use client';

import type { SimilarMatch } from '@/lib/quoteStore';
import type { MoldCostInput } from '@/lib/types';
import { formatCNY } from '@/lib/format';

interface Props {
  matches: SimilarMatch[];
  onLoadQuote: (input: MoldCostInput) => void;
}

function getSimilarityColor(s: number): string {
  if (s >= 80) return 'text-green-600 bg-green-50';
  if (s >= 60) return 'text-yellow-600 bg-yellow-50';
  return 'text-orange-600 bg-orange-50';
}

function getSimilarityLabel(s: number): string {
  if (s >= 80) return '高度相似';
  if (s >= 60) return '较为相似';
  return '部分相似';
}

export default function SimilarQuotes({ matches, onLoadQuote }: Props) {
  if (matches.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">🔍</span>
        <h3 className="text-base font-semibold text-gray-900">相似件匹配</h3>
        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">AI 推荐</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        在你的历史报价中找到了 {matches.length} 个相似模具，可作为报价参考
      </p>

      <div className="space-y-3">
        {matches.map((match) => (
          <div
            key={match.quote.id}
            className="border border-gray-100 rounded-lg p-3 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {match.quote.projectName}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getSimilarityColor(match.similarity)}`}>
                    {match.similarity}% {getSimilarityLabel(match.similarity)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span>{match.quote.features.numberOfCavities}穴</span>
                  <span>{match.quote.input.coreSteelGrade.toUpperCase()}</span>
                  <span>{match.quote.features.moldBaseWidth}×{match.quote.features.moldBaseLength}mm</span>
                  <span>{match.quote.features.hasHotRunner ? '热流道' : '冷流道'}</span>
                  <span>{new Date(match.quote.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold text-gray-900">
                  {formatCNY(match.quote.result.totalCost)}
                </div>
                <div className={`text-xs ${match.priceDiff > 0 ? 'text-red-500' : match.priceDiff < 0 ? 'text-green-500' : 'text-gray-400'}`}>
                  {match.priceDiff > 0 ? '+' : ''}{formatCNY(match.priceDiff)}
                </div>
              </div>
            </div>
            <button
              onClick={() => onLoadQuote(match.quote.input)}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              加载此报价参数 →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
