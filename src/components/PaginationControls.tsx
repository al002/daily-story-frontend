'use client';

import Link from "next/link";

interface PaginationControlsProps {
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  basePath: string; // e.g., "/stories"
}

export default function PaginationControls({
  currentPage,
  hasNextPage,
  hasPreviousPage,
  basePath,
}: PaginationControlsProps) {
  const buttonClass = "px-3 py-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors";
  const disabledClass = "text-stone-300 cursor-not-allowed";

  return (
    <div className="flex justify-between items-center mt-8 pt-4 border-t border-stone-100">
      <Link
        href={`${basePath}?page=${currentPage - 1}`}
        className={`${buttonClass} ${!hasPreviousPage && disabledClass}`}
        aria-disabled={!hasPreviousPage}
        onClick={(e) => !hasPreviousPage && e.preventDefault()}
      >
        ← 上一页
      </Link>

      <span className="text-sm text-stone-400">第 {currentPage} 页</span>

      <Link
        href={`${basePath}?page=${currentPage + 1}`}
        className={`${buttonClass} ${!hasNextPage && disabledClass}`}
        aria-disabled={!hasNextPage}
        onClick={(e) => !hasNextPage && e.preventDefault()}
      >
        下一页 →
      </Link>
    </div>
  );
}
