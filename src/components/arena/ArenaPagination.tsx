import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface ArenaPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const ArenaPagination: React.FC<ArenaPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(totalItems, currentPage * itemsPerPage);

  // Generate page numbers to display (smart window around currentPage)
  const getVisiblePages = (): number[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }
    if (currentPage >= totalPages - 2) {
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col items-center gap-1.5 mt-2 select-none">
      {/* Range Status Label */}
      <div className="flex items-center gap-1.5 text-[10px] font-tech tracking-wider text-slate-400">
        <span>
          STAGES <span className="text-cyan-400 font-bold">{startIdx}–{endIdx}</span> OF{' '}
          <span className="text-white font-bold">{totalItems}</span>
        </span>
        <span className="text-slate-600">•</span>
        <span>
          PAGE <span className="text-cyan-400 font-bold">{currentPage}</span> / {totalPages}
        </span>
      </div>

      {/* Cyber Control Navigation Bar */}
      <div className="flex items-center gap-1.5 font-tech text-xs">
        {/* First Page Button (<<) */}
        {totalPages > 3 && (
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
            }}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-cyan-300 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
            title="First Page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Previous Page Button (<) */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
          }}
          className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Number Pills */}
        {visiblePages.map((pageNum) => {
          const isActive = currentPage === pageNum;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              style={
                isActive
                  ? {
                      backgroundColor: 'rgba(0, 247, 255, 0.22)',
                      border: '1.5px solid #00f7ff',
                      color: '#00f7ff',
                      boxShadow: '0 0 14px rgba(0, 247, 255, 0.5), inset 0 0 8px rgba(0, 247, 255, 0.2)',
                      borderRadius: '8px',
                    }
                  : {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1.5px solid rgba(255, 255, 255, 0.12)',
                      color: '#94a3b8',
                      borderRadius: '8px',
                    }
              }
              className="w-8 h-8 flex items-center justify-center font-bold transition-all cursor-pointer active:scale-95 hover:border-cyan-400 hover:text-cyan-300"
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Page Button (>) */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
          }}
          className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page Button (>>) */}
        {totalPages > 3 && (
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
            }}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-cyan-300 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
            title="Last Page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
