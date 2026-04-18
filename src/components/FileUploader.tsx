'use client';

import { useState, useRef } from 'react';
import type { ParseResult } from '@/lib/fileParser';
import { parseExcel, parse2DDrawing, parse3DModel } from '@/lib/fileParser';
import type { MoldCostInput } from '@/lib/types';

interface Props {
  onParseComplete: (params: Partial<MoldCostInput>) => void;
}

type UploadState = 'idle' | 'uploading' | 'analyzing' | 'done' | 'error';

const ACCEPT_MAP: Record<string, string[]> = {
  excel: ['.xlsx', '.xls', '.csv'],
  '2d': ['.pdf', '.dwg', '.dxf', '.png', '.jpg', '.jpeg', '.tif'],
  '3d': ['.step', '.stp', '.iges', '.igs', '.stl', '.x_t', '.x_b'],
};

const ALL_ACCEPT = [...ACCEPT_MAP.excel, ...ACCEPT_MAP['2d'], ...ACCEPT_MAP['3d']].join(',');

function detectFileType(name: string): 'excel' | '2d' | '3d' | null {
  const ext = '.' + name.split('.').pop()?.toLowerCase();
  if (ACCEPT_MAP.excel.includes(ext)) return 'excel';
  if (ACCEPT_MAP['2d'].includes(ext)) return '2d';
  if (ACCEPT_MAP['3d'].includes(ext)) return '3d';
  return null;
}

function getTypeLabel(type: string): string {
  if (type === 'excel') return 'Excel 报价模板';
  if (type === '2d') return '2D 图纸';
  return '3D 模型';
}

function getTypeIcon(type: string): string {
  if (type === 'excel') return '📊';
  if (type === '2d') return '📐';
  return '🧊';
}

function getConfidenceColor(c: number): string {
  if (c >= 90) return 'text-green-600 bg-green-50';
  if (c >= 75) return 'text-blue-600 bg-blue-50';
  return 'text-amber-600 bg-amber-50';
}

export default function FileUploader({ onParseComplete }: Props) {
  const [state, setState] = useState<UploadState>('idle');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const simulateProgress = (duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const steps = 20;
      const interval = duration / steps;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        setProgress(Math.min((step / steps) * 100, 95));
        if (step >= steps) { clearInterval(timer); resolve(); }
      }, interval);
    });
  };

  const handleFile = async (file: File) => {
    const type = detectFileType(file.name);
    if (!type) {
      setState('error');
      return;
    }

    setFileName(file.name);
    setFileType(type);
    setState('uploading');
    setProgress(0);

    // 模拟上传
    await simulateProgress(600);
    setState('analyzing');
    setProgress(0);

    let parsed: ParseResult;

    if (type === 'excel') {
      const buffer = await file.arrayBuffer();
      await simulateProgress(800);
      parsed = parseExcel(buffer);
    } else if (type === '2d') {
      await simulateProgress(1800);
      parsed = parse2DDrawing(file.name, file.size);
    } else {
      await simulateProgress(2500);
      parsed = parse3DModel(file.name, file.size);
    }

    setProgress(100);
    setResult(parsed);
    setState('done');
  };

  const handleApply = () => {
    if (result) {
      onParseComplete(result.params);
      // 不重置，保留结果展示
    }
  };

  const handleReset = () => {
    setState('idle');
    setResult(null);
    setFileName('');
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 标题栏 */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📁</span>
          <h3 className="text-base font-semibold text-gray-900">智能文件识别</h3>
          <span className="text-[10px] bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-0.5 rounded-full font-medium">AI</span>
        </div>
        {state === 'done' && (
          <button onClick={handleReset} className="text-xs text-gray-400 hover:text-gray-600">
            重新上传
          </button>
        )}
      </div>

      <div className="p-5">
        {state === 'idle' && (
          <>
            {/* 拖拽上传区 */}
            <label
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            >
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                <svg className="w-7 h-7 text-gray-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-1">拖拽文件到这里，或点击选择</p>
              <p className="text-xs text-gray-400">支持 Excel / 2D图纸 / 3D模型</p>
              <input
                ref={inputRef}
                type="file"
                accept={ALL_ACCEPT}
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </label>

            {/* 支持格式 */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">📊</span>
                <p className="text-xs font-medium text-gray-700 mt-1">Excel 报价模板</p>
                <p className="text-[10px] text-gray-400">.xlsx .xls .csv</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">📐</span>
                <p className="text-xs font-medium text-gray-700 mt-1">2D 图纸</p>
                <p className="text-[10px] text-gray-400">.pdf .dwg .dxf .png</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">🧊</span>
                <p className="text-xs font-medium text-gray-700 mt-1">3D 模型</p>
                <p className="text-[10px] text-gray-400">.step .iges .stl</p>
              </div>
            </div>
          </>
        )}

        {(state === 'uploading' || state === 'analyzing') && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
              <svg className="absolute inset-0 w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#3b82f6" strokeWidth="4"
                  strokeDasharray={`${175.9 * progress / 100} 175.9`}
                  className="transition-all duration-300" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">{fileType ? getTypeIcon(fileType) : '📁'}</span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">{fileName}</p>
            <p className="text-xs text-gray-500 mt-1">
              {state === 'uploading' ? '上传中...' : `AI 正在分析${fileType ? getTypeLabel(fileType) : '文件'}...`}
            </p>
            <div className="mt-3 w-48 mx-auto bg-gray-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {state === 'done' && result && (
          <div className="space-y-4">
            {/* 识别结果头部 */}
            <div className="flex items-center gap-3 bg-green-50 rounded-lg px-4 py-3">
              <span className="text-xl">{getTypeIcon(fileType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                <p className="text-xs text-green-600">
                  ✓ 成功识别 {result.extractedFields.length} 个参数
                </p>
              </div>
            </div>

            {/* 识别到的参数列表 */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {result.extractedFields.map((field, i) => (
                <div key={i} className="flex items-center justify-between text-sm px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-gray-700 font-medium shrink-0">{field.name}</span>
                    <span className="text-gray-900">{field.value}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getConfidenceColor(field.confidence)}`}>
                      {field.confidence}%
                    </span>
                    <span className="text-[10px] text-gray-400 hidden sm:inline max-w-32 truncate">{field.source}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 警告 */}
            {result.warnings.map((w, i) => (
              <div key={i} className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex gap-1.5">
                <span>⚠️</span><span>{w}</span>
              </div>
            ))}

            {/* 应用按钮 */}
            <button
              onClick={handleApply}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
            >
              ✨ 应用识别结果到计算器
            </button>
          </div>
        )}

        {state === 'error' && (
          <div className="py-8 text-center">
            <p className="text-sm text-red-600">不支持的文件格式</p>
            <button onClick={handleReset} className="mt-2 text-xs text-blue-600 hover:text-blue-800">重新选择</button>
          </div>
        )}
      </div>
    </div>
  );
}
