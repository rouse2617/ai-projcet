'use client';

interface Props {
  children: React.ReactNode;
}

export default function ProTip({ children }: Props) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 flex gap-2">
      <span className="shrink-0">💡</span>
      <div>{children}</div>
    </div>
  );
}
